import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cartItem.entity';
import { Customer } from '../entities/customerDetails.entity';
import { Products } from '../entities/products.entity';
import { Stores } from '../entities/stores.entity';
import { User } from '../entities/user.entity';
import { In, Repository } from 'typeorm';
import { AddToCartDto, UpdateCartItemsDto, AddToFavouriteDto, AddFavToCartDto } from './dto/cart.dto';
import { AddCardDto, UpdateCardDto } from './dto/payment-method.dto';
import { UserPaymentMethod } from '../entities/userPaymentMethod.entity';
import { CardBrand } from '../common/enums/card.enum';
import { ShopProduct } from '../entities/shopProducts.entity';
import { Favourites } from '../entities/favourites.entity';
import { ProductStatus } from '../common/enums/product.enum';
import { formatCartResponse, formatShopProduct } from '../utils/formatter.utils';
import { ProductResponseDto } from '../shop-products/dto/shop-product.dto';
import { CreateCustomerAddressDto, TogglePrimaryAddressDto, UpdateAddressDto, UpdateCustomerProfileDto } from './dto/customer.dto';
import { CustomerAddress } from '../entities/customerAddress.entity';
import { EmployeeStatus } from '../common/enums/employee.enum';
import { PaginationDto } from '../common/common-dtos/pagination.dto';
import { CacheService } from '../upstash_redis/cache.service';
import { Category } from '../entities/categories.entity';

