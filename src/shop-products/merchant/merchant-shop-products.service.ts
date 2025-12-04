import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Products } from '../../entities/products.entity';
import { ShopProduct } from '../../entities/shopProducts.entity';
import { Stores } from '../../entities/stores.entity';
import { User } from '../../entities/user.entity';
import { CreateShopProductDto, DeleteShopProductDto, ProductResponseDto, UpdateShopProductDto } from '../dto/shop-product.dto';
import { formatShopProduct } from '../../utils/formatter.utils';
import { PaginationDto } from '../../common/common-dtos/pagination.dto';
import { paginate } from '../../utils/product.utils';
import { UserRole } from '../../common/enums/user-role.enum';

@Injectable()
export class MerchantShopProductsService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Stores)
        private readonly storeRepo: Repository<Stores>,
        @InjectRepository(Products)
        private readonly productRepo: Repository<Products>,
        @InjectRepository(ShopProduct)
        private readonly shopProductRepo: Repository<ShopProduct>
    ) { }

    async addShoptoProduct(_user: User, dto: CreateShopProductDto): Promise<ShopProduct> {
        const findProduct = await this.productRepo.findOne({
            where: {
                id: dto.product_id,
                is_deleted: false
            }
        });
        if (!findProduct) throw new NotFoundException("Product not found or deleted");
        const store = await this.storeRepo.findOne({
            where: {
                id: dto.store_id,
                is_deleted: false
            }
        });
        if (!store) throw new NotFoundException("Store not found or deleted");
        const existingShopProduct = await this.shopProductRepo.findOne({
            where: {
                product: { id: dto.product_id },
                store: { id: dto.store_id }
            }
        });
        if (existingShopProduct) throw new BadRequestException("This product already exists");
        // ✅ Check for SKU uniqueness (within store)
        if (dto.sku) {
            const existingSku = await this.shopProductRepo.findOne({
                where: { sku: dto.sku, store: { id: dto.store_id } }
            });
            if (existingSku) throw new ConflictException("SKU already exists in this store");
        }
        const createShopProduct = this.shopProductRepo.create({
            price: dto.price,
            product: { id: dto.product_id },
            store: { id: dto.store_id },
            stock: dto.stock,
            discount: dto.discount,
            sku: dto.sku ?? null
        });
        const savedShopProduct = await this.shopProductRepo.save(createShopProduct);
        const newShopProduct = await this.shopProductRepo.findOne({
            where: {
                id: savedShopProduct.id
            }, relations: ['product', 'store']
        })
        return formatShopProduct(newShopProduct)
    }

    async deletedShoptoProduct(user: User, dto: DeleteShopProductDto): Promise<any> {
        const findShopProduct = await this.shopProductRepo.findOne({
            where: {
                id: dto.shop_product_id,
                is_deleted: false,
                store: {
                    user: {
                        id: user.id
                    }
                }
            }
        });
        if (!findShopProduct) throw new BadRequestException("Shop product not found");
        findShopProduct.is_deleted = true;
        await this.shopProductRepo.save(findShopProduct);
        return {
            message: "Shop product deleted successfully"
        }
    }

    async updateShopProduct(_user: User, dto: UpdateShopProductDto): Promise<any> {
        const findShopProduct = await this.shopProductRepo.findOne({
            where: {
                id: dto.shop_product_id
            }
        });
        if (!findShopProduct) throw new NotFoundException('Shop product not found');
        if (dto.product_id) {
            const product = await this.productRepo.findOne({
                where: {
                    id: dto.product_id,
                    is_deleted: false
                }
            });
            if (!product) throw new NotFoundException("Product not found or deleted");
            findShopProduct.product = product;
        }
        if (dto.store_id) {
            const store = await this.storeRepo.findOne({
                where: {
                    id: dto.store_id,
                    is_deleted: false
                }
            });
            if (!store) throw new NotFoundException("Store not found or deleted");
            findShopProduct.store = store;
        };
        if (!dto.price !== undefined) findShopProduct.price = dto.price;
        if (!dto.stock !== undefined) findShopProduct.stock = dto.stock;
        if (!dto.discount !== undefined) findShopProduct.discount = dto.discount;
        const saved = await this.shopProductRepo.save(findShopProduct);
        const updatedShopProduct = await this.shopProductRepo.findOne({
            where: {
                id: saved.id
            }, relations: ['product', 'store']
        });
        return formatShopProduct(updatedShopProduct);
    }

    async getMerchantShopProducts(user: User, dto: PaginationDto): Promise<any> {
        const getShopProducts = await this.shopProductRepo.createQueryBuilder('shop_product')
            .leftJoinAndSelect('shop_product.product', 'product')
            .leftJoinAndSelect('shop_product.store', 'store')
            .leftJoinAndSelect('product.images', 'images')
            .where('store.user_id = :userId', { userId: user.id }) // <-- user_id filter store table me
            .andWhere('store.is_deleted = false')
        // .getMany();
        const result = await paginate(getShopProducts, dto);
        return {
            ...result,
            data: ProductResponseDto.fromQueryList(result.data)
        }
    }


    async getTopSellingProducts(
        user: User,
        storeId: string | null,
        top: string | null
    ) {

        const TOP_PRODUCTS_LIMIT = top ? parseInt(top, 10) : 5;

        const subQb = this.shopProductRepo
            .createQueryBuilder('sp')
            .innerJoin('sp.order_items', 'oi')
            .select('sp.id', 'shop_product_id')
            .addSelect('SUM(oi.quantity)', 'sold_count')
            .where('sp.is_deleted = false')
            .andWhere('sp.is_available = true')
            .groupBy('sp.id');

        if (user.role === UserRole.MERCHANT) {
            subQb.innerJoin('sp.store', 'store', 'store.user_id = :userId AND store.is_deleted = false', { userId: user.id });
            if (storeId) {
                subQb.andWhere('store.id = :sid', { sid: storeId });
            }
        }


        if (user.role === UserRole.SHOPKEEPER) {
            if (!storeId) throw new BadRequestException("store_id required for shopkeeper")
            subQb.innerJoin('sp.store', 'store', 'store.id = :sid AND store.is_deleted = false', { sid: storeId });
        }

        subQb.orderBy('sold_count', 'DESC').limit(TOP_PRODUCTS_LIMIT);

        const topProductsRaw = await subQb.getRawMany();
        console.log({topProductsRaw});
        const topProductIds = topProductsRaw.map(p => p.shop_product_id);

        if (topProductIds.length === 0) {
            return { data: [] };
        }

        // 2️⃣ Main query: fetch full product info for top products
        const qb = this.shopProductRepo
            .createQueryBuilder('shop_product')
            .leftJoinAndSelect('shop_product.product', 'product')
            .leftJoinAndSelect('product.images', 'images')
            .leftJoinAndSelect('shop_product.store', 'store')
            .whereInIds(topProductIds)
            .andWhere('product.is_deleted = false');

        const products = await qb.getMany();
        const sortedProducts = topProductIds.map(id => products.find(p => p.id === id));

        return {
            data: ProductResponseDto.fromQueryList(sortedProducts)
        };
    }


}