@Injectable()
export class CustomerService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Stores)
        private readonly storeRepo: Repository<Stores>,
        @InjectRepository(Products)
        private readonly productRepo: Repository<Products>,
        @InjectRepository(ShopProduct)
        private readonly shopProductRepo: Repository<ShopProduct>,
        @InjectRepository(Cart)
        private readonly cartRepository: Repository<Cart>,
        @InjectRepository(CartItem)
        private readonly cartItemRepository: Repository<CartItem>,
        @InjectRepository(UserPaymentMethod)
        private readonly paymentMethodRepo: Repository<UserPaymentMethod>,
        @InjectRepository(Favourites)
        private readonly favRepo: Repository<Favourites>,
        @InjectRepository(Customer)
        private readonly customerRepo: Repository<Customer>,
        @InjectRepository(CustomerAddress)
        private readonly customerAddressRepo: Repository<CustomerAddress>,
        @InjectRepository(Category)
        private readonly categoryRepo: Repository<Category>,
        private readonly cacheService: CacheService,
    ) { }

    // private async getRandomProducts(limit: number): Promise<ProductResponseDto[]> {
    //     const shopProducts = await this.shopProductRepo.query(
    //         `SELECT * FROM public.get_random_shop_products($1)`,
    //         [limit]
    //     )
    //     return ProductResponseDto.fromQueryList(shopProducts)
    // }


    async getCateoriesByStore(storeIds: string[]): Promise<any> {
        if (!storeIds || storeIds.length === 0) {
            return []
        }
        const getStoreCategories = await this.categoryRepo.query(
            `SELECT * FROM public.fun_get_store_categories($1)`,
            [
                storeIds
            ]
        );
        return getStoreCategories
    }


    private async getCustomerPrimaryAddress(user: User): Promise<CustomerAddress | null> {

        const cachedAddress = await this.cacheService.getCachedCustomerAddress(user.id);
        if (cachedAddress) {
            return cachedAddress;
        }
        const customer = await this.customerRepo.findOne({
            where: { user: { id: user.id, is_verified: true, status: EmployeeStatus.ACTIVE } }
        });

        if (!customer) return null;

        const primaryAddress = await this.customerAddressRepo.findOne({
            where: {
                customer: { id: customer.id },
                is_primary: true,
                is_active: true,
                is_deleted: false
            }
        });

        if (!primaryAddress || primaryAddress.latitude === null || primaryAddress.longitude === null) {
            return null;
        }
        await this.cacheService.cacheCustomerAddress(user.id, primaryAddress);
        return primaryAddress;
    }

    private async findNearbyStores(
        customerLat: number,
        customerLng: number,
        isStoreDetailsNeeded: boolean = false,
        radiusKm: number = Number(process.env.NEARBY_STORES_RADIUS ?? 50)
    ): Promise<any[]> {
        // cache nearby stores
        const cacheKey = `nearby_stores:${customerLat}:${customerLng}:${radiusKm}:${isStoreDetailsNeeded}`;
        const cachedStores = await this.cacheService.get<any[]>(cacheKey);
        if (cachedStores) {
            return cachedStores;
        }
        const baseSelect = isStoreDetailsNeeded
            ? `id, store_name, store_address, store_logo, is_deleted, latitude, longitude`
            : `id`;

        const query = `
            SELECT ${baseSelect},
                   (6371 * acos(
                       cos(radians($1)) * cos(radians(latitude)) * 
                       cos(radians(longitude) - radians($2)) + 
                       sin(radians($1)) * sin(radians(latitude))
                   )) AS distance
            FROM stores 
            WHERE is_deleted = false 
              AND latitude IS NOT NULL 
              AND longitude IS NOT NULL
              AND (6371 * acos(
                      cos(radians($1)) * cos(radians(latitude)) * 
                      cos(radians(longitude) - radians($2)) + 
                      sin(radians($1)) * sin(radians(latitude))
                  )) <= $3
            ORDER BY distance ASC;
        `;

        const nearbyStores = await this.storeRepo.query(query, [customerLat, customerLng, radiusKm]);

        let result;
        if (isStoreDetailsNeeded) {
            result = nearbyStores.map(store => ({
                id: store.id,
                store_name: store.store_name,
                store_address: store.store_address,
                store_logo: store.store_logo,
                is_deleted: store.is_deleted,
                latitude: store.latitude,
                longitude: store.longitude,
                distance: Number(store.distance?.toFixed(2))
            }));
        } else {
            result = nearbyStores.map(store => store.id);
        }

        // Cache the result for 10 minutes
        await this.cacheService.set(cacheKey, result, { ttl: 600 });

        return result;
    }

    private async getProductsFromNearbyStores(
        user: User,
        limit: number,
        page: number = 1
    ): Promise<{ data: ProductResponseDto[]; total: number; page: number; limit: number }> {
        try {
            const primaryAddress = await this.getCustomerPrimaryAddress(user);

            if (!primaryAddress) {
                return {
                    data: [],
                    total: 0,
                    page: Number(page),
                    limit: Number(limit)
                };
            }

            const nearbyStoreIds = await this.findNearbyStores(
                primaryAddress.latitude,
                primaryAddress.longitude
            );

            if (nearbyStoreIds.length === 0) {
                return {
                    data: [],
                    total: 0,
                    page: Number(page),
                    limit: Number(limit)
                };
            }

            const offset = (page - 1) * limit;

            const shopProducts = await this.shopProductRepo.query(
                `SELECT * FROM public.fun_get_shop_products_by_stores($1, $2, $3)`,
                [nearbyStoreIds, limit, offset]
            );

            const total = shopProducts.length > 0 ? Number(shopProducts[0]?.total_count || 0) : 0;

            const productsWithoutTotal = shopProducts.map(({ total_count, ...rest }) => rest);
            const data = ProductResponseDto.fromQueryList(productsWithoutTotal);

            return {
                data,
                total,
                page: Number(page),
                limit: Number(limit)
            };
        } catch (error) {
            console.error('Error in getProductsFromNearbyStores:', error);
            return {
                data: [],
                total: 0,
                page: Number(page),
                limit: Number(limit)
            };
        }
    }

    private async getProductsFromStore(
        user: User,
        storeId: string,
        limit: number,
        page: number = 1
    ): Promise<{ data: ProductResponseDto[]; total: number; page: number; limit: number }> {
        try {
            // const primaryAddress = await this.getCustomerPrimaryAddress(user);

            if (!storeId) {
                return {
                    data: [],
                    total: 0,
                    page: Number(page),
                    limit: Number(limit)
                };
            }

            const offset = (page - 1) * limit;

            const shopProducts = await this.shopProductRepo.query(
                `SELECT * FROM public.fun_get_store_products($1, $2, $3)`,
                [storeId, limit, offset]
            );

            const total = shopProducts.length > 0 ? Number(shopProducts[0]?.total_count || 0) : 0;

            const productsWithoutTotal = shopProducts.map(({ total_count, ...rest }) => rest);
            const data = ProductResponseDto.fromQueryList(productsWithoutTotal);

            return {
                data,
                total,
                page: Number(page),
                limit: Number(limit)
            };
        } catch (error) {
            console.error('Error in getProductsFromStore:', error);
            return {
                data: [],
                total: 0,
                page: Number(page),
                limit: Number(limit)
            };
        }
    }

    async updateCustomerProfile(user: User, dto: UpdateCustomerProfileDto): Promise<any> {
        const findUserWithCustomerDetails = await this.userRepo.findOne({
            where: {
                id: user.id,
                role: user.role,
                is_verified: true
            }, relations: ['customer']
        });
        if (!findUserWithCustomerDetails || !findUserWithCustomerDetails.customer) {
            throw new NotFoundException('Customer details not found. Please complete profile.');
        };
        if (dto.email && dto.email !== findUserWithCustomerDetails.email) {
            const emailTaken = await this.userRepo.findOne({ where: { email: dto.email } });
            if (emailTaken) throw new ConflictException("Email already in use");
        }
        if (dto.username && dto.username !== findUserWithCustomerDetails.username) {
            const usernameTaken = await this.userRepo.findOne({ where: { username: dto.username } });
            if (usernameTaken) throw new ConflictException('Username already in use.');
        }
        // Update User fields if provided
        if (dto.first_name !== undefined) findUserWithCustomerDetails.first_name = dto.first_name;
        if (dto.last_name !== undefined) findUserWithCustomerDetails.last_name = dto.last_name;
        if (dto.email !== undefined) {
            findUserWithCustomerDetails.email = dto.email;
            findUserWithCustomerDetails.is_email_verified = false;
        }
        if (dto.username !== undefined) findUserWithCustomerDetails.username = dto.username;
        if (dto.phone_number !== undefined) {
            findUserWithCustomerDetails.phone_number = dto.phone_number;
            findUserWithCustomerDetails.is_phone_verified = false;
        }

        // Update Customer fields if provided
        const customerDetailsProfile: Customer = findUserWithCustomerDetails.customer;
        // if (dto.address_1 !== undefined) customerDetailsProfile.address_1 = dto.address_1;
        // if (dto.address_2 !== undefined) customerDetailsProfile.address_2 = dto.address_2;
        // if (dto.country !== undefined) customerDetailsProfile.country = dto.country;
        // if (dto.state !== undefined) customerDetailsProfile.state = dto.state;
        // if (dto.city !== undefined) customerDetailsProfile.city = dto.city;
        await Promise.all([
            this.userRepo.save(findUserWithCustomerDetails),
            this.customerRepo.save(customerDetailsProfile),
        ]);
        const { password, ...userWithoutPassword } = findUserWithCustomerDetails;
        return {
            message: 'Profile updated successfully',
            data: userWithoutPassword,
        };

    }

    async addCardDetails(user: User, dto: AddCardDto): Promise<any> {
        const existingCard = await this.paymentMethodRepo.findOne({
            where: {
                card_number: dto.card_number,
                is_deleted: false
            }
        });
        if (existingCard) throw new BadRequestException("This card already exists");
        const createCard = this.paymentMethodRepo.create({
            ...dto,
            card_brand: CardBrand.VISA,
            user
        });
        return await this.paymentMethodRepo.save(createCard);
    }

    async updateCardDetails(user: User, dto: UpdateCardDto): Promise<any> {
        const existingCard = await this.paymentMethodRepo.findOne({
            where: {
                id: dto.card_id,
                user: { id: user.id },
                is_deleted: false
            }
        });
        if (!existingCard) throw new NotFoundException("Card not found");
        if (dto.card_number && dto.card_number !== existingCard.card_number) {
            const duplicate = await this.paymentMethodRepo.findOne({
                where: { card_number: dto.card_number, is_deleted: false }
            });
            if (duplicate) {
                throw new BadRequestException('This card number already exists');
            }
        }

        Object.assign(existingCard, dto);
        return await this.paymentMethodRepo.save(existingCard);
    }

    async getUserCards(user: User): Promise<any> {
        const getCards = await this.paymentMethodRepo.find({
            where: { user: { id: user.id }, is_deleted: false }
        });
        return getCards.map(({ ...rest }) => rest);
    }

    async deleteCard(user: User, id: string): Promise<any> {
        const findCard = await this.paymentMethodRepo.findOne({
            where: {
                id,
                is_deleted: false,
                user: { id: user.id }
            }
        });
        if (!findCard) throw new NotFoundException("Card not found");
        findCard.is_deleted = true
        await this.paymentMethodRepo.save(findCard);
        return {
            message: "Card deleted successfully"
        }
    }

    async getCardDetails(user: User, id: string): Promise<UserPaymentMethod> {
        const getCardDetail = await this.paymentMethodRepo.findOne({
            where: {
                is_deleted: false,
                id,
                user: { id: user.id }
            }, relations: ['user']
        });
        if (!getCardDetail) throw new NotFoundException("Card not found");
        return getCardDetail
    }

    async listAllStores(_user: User): Promise<Stores[]> {
        const primaryAddress = await this.getCustomerPrimaryAddress(_user);
        if (!primaryAddress) {
            return [];
        }
        const nearbyStores = await this.findNearbyStores(
            primaryAddress.latitude,
            primaryAddress.longitude,
            true,
        );
        return nearbyStores;
    }

    async storeDetails(_user: User, id: string): Promise<Stores> {
        const findStore = await this.storeRepo.createQueryBuilder('store')
            .leftJoinAndSelect('store.shop_products', 'shopProduct', 'shopProduct.is_deleted = :shopProductDeleted', { shopProductDeleted: false })
            .leftJoinAndSelect('shopProduct.product', 'product', 'product.is_deleted = :productDeleted', { productDeleted: false })
            .leftJoinAndSelect('product.images', 'images', 'images.is_deleted = false')
            .where('store.id = :id', { id })
            .andWhere('store.is_deleted = false')
            .getOne();
        if (!findStore) throw new NotFoundException("Store not found");
        const { shop_products, ...findShop } = findStore
        return {
            ...findShop, shop_products: shop_products.map(item => formatShopProduct(item))
        }
    }

    async getOrCreateCart(user: User): Promise<Cart> {
        const findUser = await this.userRepo.findOne({
            where: {
                id: user.id
            }, relations: ['customer']
        });
        if (!findUser) throw new NotFoundException("User not found");
        if (!findUser.customer?.id) throw new NotFoundException("Customer not found");

        const customerId = findUser.customer.id;
        const cachedCart = await this.cacheService.getCachedCart(customerId);
        if (cachedCart) {
            return cachedCart;
        }
        let cart = await this.cartRepository.findOne({
            where: {
                customer: {
                    id: customerId
                }
            }, relations: ['cart_items', 'customer', 'cart_items.shop_product.product']
        });

        if (!cart) {
            cart = this.cartRepository.create({
                customer: {
                    id: customerId
                }
            });
            cart = await this.cartRepository.save(cart);
            cart.cart_items = [];
        }
        if (!cart.cart_items) {
            cart.cart_items = [];
        }

        // Cache the cart for 30 minutes
        await this.cacheService.cacheCart(customerId, cart, 1800);

        return cart;
    }

    async addToCart(dto: AddToCartDto, user: User): Promise<any> {
        const { shop_product_id, quantity } = dto;
        const getUserCart = await this.getOrCreateCart(user);

        // Get customer ID from cart for cache invalidation
        let customerId: string | undefined = getUserCart.customer?.id;
        if (!customerId) {
            const findUser = await this.userRepo.findOne({
                where: { id: user.id },
                relations: ['customer']
            });
            customerId = findUser?.customer?.id;
        }
        if (!customerId) {
            throw new NotFoundException("Customer not found");
        }
        // TypeScript now knows customerId is string after the check
        const finalCustomerId: string = customerId;

        const getShopProduct = await this.shopProductRepo.findOne({
            where: {
                id: shop_product_id,
                is_deleted: false,
                is_available: true
            }
        });
        if (!getShopProduct) throw new NotFoundException("Shop Product not found");
        if (!getShopProduct.is_available) throw new BadRequestException('Product is not available');
        if (getShopProduct.stock <= 0) throw new BadRequestException('Product is out of stock');
        let existingItem = await this.cartItemRepository.findOne({
            where: {
                cart: {
                    id: getUserCart.id,
                },
                shop_product: {
                    id: getShopProduct.id
                }
            }
        });
        const currentQty = existingItem?.quantity ?? 0;
        const requestedTotal = currentQty + quantity;
        if (requestedTotal > getShopProduct.stock) {
            const canAdd = Math.max(getShopProduct.stock - currentQty, 0);
            if (canAdd <= 0) {
                throw new BadRequestException(`Only ${getShopProduct.stock} units available. You already have ${currentQty} in cart.`);
            }
            throw new BadRequestException(`You can add only ${canAdd} more units (stock limit).`);
        }
        if (existingItem) {
            existingItem.quantity += quantity;
            await this.cartItemRepository.save(existingItem);
        } else {
            const cartItem = this.cartItemRepository.create({
                cart: getUserCart,
                shop_product: getShopProduct,
                quantity
            });
            await this.cartItemRepository.save(cartItem);
        };

        // Invalidate cart cache
        await this.cacheService.invalidateCart(finalCustomerId);
        await this.cacheService.del(`cart:formatted:${finalCustomerId}`);

        const updatedCart = await this.cartRepository.findOne({
            where: { id: getUserCart.id },
            relations: ['cart_items', 'customer', 'cart_items.shop_product.product']
        });
        if (!updatedCart) return null;

        // Ensure cart_items is always an array
        if (!updatedCart.cart_items) {
            updatedCart.cart_items = [];
        }

        // Update cache with new cart data
        await this.cacheService.cacheCart(finalCustomerId, updatedCart, 1800);
        const formattedCart = formatCartResponse(updatedCart, true);
        await this.cacheService.set(`cart:formatted:${finalCustomerId}`, formattedCart, { ttl: 900 });

        return formatCartResponse(updatedCart, true)
    }

    async getUserCart(user: User) {
        const findUser = await this.userRepo.findOne({
            where: { id: user.id },
            relations: ['customer']
        });
        if (!findUser?.customer?.id) throw new NotFoundException("Customer not found");

        const customerId = findUser.customer.id;

        // Try to get formatted cart from cache
        const cacheKey = `cart:formatted:${customerId}`;
        const cachedFormattedCart = await this.cacheService.get(cacheKey);
        if (cachedFormattedCart) {
            return cachedFormattedCart;
        }

        // If not in cache, get cart and format it
        const cart = await this.getOrCreateCart(user);
        const formattedCart = formatCartResponse(cart, true);

        // Cache the formatted cart for 15 minutes (shorter TTL for formatted response)
        await this.cacheService.set(cacheKey, formattedCart, { ttl: 900 });

        return formattedCart;
    }

    async updateCartItem(user: User, dto: UpdateCartItemsDto) {
        const cart = await this.getOrCreateCart(user);

        // Get customer ID from cart for cache invalidation
        let customerId: string | undefined = cart.customer?.id;
        if (!customerId) {
            const findUser = await this.userRepo.findOne({
                where: { id: user.id },
                relations: ['customer']
            });
            customerId = findUser?.customer?.id;
        }
        if (!customerId) {
            throw new NotFoundException("Customer not found");
        }
        // TypeScript now knows customerId is string after the check
        const finalCustomerId: string = customerId;

        for (const item of dto.items) {
            const sp = await this.shopProductRepo.findOne({ where: { id: item.shop_product_id, is_deleted: false, is_available: true } });
            if (!sp) throw new NotFoundException('Shop Product not found');
            if (sp.stock <= 0) {
                throw new BadRequestException('Product is out of stock');
            }
            if (item.quantity > sp.stock) {
                throw new BadRequestException(`Only ${sp.stock} units available for this product.`);
            }
            const existingItem = await this.cartItemRepository.findOne({
                where: {
                    cart: { id: cart.id },
                    shop_product: { id: item.shop_product_id },
                },
            });

            if (existingItem) {
                existingItem.quantity = item.quantity;
                await this.cartItemRepository.save(existingItem);
            }
        }

        // Invalidate cart cache
        await this.cacheService.invalidateCart(finalCustomerId);
        await this.cacheService.del(`cart:formatted:${finalCustomerId}`);

        const updatedCart = await this.cartRepository.findOne({
            where: { id: cart.id },
            relations: ['cart_items', 'customer', 'cart_items.shop_product.product'],
        });
        if (!updatedCart) return null;

        // Ensure cart_items is always an array
        if (!updatedCart.cart_items) {
            updatedCart.cart_items = [];
        }

        // Update cache with new cart data
        await this.cacheService.cacheCart(finalCustomerId, updatedCart, 1800);
        const formattedCart = formatCartResponse(updatedCart, true);
        await this.cacheService.set(`cart:formatted:${finalCustomerId}`, formattedCart, { ttl: 900 });

        return formatCartResponse(updatedCart, true);
    }

    async removeCartItem(cartItemId: string, user: User) {
        const cart = await this.getOrCreateCart(user);

        // Get customer ID from cart for cache invalidation
        let customerId: string | undefined = cart.customer?.id;
        if (!customerId) {
            const findUser = await this.userRepo.findOne({
                where: { id: user.id },
                relations: ['customer']
            });
            customerId = findUser?.customer?.id;
        }
        if (!customerId) {
            throw new NotFoundException("Customer not found");
        }
        // TypeScript now knows customerId is string after the check
        const finalCustomerId: string = customerId;

        const cartItem = await this.cartItemRepository.findOne({
            where: {
                id: cartItemId,
                cart: { id: cart.id }
            }
        });

        if (!cartItem) throw new NotFoundException('Cart item not found');

        await this.cartItemRepository.remove(cartItem);

        // Invalidate cart cache
        await this.cacheService.invalidateCart(finalCustomerId);
        await this.cacheService.del(`cart:formatted:${finalCustomerId}`);

        const updatedCart = await this.cartRepository.findOne({
            where: { id: cart.id },
            relations: ['cart_items', 'customer', 'cart_items.shop_product.product'],
        });

        if (!updatedCart) return null;

        // Ensure cart_items is always an array
        if (!updatedCart.cart_items) {
            updatedCart.cart_items = [];
        }

        // Update cache with new cart data
        await this.cacheService.cacheCart(finalCustomerId, updatedCart, 1800);
        const formattedCart = formatCartResponse(updatedCart, true);
        await this.cacheService.set(`cart:formatted:${finalCustomerId}`, formattedCart, { ttl: 900 });

        return formatCartResponse(updatedCart, true);
    }

    async toggleFav(user: User, dto: AddToFavouriteDto): Promise<any> {
        const shopProduct = await this.shopProductRepo.findOne({
            where: {
                id: dto.shop_product_id
            }, relations: ['store', 'product']
        });
        if (!shopProduct) throw new NotFoundException("Shop product not found");
        const checkProductStatus = await this.productRepo.findOne({
            where: {
                id: shopProduct.product.id,
                status: ProductStatus.APPROVED
            }
        });
        if (!checkProductStatus) throw new BadRequestException("Product not found");
        const existingFav = await this.favRepo.findOne({
            where: {
                user: { id: user?.id },
                shop_product: { id: dto.shop_product_id }
            }
        });
        if (existingFav) {
            // toggle logic
            existingFav.is_fav = !existingFav.is_fav
            return this.favRepo.save(existingFav);
        } else {
            // new insert
            const newFav = this.favRepo.create({
                user,
                shop_product: { id: dto.shop_product_id },
                store: { id: shopProduct.store.id },
                is_fav: true
            });
            return this.favRepo.save(newFav);
        }
    }

    async addFavoritesToCart(user: User, dto: AddFavToCartDto): Promise<any> {
        // 1. Fetch fav products
        const favs = await this.favRepo.find({
            where: {
                user: { id: user.id },
                is_fav: true,
                ...(dto?.shop_product_ids?.length ? { shop_product: { id: In(dto.shop_product_ids) } } : {})
            },
            relations: ['shop_product'],
        });

        if (!favs.length) {
            return { message: "No favorite shop products found" };
        }

        // 2. Add fav products to cart by using addToCart service
        for (const fav of favs) {
            if (!fav.shop_product) continue;
            await this.addToCart({ shop_product_id: fav.shop_product.id, quantity: 1 }, user);
        }

        return {
            meesage: "Favourite products added to the cart successfully"
        };
    }

    async getFavItems(user: User): Promise<any> {
        const getFavs = await this.favRepo.find({
            where: {
                user: { id: user.id },
                is_fav: true
            }, relations: ['shop_product.product']
        });
        return getFavs.map((fav) => ({
            favourite_item_id: fav.id,
            is_fav: fav.is_fav,
            shop_product: formatShopProduct(fav.shop_product),
            created_at: fav.created_at,
            updated_at: fav.updated_at,
        }));
    }

    async getBestSelling(user: User, storeId: string, limit = 5, page = 1) {
        return this.getProductsFromStore(user, storeId, limit, page);
    }

    async getFrequentlySearched(user: User, storeId: string, limit = 5, page = 1) {
        return this.getProductsFromStore(user, storeId, limit, page);
    }

    async getExclusiveOffers(user: User, storeId: string, limit = 5, page = 1) {
        return this.getProductsFromStore(user, storeId, limit, page);
    }

    async getProductsFromNearbyStoresPaginated(
        user: User,
        paginationDto: PaginationDto
    ): Promise<{ data: ProductResponseDto[]; total: number; page: number; limit: number }> {
        const { page = 1, limit = 10 } = paginationDto;
        return this.getProductsFromNearbyStores(user, limit, page);
    }

    async createCustomerAddress(_user: User, dto: CreateCustomerAddressDto) {
        const customer = await this.customerRepo.findOne({ where: { id: dto.customer_id } });
        if (!customer) throw new NotFoundException('Customer not found');

        // If this address is marked as primary, unset previous primary
        if (dto.is_primary) {
            await this.customerAddressRepo.update(
                { customer: { id: dto.customer_id }, is_primary: true },
                { is_primary: false }
            );
        }

        const newAddress = this.customerAddressRepo.create({ ...dto, customer: { id: dto.customer_id } });
        return await this.customerAddressRepo.save(newAddress);
    }

    async updateCustomerAddress(_user: User, dto: UpdateAddressDto) {
        const address = await this.customerAddressRepo.findOne({ where: { id: dto.address_id, customer: { id: dto.customer_id }, is_deleted: false }, relations: ['customer'] });
        if (!address) throw new NotFoundException(`Address with id ${dto.address_id} not found`);
        if (dto.is_primary === true) {
            await this.customerAddressRepo.update(
                { customer: { id: address.customer.id } },
                { is_primary: false },
            );
        }
        Object.assign(address, dto);
        return await this.customerAddressRepo.save(address);
    }

    async getAllAddresses(user: User): Promise<CustomerAddress[]> {
        const getCustomer = await this.customerRepo.findOne({
            where: { user: { id: user.id, is_verified: true, status: EmployeeStatus.ACTIVE } }
        });
        if (!getCustomer) throw new BadRequestException("Customer not found");
        const findAddresses = await this.customerAddressRepo.find({
            where: { is_deleted: false, is_active: true, customer: { id: getCustomer.id } }
        });
        return findAddresses
    }

    async deleteAddress(user: User, id: string): Promise<any> {
        const getCustomer = await this.customerRepo.findOne({
            where: { user: { id: user.id, is_verified: true, status: EmployeeStatus.ACTIVE } },
        });

        if (!getCustomer) throw new BadRequestException("Customer not found");

        const result = await this.customerAddressRepo
            .createQueryBuilder('customer_address')
            .update()
            .set({ is_deleted: true, is_active: false, is_primary: false })
            .where('customer_address.id = :id', { id })
            .andWhere('customer_address.customer_id = :customerId', { customerId: getCustomer.id }) // <-- relation column direct
            .andWhere('customer_address.is_deleted = false')
            .execute();

        if (result.affected === 0) {
            throw new NotFoundException('Address not found');
        }

        return { message: 'Address deleted successfully' };
    }

    async getAddressDetails(user: User, id: string): Promise<CustomerAddress> {
        const getCustomer = await this.customerRepo.findOne({
            where: { user: { id: user.id, is_verified: true, status: EmployeeStatus.ACTIVE } },
        });

        if (!getCustomer) throw new NotFoundException("Customer not found");

        const getAddress = await this.customerAddressRepo.findOne({
            where: {
                id,
                customer: { id: getCustomer.id },
                is_active: true,
                is_deleted: false,
            },
            relations: ['customer']
        });
        if (!getAddress) throw new NotFoundException("Address not found");
        return getAddress
    }


    async toggleAddressAsPrimary(user: User, dto: TogglePrimaryAddressDto) {
        const { address_id } = dto;
        const findCustomer = await this.customerRepo.findOne({
            where: {
                user: {
                    id: user.id
                }
            }, relations: ['addresses'],
        });
        if (!findCustomer) throw new BadRequestException("Customer details not found");

        const selectedAddress = findCustomer.addresses.find(addr => addr.id === address_id);
        if (!selectedAddress) throw new BadRequestException("Address not found");

        if (selectedAddress.is_primary) {
            await this.customerAddressRepo.update({ id: address_id }, { is_primary: false });
            return {
                message: "Primary address removed",
                address: { ...selectedAddress, is_primary: false },
            };
        }

        await this.customerAddressRepo.manager.transaction(async (manager) => {
            await manager.update(CustomerAddress, { customer: { id: findCustomer.id } }, { is_primary: false });
            await manager.update(CustomerAddress, { id: address_id }, { is_primary: true });
        });

        return {
            message: "Address marked as primary",
            address: { ...selectedAddress, is_primary: true }
        };

    }





}
