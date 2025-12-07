import { BadRequestException, flatten, ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DriverAssignmentStatus, OrderStatus } from '../common/enums/order.enum';
import { CheckoutDto } from '../customer/dto/customer.dto';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cartItem.entity';
import { Customer } from '../entities/customerDetails.entity';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/orderItem.entity';
import { Products } from '../entities/products.entity';
import { Stores } from '../entities/stores.entity';
import { User } from '../entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { AdminGetOrdersDto, AssignOrderDto, GetDriverOrdersStatusDto, ReorderDto, UpdateDriverOrderStatusDto, UpdateOrderStatusDto } from './dto/order.dto';
import { ProductResponseDto } from '../shop-products/dto/shop-product.dto';
import { calculateDiscountPrice, paginate } from '../utils/product.utils';
import { PaginationDto } from '../common/common-dtos/pagination.dto';
import { UserRole } from '../common/enums/user-role.enum';
import { ShopProduct } from '../entities/shopProducts.entity';
import { EmployeeStatus } from '../common/enums/employee.enum';
import { Driver } from '../entities/driverDetails.entity';
import { Shopkepper } from '../entities/shopkeeperDetails.entity';
import { PaymentMethod } from '../common/enums/payment.enum';
import { DriverAvailabilityStatus, DriverStatus } from '../common/enums/driver.enum';
import { Merchant } from '../entities/merchantDetails.entity';
import { OrderDriverAssignment } from '../entities/orderDriverAssignment.entity';
import { UploadService } from '../utils/upload.service';
import { ACL_ACCESS } from '../common/enums/product.enum';
import { CacheService } from '../upstash_redis/cache.service';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Customer)
        private readonly customerDetailRepo: Repository<Customer>,
        @InjectRepository(Cart)
        private readonly cartRepository: Repository<Cart>,
        @InjectRepository(CartItem)
        private readonly cartItemRepository: Repository<CartItem>,
        @InjectRepository(OrderItem)
        private readonly orderItemRepo: Repository<OrderItem>,
        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>,
        @InjectRepository(ShopProduct)
        private readonly shopProductRepo: Repository<ShopProduct>,
        @InjectRepository(Shopkepper)
        private readonly shopkeeperRepo: Repository<Shopkepper>,
        @InjectRepository(Driver)
        private readonly driverRepo: Repository<Driver>,
        @InjectRepository(OrderDriverAssignment)
        private readonly orderAssignmentRepo: Repository<OrderDriverAssignment>,
        private readonly dataSource: DataSource,
        private uploadService: UploadService,
        private readonly cacheService: CacheService,
    ) { }

    // async createOrder(user: User, dto: CheckoutDto): Promise<any> {
    //     // Ensure customer exists
    //     const userWithCustomer = await this.userRepo.findOne({
    //         where: { id: user.id, is_verified: true },
    //         relations: ['customer', 'customer.cart'],
    //     });
    //     if (!userWithCustomer || !userWithCustomer.customer) {
    //         throw new NotFoundException('Customer details not found. Please complete profile.');
    //     }

    //     const customer = await this.customerDetailRepo.findOne({
    //         where: { id: userWithCustomer.customer.id },
    //         relations: ['cart', 'cart.cart_items', 'cart.cart_items.shop_product', 'orders'],
    //     });

    //     if (!customer || !customer.cart) {
    //         throw new BadRequestException('Cart not found or empty.');
    //     }

    //     const cart = await this.cartRepository.findOne({
    //         where: { id: customer.cart.id },
    //         relations: ['cart_items', 'cart_items.shop_product', 'customer'],
    //     });

    //     if (!cart || !cart.cart_items || cart.cart_items.length === 0) {
    //         throw new BadRequestException('Cart is empty.');
    //     }

    //     // Validate stock (optional) and compute total
    //     let totalAmount = 0;
    //     const orderItems: OrderItem[] = [];

    //     for (const ci of cart.cart_items) {
    //         const shopProduct = ci.shop_product;
    //         if (!shopProduct) {
    //             throw new NotFoundException(`Product not found for cart item ${ci.id}`);
    //         }

    //         const price = shopProduct.price || 0;
    //         const itemTotal = price * ci.quantity;
    //         totalAmount += itemTotal;

    //         const oi = this.orderItemRepo.create({
    //             shop_product: shopProduct,
    //             quantity: ci.quantity,
    //             price: price,
    //         });
    //         orderItems.push(oi);
    //     }

    //     // Create order
    //     const order = this.orderRepo.create({
    //         customer,
    //         items: orderItems,
    //         total_amount: totalAmount,
    //         order_status: OrderStatus.PENDING,
    //         payment_type: dto.payment_method,
    //         address: dto.address
    //     });

    //     const savedOrder = await this.orderRepo.save(order);

    //     // Clear cart items
    //     await this.cartItemRepository.remove(cart.cart_items);

    //     // Optionally update customer's address if provided in checkout dto
    //     // if (dto.address_1 || dto.city || dto.state || dto.country) {
    //     //     customer.address_1 = dto.address_1 ?? customer.address_1;
    //     //     customer.address_2 = dto.address_2 ?? customer.address_2;
    //     //     customer.city = dto.city ?? customer.city;
    //     //     customer.state = dto.state ?? customer.state;
    //     //     customer.country = dto.country ?? customer.country;
    //     //     await this.customerDetailRepo.save(customer);
    //     // }

    //     // Optionally handle payment flow for non-COD here
    //     // For now we keep status PENDING for all and let payment webhook update it

    //     return {
    //         message: 'Order placed successfully',
    //         order_id: savedOrder.id
    //     };
    // }

    /* ORDER CREATION WITH STOCK UPDATION */

    // async createOrder(user: User, dto: CheckoutDto): Promise<any> {
    //     return this.dataSource.transaction(async (manager) => {
    //         const userRepo = manager.getRepository(User);
    //         const customerRepo = manager.getRepository(Customer);
    //         const orderRepo = manager.getRepository(Order);
    //         const orderItemRepo = manager.getRepository(OrderItem);
    //         const shopProductRepo = manager.getRepository(ShopProduct);
    //         const cartItemRepo = manager.getRepository(CartItem);

    //         // 1) Customer + Cart
    //         const userWithCustomer = await userRepo.findOne({
    //             where: { id: user.id, is_verified: true },
    //             relations: ['customer', 'customer.cart'],
    //             // lock: { mode: 'pessimistic_read' },
    //         });
    //         if (!userWithCustomer?.customer) throw new NotFoundException('Customer details not found.');

    //         const customer = await customerRepo.findOne({
    //             where: { id: userWithCustomer.customer.id },
    //             relations: ['cart', 'cart.cart_items', 'cart.cart_items.shop_product.store', 'addresses'],
    //             // lock: { mode: 'pessimistic_read' },
    //         });
    //         if (!customer?.cart || !customer.cart.cart_items?.length) {
    //             throw new BadRequestException('Cart is empty.');
    //         }
    //         const selectedAddress = customer.addresses.find(
    //             (addr) => addr.id === dto.customer_address_id && addr.is_deleted === false,
    //         );
    //         if (!selectedAddress) {
    //             throw new BadRequestException('Invalid customer address.');
    //         }

    //         // 2) Group cart items by store
    //         const itemsByStore = new Map<string, typeof customer.cart.cart_items>();
    //         for (const ci of customer.cart.cart_items) {
    //             const storeId = ci.shop_product.store.id;
    //             if (!itemsByStore.has(storeId)) {
    //                 itemsByStore.set(storeId, []);
    //             }
    //             itemsByStore.get(storeId)!.push(ci);
    //         }

    //         // 2) Validate + Lock + Deduct
    //         let orderTotalAmount = 0;
    //         let orderTotalDiscount = 0;
    //         let orderPayableAmount = 0;
    //         const orderItems: OrderItem[] = [];

    //         for (const ci of customer.cart.cart_items) {
    //             // Exclusive lock on the product row
    //             const sp = await shopProductRepo.findOne({
    //                 where: { id: ci.shop_product.id },
    //                 lock: { mode: 'pessimistic_write' },
    //             });
    //             if (!sp) throw new NotFoundException(`Product not found for cart item ${ci.id}`);
    //             if (!sp.is_available) throw new BadRequestException('Product is not available.');
    //             if (sp.stock < ci.quantity) {
    //                 throw new BadRequestException(`Insufficient stock for product ${sp.id}. Available: ${sp.stock}`);
    //             }

    //             // Deduct now (atomic)
    //             sp.stock -= ci.quantity;
    //             await shopProductRepo.save(sp);

    //             const price = Number(sp.price) || 0;
    //             const priceAfterDiscount = Number(sp.discount) > 0 ? calculateDiscountPrice(price, sp.discount) : price;
    //             const totalAmount = price * ci.quantity; // total without discount
    //             const payableAmount = priceAfterDiscount * ci.quantity; // total amount with discount
    //             const discountedAmount = Number(sp.discount) > 0 ? totalAmount - payableAmount : 0; // total discount amount
    //             orderTotalAmount += totalAmount;
    //             orderTotalDiscount += discountedAmount;
    //             orderPayableAmount += payableAmount;

    //             orderItems.push(
    //                 orderItemRepo.create({
    //                     shop_product: sp,
    //                     quantity: ci.quantity,
    //                     price: sp.price,
    //                     total_amount: totalAmount,
    //                     payable_amount: payableAmount,
    //                     discounted_amount: discountedAmount
    //                 }),
    //             );
    //         }

    //         // 3) Create order atomically
    //         const order = orderRepo.create({
    //             customer,
    //             items: orderItems,
    //             total_amount: orderTotalAmount,
    //             total_payable_amount: orderPayableAmount,
    //             total_discounted_amount: orderTotalDiscount,
    //             order_status: OrderStatus.PENDING,
    //             payment_type: dto.payment_method,
    //             address: dto.address,
    //             customer_address: { id: dto.customer_address_id },
    //         });
    //         const savedOrder = await orderRepo.save(order);

    //         // 4) Clear cart items
    //         await cartItemRepo.remove(customer.cart.cart_items);

    //         return { message: 'Order placed successfully', order_id: savedOrder.id };
    //     });
    // }

    async createOrder(user: User, dto: CheckoutDto): Promise<any> {
        return this.dataSource.transaction(async (manager) => {
            const userRepo = manager.getRepository(User);
            const customerRepo = manager.getRepository(Customer);
            const orderRepo = manager.getRepository(Order);
            const orderItemRepo = manager.getRepository(OrderItem);
            const shopProductRepo = manager.getRepository(ShopProduct);
            const cartItemRepo = manager.getRepository(CartItem);

            // 1) Customer + Cart
            const userWithCustomer = await userRepo.findOne({
                where: { id: user.id, is_verified: true },
                relations: ['customer', 'customer.cart'],
                // lock: { mode: 'pessimistic_read' },
            });
            if (!userWithCustomer?.customer) throw new NotFoundException('Customer details not found.');

            const customer = await customerRepo.findOne({
                where: { id: userWithCustomer.customer.id },
                relations: ['cart', 'cart.cart_items', 'cart.cart_items.shop_product', 'cart.cart_items.shop_product.store', 'addresses'],
                // lock: { mode: 'pessimistic_read' },
            });
            if (!customer?.cart || !customer.cart.cart_items?.length) {
                throw new BadRequestException('Cart is empty.');
            }
            const selectedAddress = customer.addresses.find(
                (addr) => addr.id === dto.customer_address_id && addr.is_deleted === false,
            );
            if (!selectedAddress) {
                throw new BadRequestException('Invalid customer address.');
            }

            // 2) Group cart items by store
            const itemsByStore = new Map<string, typeof customer.cart.cart_items>();
            for (const ci of customer.cart.cart_items) {
                const storeId = ci.shop_product.store.id;
                if (!itemsByStore.has(storeId)) {
                    itemsByStore.set(storeId, []);
                }
                itemsByStore.get(storeId)!.push(ci);
            }

            const createdOrders: Order[] = [];

            // 2) Validate + Lock + Deduct
            for (const [_storeId, storeItems] of itemsByStore.entries()) {
                let orderTotalAmount = 0;
                let orderTotalDiscount = 0;
                let orderPayableAmount = 0;
                const orderItems: OrderItem[] = [];
                for (const ci of storeItems) {
                    // Exclusive lock on the product row
                    const sp = await shopProductRepo.findOne({
                        where: { id: ci.shop_product.id },
                        lock: { mode: 'pessimistic_write' },
                    });
                    if (!sp) throw new NotFoundException(`Product not found for cart item ${ci.id}`);
                    if (!sp.is_available) throw new BadRequestException('Product is not available.');
                    if (sp.stock < ci.quantity) {
                        throw new BadRequestException(`Insufficient stock for product ${sp.id}. Available: ${sp.stock}`);
                    }

                    // Deduct now (atomic)
                    sp.stock -= ci.quantity;
                    await shopProductRepo.save(sp);

                    const price = Number(sp.price) || 0;
                    const priceAfterDiscount = Number(sp.discount) > 0 ? calculateDiscountPrice(price, sp.discount) : price;
                    const totalAmount = price * ci.quantity; // total without discount
                    const payableAmount = priceAfterDiscount * ci.quantity; // total amount with discount
                    const discountedAmount = Number(sp.discount) > 0 ? totalAmount - payableAmount : 0; // total discount amount
                    orderTotalAmount += totalAmount;
                    orderTotalDiscount += discountedAmount;
                    orderPayableAmount += payableAmount;

                    orderItems.push(
                        orderItemRepo.create({
                            shop_product: sp,
                            quantity: ci.quantity,
                            price: sp.price,
                            total_amount: totalAmount,
                            payable_amount: payableAmount,
                            discounted_amount: discountedAmount
                        }),
                    );
                }
                // 3) Create order atomically
                const order = orderRepo.create({
                    customer,
                    items: orderItems,
                    total_amount: orderTotalAmount,
                    total_payable_amount: orderPayableAmount,
                    total_discounted_amount: orderTotalDiscount,
                    order_status: OrderStatus.PENDING,
                    payment_type: dto.payment_method,
                    address: dto.address,
                    customer_address: { id: dto.customer_address_id },
                });
                const savedOrder = await orderRepo.save(order);
                createdOrders.push(savedOrder);
            }



            // 4) Clear cart items
            await cartItemRepo.remove(customer.cart.cart_items);

            // 5) Invalidate cart cache in Redis
            await this.cacheService.invalidateCart(customer.id);
            // Also delete formatted cart cache
            await this.cacheService.del(`cart:formatted:${customer.id}`);

            return { message: 'Order placed successfully', order_id: createdOrders.map((o) => o.id) };
        });
    }

    async getCustomerOrders(user: User, query: PaginationDto, status?: OrderStatus, payment_type?: PaymentMethod): Promise<any> {
        const userWithCustomer = await this.userRepo.findOne({
            where: { id: user.id }, relations: ['customer']
        });
        if (!userWithCustomer) {
            throw new NotFoundException('User not found');
        }
        const qb = this.orderRepo.createQueryBuilder('order')
            .where('order.customer_id = :customer_id', {
                customer_id: userWithCustomer.customer.id,
            })
        if (status) {
            qb.andWhere('order.order_status = :status', { status })
        }
        if (payment_type) {
            qb.andWhere('order.payment_type = :payment_type', { payment_type })
        }
        /** --- Paginate --- */
        const result = await paginate(qb, query);
        result.data = result.data.map((assignment: any) => {
            const o = assignment;
            o.total_amount = Number(o.total_amount) || 0;
            o.total_payable_amount = Number(o.total_payable_amount) || 0;
            o.total_discounted_amount = Number(o.total_discounted_amount) || 0;
            return assignment;
        });
        return result;
    }

    async getAllOrdersForAdmin(
        user: User,
        dto: AdminGetOrdersDto,
        query: PaginationDto,
    ): Promise<any> {
        const qb = this.orderRepo.createQueryBuilder('order');

        /** --- Base joins --- */
        qb.leftJoinAndSelect('order.customer', 'customer')
            .leftJoinAndSelect('customer.user', 'customerUser')
            .leftJoinAndSelect('order.items', 'orderItem')
            .leftJoinAndSelect('orderItem.shop_product', 'shopProduct')
            .leftJoinAndSelect('order.driver_assignments', 'driverAssignment')
            .leftJoinAndSelect('driverAssignment.driver', 'assignedDriver')
            .leftJoinAndSelect('assignedDriver.user', 'assignedDriverUser')
            .leftJoinAndSelect('shopProduct.store', 'store')
            .leftJoinAndSelect('store.shop_keepers', 'shopKeeper')
            .leftJoinAndSelect('store.drivers', 'driver')
            .leftJoinAndSelect('store.merchant', 'merchant')
            .leftJoinAndSelect('shopProduct.product', 'product')
            .leftJoinAndSelect('product.images', 'images')
            .leftJoinAndSelect('product.category', 'category');

        /** --- Soft delete filters --- */
        qb.andWhere('store.is_deleted = false')
            .andWhere('shopProduct.is_deleted = false')
            .andWhere('product.is_deleted = false')
            .andWhere('images.is_deleted = false');

        /** --- Filters from DTO --- */
        if (user.role === UserRole.MERCHANT) {
            qb.andWhere('merchant.user.id = :merchant_user_id', {
                merchant_user_id: user.id,
            });
            if (dto.user_id) {
                // ✅ Can filter on any user (customer, shopkeeper, driver)
                qb.andWhere(
                    '(customerUser.id = :user_id OR shopKeeper.user_id = :user_id OR driver.user_id = :user_id)',
                    { user_id: dto.user_id },
                );
            }
        } else if (user.role === UserRole.ADMIN) {
            if (dto.user_id && !dto.role) {
                qb.andWhere('customerUser.id = :user_id', { user_id: dto.user_id });
            }
            if (dto.merchant_id) {
                qb.andWhere('merchant.id = :merchant_id', { merchant_id: dto.merchant_id });
            }
            if (dto.role && dto.user_id) {
                switch (dto.role) {
                    case UserRole.MERCHANT:
                        qb.andWhere('merchant.user_id = :merchant_user_id', { merchant_user_id: dto.user_id });

                        if (dto.store_id) {
                            qb.andWhere('store.id = :store_id', { store_id: dto.store_id });
                        }
                        break;

                    case UserRole.SHOPKEEPER:
                        qb.leftJoin('store.shop_keepers', 'shopKeeperRole')
                            .andWhere('shopKeeperRole.user_id = :shopkeeper_user_id', {
                                shopkeeper_user_id: dto.user_id,
                            });
                        break;

                    case UserRole.DRIVER:
                        qb.leftJoin('store.drivers', 'driverRole')
                            .andWhere('driverRole.user_id = :driver_user_id', {
                                driver_user_id: dto.user_id,
                            });
                        break;

                    default:
                        qb.andWhere('customerUser.id = :user_id', { user_id: dto.user_id });
                }
            }
        }
        if (dto.customer_id) {
            qb.andWhere('customer.id = :customer_id', { customer_id: dto.customer_id });
        }
        if (dto.store_id) {
            qb.andWhere('store.id = :store_id', { store_id: dto.store_id });
        }
        if (dto.shop_product_id) {
            qb.andWhere('shopProduct.id = :shop_product_id', { shop_product_id: dto.shop_product_id });
        }
        if (dto.status) {
            qb.andWhere('order.order_status = :status', { status: dto.status });
        }

        qb.orderBy('order.created_at', 'DESC');
        /** --- Paginate --- */
        const result = await paginate(qb, query);
        result.data = result.data.map(order => {
            // --- sanitize customer.user ---
            if (order.customer?.user) {
                const { password, ...safeUser } = order.customer.user; // 👈 destructure & remove
                order.customer.user = safeUser as typeof order.customer.user;
            }
            // --- pick first assigned driver only ---
            // let assignedDriver = null;
            if (order.driver_assignments?.length) {
                const assignment = order.driver_assignments[0];
                if (assignment?.driver) {
                    const driverUser = assignment.driver.user;
                    order['assignedDriver'] = {
                        ...assignment.driver,
                        user: driverUser
                            ? (() => {
                                const { password, ...safeUser } = driverUser;
                                return safeUser;
                            })()
                            : null,
                        driver_assignment_status: assignment.status,
                    };
                }
            }
            const { driver_assignments, ...rest } = order;
            order.total_amount = order.total_amount ? Number(order.total_amount) : 0;
            order.total_discounted_amount = order.total_discounted_amount ? Number(order.total_discounted_amount) : 0;
            order.total_payable_amount = order.total_payable_amount ? Number(order.total_payable_amount) : 0;
            // if (order.items?.length) {
            const formattedItems = order.items.map((item: any) => ({
                ...item,
                price: item.price ? Number(item.price) : 0,
                total_amount: item.price ? Number(item.total_amount) : 0,
                discounted_amount: item.price ? Number(item.discounted_amount) : 0,
                payable_amount: item.price ? Number(item.payable_amount) : 0,
                shop_product: item.shop_product
                    ? {
                        ...item.shop_product,
                        price: item.shop_product.price ? Number(item.shop_product.price) : 0,
                    }
                    : null,
            })) ?? [];
            // }
            return {
                ...rest,
                total_amount: rest.total_amount ? Number(rest.total_amount) : 0,
                total_discounted_amount: rest.total_discounted_amount ? Number(rest.total_discounted_amount) : 0,
                total_payable_amount: rest.total_payable_amount ? Number(rest.total_payable_amount) : 0,
                items: formattedItems,
                // assignedDriver,
            };
        }) as any;

        return result;
    }

    async getOrderDetail(user: User, order_id: string): Promise<any> {
        const qb = this.orderRepo.createQueryBuilder('order');

        /** --- Joins --- */
        qb.leftJoinAndSelect('order.customer', 'customer')
            .leftJoinAndSelect('order.customer_address', 'customerAddress')
            .leftJoinAndSelect('customer.user', 'customerUser')
            .leftJoinAndSelect('order.items', 'orderItem')
            .leftJoinAndSelect('orderItem.shop_product', 'shopProduct')
            .leftJoinAndSelect('shopProduct.store', 'store')
            .leftJoinAndSelect('store.shop_keepers', 'shopKeeper')
            .leftJoinAndSelect('shopKeeper.user', 'shopKeeperUser') // ✅ join user
            .leftJoinAndSelect('store.drivers', 'driver')
            .leftJoinAndSelect('driver.user', 'driverUser') // ✅ join user
            .leftJoinAndSelect('store.merchant', 'merchant') // ✅ direct merchant join
            .leftJoinAndSelect('merchant.user', 'merchantUser') // ✅ merchant user join
            .leftJoinAndSelect('shopProduct.product', 'product')
            .leftJoinAndSelect('product.images', 'images')
            .leftJoinAndSelect('product.category', 'category')
            .where('order.id = :order_id', { order_id });

        /** --- Role-based access control --- */
        if (user.role === UserRole.CUSTOMER) {
            qb.andWhere('customerUser.id = :user_id', { user_id: user.id })
                .andWhere('customerUser.status = :status', { status: EmployeeStatus.ACTIVE });

        } else if (user.role === UserRole.MERCHANT) {
            qb.andWhere('merchantUser.id = :user_id', { user_id: user.id })
                .andWhere('merchantUser.status = :status', { status: EmployeeStatus.ACTIVE });

        } else if (user.role === UserRole.SHOPKEEPER) {
            qb.andWhere('shopKeeperUser.id = :user_id', { user_id: user.id })
                .andWhere('shopKeeperUser.status = :status', { status: EmployeeStatus.ACTIVE });

        } else if (user.role === UserRole.DRIVER) {
            qb.andWhere('driverUser.id = :user_id', { user_id: user.id })
                .andWhere('driverUser.status = :status', { status: EmployeeStatus.ACTIVE });
        }

        /** --- Soft delete filters --- */
        qb.andWhere('store.is_deleted = false')
            .andWhere('shopProduct.is_deleted = false')
            .andWhere('product.is_deleted = false')
            .andWhere('images.is_deleted = false');

        const order = await qb.getOne();

        if (!order) {
            throw new HttpException('Order not found or access denied', HttpStatus.NOT_FOUND);
        }

        const stripPassword = (u?: any) => u ? (({ password, ...rest }) => rest)(u) : u;

        /** --- Remove password --- */
        if (order.customer?.user) order.customer.user = stripPassword(order.customer.user);

        /** --- Convert price fields to number --- */
        order.total_amount = order.total_amount ? Number(order.total_amount) : 0;
        order.total_discounted_amount = order.total_discounted_amount ? Number(order.total_discounted_amount) : 0;
        order.total_payable_amount = order.total_payable_amount ? Number(order.total_payable_amount) : 0;
        let store: any;
        if (order.items?.length) {
            order.items = order.items.map((item: any) => {
                store = item.shop_product?.store;
                if (store) {
                    if (store.shop_keepers) store.shop_keepers = store.shop_keepers.map((sk: Shopkepper) => ({ ...sk, user: stripPassword(sk.user) }));
                    if (store.drivers) store.drivers = store.drivers.map((dr: Driver) => ({ ...dr, user: stripPassword(dr.user) }));
                    if (store.merchant?.user) store.merchant.user = stripPassword(store.merchant.user);
                }
                return {
                    ...item,
                    price: item.price ? Number(item.price) : 0,
                    total_amount: item.total_amount ? Number(item.total_amount) : 0,
                    discounted_amount: item.discounted_amount ? Number(item.discounted_amount) : 0,
                    payable_amount: item.payable_amount ? Number(item.payable_amount) : 0,
                    shop_product: item.shop_product
                        ? {
                            ...item.shop_product,
                            price: item.shop_product.price ? Number(item.shop_product.price) : 0,
                        }
                        : null,
                }
            });
        }

        return { ...order, driver: store.drivers[0] };
    }

    async getDriverOrderDetail(user: User, order_id: string): Promise<any> {
        const qb = this.orderRepo.createQueryBuilder('order');

        /** --- Joins --- */
        qb.leftJoinAndSelect('order.customer', 'customer')
            .leftJoinAndSelect('order.customer_address', 'customerAddress')
            .leftJoinAndSelect('customer.user', 'customerUser')
            .leftJoinAndSelect('order.items', 'orderItem')
            .leftJoinAndSelect('orderItem.shop_product', 'shopProduct')
            .leftJoinAndSelect('shopProduct.store', 'store')
            .leftJoinAndSelect('store.shop_keepers', 'shopKeeper')
            .leftJoinAndSelect('shopKeeper.user', 'shopKeeperUser') // ✅ join user
            .leftJoinAndSelect('store.drivers', 'driver')
            .leftJoinAndSelect('driver.user', 'driverUser') // ✅ join user
            .leftJoinAndSelect('store.merchant', 'merchant') // ✅ direct merchant join
            .leftJoinAndSelect('merchant.user', 'merchantUser') // ✅ merchant user join
            .leftJoinAndSelect('shopProduct.product', 'product')
            .leftJoinAndSelect('product.images', 'images')
            .leftJoinAndSelect('product.category', 'category')
            .where('order.id = :order_id', { order_id });

        /** --- Role-based access control --- */
        if (user.role === UserRole.CUSTOMER) {
            qb.andWhere('customerUser.id = :user_id', { user_id: user.id })
                .andWhere('customerUser.status = :status', { status: EmployeeStatus.ACTIVE });

        } else if (user.role === UserRole.MERCHANT) {
            qb.andWhere('merchantUser.id = :user_id', { user_id: user.id })
                .andWhere('merchantUser.status = :status', { status: EmployeeStatus.ACTIVE });

        } else if (user.role === UserRole.SHOPKEEPER) {
            qb.andWhere('shopKeeperUser.id = :user_id', { user_id: user.id })
                .andWhere('shopKeeperUser.status = :status', { status: EmployeeStatus.ACTIVE });

        } else if (user.role === UserRole.DRIVER) {
            qb.andWhere('driverUser.id = :user_id', { user_id: user.id })
                .andWhere('driverUser.status = :status', { status: EmployeeStatus.ACTIVE });
        }

        /** --- Soft delete filters --- */
        qb.andWhere('store.is_deleted = false')
            .andWhere('shopProduct.is_deleted = false')
            .andWhere('product.is_deleted = false')
            .andWhere('images.is_deleted = false');

        const order = await qb.getOne();

        if (!order) {
            throw new HttpException('Order not found or access denied', HttpStatus.NOT_FOUND);
        }

        const stripPassword = (u?: any) => u ? (({ password, ...rest }) => rest)(u) : u;

        /** --- Remove password --- */
        if (order.customer?.user) order.customer.user = stripPassword(order.customer.user);

        /** --- Convert price fields to number --- */
        order.total_amount = order.total_amount ? Number(order.total_amount) : 0;
        if (order.items?.length) {
            order.items = order.items.map((item: any) => {
                const store = item.shop_product?.store;
                if (store) {
                    if (store.shop_keepers) store.shop_keepers = store.shop_keepers.map((sk: Shopkepper) => ({ ...sk, user: stripPassword(sk.user) }));
                    if (store.drivers) store.drivers = store.drivers.map((dr: Driver) => ({ ...dr, user: stripPassword(dr.user) }));
                    if (store.merchant?.user) store.merchant.user = stripPassword(store.merchant.user);
                }
                return {
                    ...item,
                    price: item.price ? Number(item.price) : 0,
                    shop_product: item.shop_product
                        ? {
                            ...item.shop_product,
                            price: item.shop_product.price ? Number(item.shop_product.price) : 0,
                        }
                        : null,
                }
            });
        }

        return order;
    }

    async assignOrderToDriver(
        user: User,
        dto: AssignOrderDto,
    ): Promise<{ message: string; order_id: string }> {
        return this.dataSource.transaction(async (manager) => {
            const { order_id, driver_id } = dto;

            const orderRepo = manager.getRepository(Order);
            const driverRepo = manager.getRepository(Driver);
            const assignmentRepo = manager.getRepository(OrderDriverAssignment);
            const merchnatRerpo = manager.getRepository(Merchant);

            /** 1. Find order */
            const order = await orderRepo.findOne({
                where: { id: order_id },
                relations: ['items', 'items.shop_product', 'items.shop_product.store'],
            });
            if (!order) throw new NotFoundException('Order not found');
            if (![OrderStatus.PENDING, OrderStatus.IN_PROGRESS].includes(order.order_status)) {
                throw new BadRequestException('Only pending or in-progress orders can be assigned');
            }
            const orderStore = order.items[0]?.shop_product?.store;
            if (!orderStore) throw new BadRequestException('Order has no valid store');

            /** 2. Find driver */
            const driver = await driverRepo.findOne({
                where: { id: driver_id },
                relations: ['store', 'merchant', 'user'],
            });
            if (!driver) throw new NotFoundException('Driver not found');
            const alreadyAssinged = await assignmentRepo.findOne({
                // where: { order: { id: order.id }, driver: { id: driver.id } }
                where: { order: { id: order.id } }
            });
            // if (alreadyAssinged) throw new BadRequestException(`This order is already assigned to this driver ${driver.id}`);
            if (alreadyAssinged) throw new BadRequestException('This order is already assigned.');

            /** 3. Validate driver belongs to same store */
            if (driver.store.id !== orderStore.id) {
                throw new ForbiddenException('Driver does not belong to this store');
            }

            /** 4. Validate user role (Shopkeeper / Merchant) */
            if (user.role === UserRole.SHOPKEEPER) {
                const shopkeeper = await manager.getRepository(Shopkepper).findOne({
                    where: { store: { id: orderStore.id }, user: { id: user.id } },
                    relations: ['merchant', 'user'],
                });
                if (!shopkeeper) throw new ForbiddenException('You cannot assign order to driver of another store');
            }

            if (user.role === UserRole.MERCHANT) {
                const findMerchant = await merchnatRerpo.findOne({
                    where: { user: { id: user.id } },
                    relations: ['user'],
                });
                if (!findMerchant) throw new NotFoundException("Merchnat not found")
                if (driver.merchant.id !== findMerchant.id) {
                    throw new ForbiddenException('Driver does not belong to your business');
                }
            }

            /** 5. Validate driver availability */
            if (driver.current_status === DriverStatus.INACTIVE) {
                throw new BadRequestException('Driver is inactive.');
            }
            if (driver.driver_status === DriverAvailabilityStatus.BUSY) {
                throw new BadRequestException('Driver is not available.');
            }
            /** 6. Create assignment record */
            const assignment = assignmentRepo.create({
                order,
                driver,
                status: DriverAssignmentStatus.ASSIGNED,
                assigned_by: user,
            });
            await assignmentRepo.save(assignment);

            /** 7. Update order’s current driver */
            order.driver = driver;
            await orderRepo.save(order);
            return { message: 'Driver assigned successfully', order_id: order.id };
        });
    }

    async orderStatus(user: User, dto: UpdateOrderStatusDto): Promise<any> {
        const { order_id, status } = dto;
        const completeUser = await this.userRepo.findOne({
            where: {
                id: user.id,
            }, relations: ['merchant', 'shopkeeper']
        });
        if (!completeUser) throw new NotFoundException("User details not found");
        // 1. Fetch order with store & merchant
        const order = await this.orderRepo.findOne({
            where: { id: order_id },
            relations: [
                'items',
                'items.shop_product',
                'items.shop_product.store',
                'items.shop_product.store.merchant',
            ],
        });
        if (!order) throw new NotFoundException('Order not found');
        const store = order.items[0]?.shop_product?.store;
        if (!store) throw new BadRequestException('Order store not found');
        if (user.role === UserRole.SHOPKEEPER) {
            const shopkeeper = await this.shopkeeperRepo.findOne({
                where: { id: completeUser.shopkeeper.id, user: { id: user.id }, store: { id: store.id } },
            });
            if (!shopkeeper) {
                throw new ForbiddenException('You are not authorized to update this order');
            }
        }
        if (user.role === UserRole.MERCHANT) {
            if (store.merchant.id !== completeUser.merchant.id) {
                throw new ForbiddenException('You are not authorized to update this order');
            }
        }
        if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
            throw new BadRequestException('Invalid order status');
        }
        const validTransitions: Record<OrderStatus, OrderStatus[]> = {
            [OrderStatus.PENDING]: [OrderStatus.IN_PROGRESS, OrderStatus.CANCEL],
            [OrderStatus.IN_PROGRESS]: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.CANCEL],
            [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.ORDER_RECEIVE, OrderStatus.COMPLETE],
            [OrderStatus.ORDER_RECEIVE]: [OrderStatus.COMPLETE],
            [OrderStatus.COMPLETE]: [],
            [OrderStatus.CANCEL]: [],
            [OrderStatus.ASSIGNED]: [],
            [OrderStatus.ACCEPTED]: [],
        };
        const currentStatus = order.order_status;
        if (!validTransitions[currentStatus].includes(status)) {
            throw new BadRequestException(
                `Invalid status transition from ${currentStatus} to ${status}`,
            );
        }
        order.order_status = status;
        await this.orderRepo.save(order);

        return {
            message: 'Order status updated successfully',
            order_id: order.id,
            new_status: status,
        };
    }

    async getAllDriverOrders(user: User, query: PaginationDto, dto: GetDriverOrdersStatusDto): Promise<any> {
        const driver = await this.driverRepo.findOne({
            where: {
                user: {
                    id: user.id,
                    role: UserRole.DRIVER
                }
            }
        });
        if (!driver) throw new NotFoundException("Driver details not found");
        const qb = this.orderAssignmentRepo.createQueryBuilder('oa')
            .leftJoinAndSelect('oa.order', 'order')
            .leftJoinAndSelect('order.customer_address', 'customerAddress')
            .where('oa.driver_id = :driverId', { driverId: driver.id })
            // .andWhere('customerAddress.is_deleted = :isDeleted', { isDeleted: false })
            .orderBy('oa.updated_at', 'DESC')
        if (dto.status) {
            if (Object.values(DriverAssignmentStatus).includes(dto.status as DriverAssignmentStatus)) {
                qb.andWhere('oa.status = :status', { status: dto.status });
            } else if (Object.values(OrderStatus).includes(dto.status as OrderStatus)) {
                qb.andWhere('order.order_status = :status', { status: dto.status });
            }
        }

        const result = await paginate(qb, query);
        result.data = result.data.map((assignment: any) => {
            const o = assignment.order;
            o.total_amount = Number(o.total_amount) || 0;
            o.total_payable_amount = Number(o.total_payable_amount) || 0;
            o.total_discounted_amount = Number(o.total_discounted_amount) || 0;
            return assignment;
        });
        return result;
    }

    async orderStatusByDriver(_user: User, dto: UpdateDriverOrderStatusDto, file?: Express.Multer.File): Promise<any> {
        console.log({ dto });
        const assignment = await this.orderAssignmentRepo.findOne({
            where: { order: { id: dto.order_id }, driver: { id: dto.driver_id } },
            relations: ['order', 'driver'],
        });
        if (!assignment) {
            throw new NotFoundException('Order assignment not found for this driver');
        }
        switch (dto.status) {
            case DriverAssignmentStatus.ACCEPTED:
                if (assignment.status !== DriverAssignmentStatus.ASSIGNED) {
                    throw new BadRequestException('Order is not in assigned state');
                }
                break;
            case DriverAssignmentStatus.REJECTED:
                if (assignment.status !== DriverAssignmentStatus.ASSIGNED) {
                    throw new BadRequestException('Only assigned orders can be rejected');
                }
                break;
            case DriverAssignmentStatus.PICKED:
                if (assignment.status !== DriverAssignmentStatus.ACCEPTED) {
                    throw new BadRequestException('Order must be accepted first');
                }
                break;
            case DriverAssignmentStatus.DELIVERED:
                if (assignment.status !== DriverAssignmentStatus.PICKED) {
                    throw new BadRequestException('Order must be picked before delivered');
                }
                if (!dto.latitude || !dto.longitude || !file) {
                    throw new BadRequestException(
                        'Location (latitude, longitude) are required for delivery completion',
                    );
                }
                break;
            default:
                throw new BadRequestException('Invalid status provided');
        }
        assignment.status = dto.status;

        const order = assignment.order;

        if (dto.status === DriverAssignmentStatus.ACCEPTED) {
            order.order_status = OrderStatus.ASSIGNED;
            await this.orderRepo.save(order);
        }

        if (dto.status === DriverAssignmentStatus.PICKED) {
            order.order_status = OrderStatus.OUT_FOR_DELIVERY;
            await this.orderRepo.save(order);

            assignment.driver.driver_status = DriverAvailabilityStatus.BUSY
            await this.driverRepo.save(assignment.driver)
        }
        if (dto.status === DriverAssignmentStatus.DELIVERED) {
            if (order.order_status === OrderStatus.COMPLETE) {
                throw new BadRequestException('Order is already marked as complete');
            }
            let imageUrl: string | null = null;
            if (file) {
                imageUrl = await this.uploadService.uploadFile(file, 'Delivery_images', order.id, ACL_ACCESS.PUBLIC_READ);
                order.delivery_image = imageUrl;
            }
            order.order_status = OrderStatus.COMPLETE;
            order.geo_location = `${dto.latitude},${dto.longitude}`;
            await this.orderRepo.save(order);

            assignment.driver.driver_status = DriverAvailabilityStatus.FREE
            await this.driverRepo.save(assignment.driver)
        }
        await this.orderAssignmentRepo.save(assignment);
        return { message: 'Order status updated successfully', assignment };
    }

    async getPreviousOrdersForReorder(user: User): Promise<any> {
        const userWithCustomer = await this.userRepo.findOne({
            where: { id: user.id },
            relations: ['customer']
        });

        if (!userWithCustomer?.customer) {
            throw new NotFoundException('Customer details not found.');
        }

        const previousOrders = await this.orderRepo
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.items', 'orderItem')
            .leftJoinAndSelect('orderItem.shop_product', 'shopProduct')
            .leftJoinAndSelect('shopProduct.product', 'product')
            .leftJoinAndSelect('product.images', 'images')
            .leftJoinAndSelect('shopProduct.store', 'store')
            .where('order.customer_id = :customer_id', { customer_id: userWithCustomer.customer.id })
            .andWhere('order.order_status IN (:...statuses)', {
                statuses: [OrderStatus.COMPLETE, OrderStatus.ORDER_RECEIVE]
            })
            .andWhere('store.is_deleted = false')
            .andWhere('shopProduct.is_deleted = false')
            .andWhere('product.is_deleted = false')
            .andWhere('images.is_deleted = false')
            .orderBy('RANDOM()')
            .limit(5)
            .getMany();

        return previousOrders.map((order) => {
            const formattedOrder = {
                ...order,
                total_amount: Number(order.total_amount) || 0,
                total_payable_amount: Number(order.total_payable_amount) || 0,
                total_discounted_amount: Number(order.total_discounted_amount) || 0,
                items: order.items?.map((item: any) => ({
                    ...item,
                    quantity: item.quantity,
                    price: Number(item.price) || 0,
                    total_amount: Number(item.total_amount) || 0,
                    discounted_amount: Number(item.discounted_amount) || 0,
                    payable_amount: Number(item.payable_amount) || 0,
                    shop_product: item.shop_product
                        ? {
                            id: item.shop_product.id,
                            price: Number(item.shop_product.price) || 0,
                            discount: item.shop_product.discount || 0,
                            stock: item.shop_product.stock || 0,
                            is_available: item.shop_product.is_available,
                            product: item.shop_product.product
                                ? {
                                    id: item.shop_product.product.id,
                                    product_name: item.shop_product.product.product_name,
                                    description: item.shop_product.product.description,
                                    product_size: item.shop_product.product.product_size,
                                    images: item.shop_product.product.images
                                        ?.filter((img: any) => !img.is_deleted)
                                        .map((img: any) => img.url) || [],
                                }
                                : null,
                            store: item.shop_product.store
                                ? {
                                    id: item.shop_product.store.id,
                                    store_name: item.shop_product.store.store_name,
                                    store_address: item.shop_product.store.store_address,
                                    store_logo: item.shop_product.store.store_logo,
                                }
                                : null,
                        }
                        : null,
                })) || [],
            };
            return formattedOrder;
        });
    }

    async reorder(user: User, dto: ReorderDto): Promise<any> {
        return this.dataSource.transaction(async (manager) => {
            const userRepo = manager.getRepository(User);
            const customerRepo = manager.getRepository(Customer);
            const orderRepo = manager.getRepository(Order);
            const orderItemRepo = manager.getRepository(OrderItem);
            const shopProductRepo = manager.getRepository(ShopProduct);

            const userWithCustomer = await userRepo.findOne({
                where: { id: user.id, is_verified: true },
                relations: ['customer'],
            });

            if (!userWithCustomer?.customer) {
                throw new NotFoundException('Customer details not found.');
            }

            const customer = await customerRepo.findOne({
                where: { id: userWithCustomer.customer.id },
                relations: ['addresses'],
            });

            if (!customer) {
                throw new NotFoundException('Customer not found.');
            }

            const selectedAddress = customer.addresses.find(
                (addr) => addr.id === dto.customer_address_id && addr.is_deleted === false,
            );

            if (!selectedAddress) {
                throw new BadRequestException('Invalid customer address.');
            }

            const previousOrder = await orderRepo.findOne({
                where: { id: dto.order_id },
                relations: ['customer', 'items', 'items.shop_product', 'items.shop_product.store'],
            });

            if (!previousOrder) {
                throw new NotFoundException('Previous order not found.');
            }

            if (previousOrder.customer.id !== customer.id) {
                throw new ForbiddenException('You can only reorder your own orders.');
            }

            const itemsByStore = new Map<string, typeof previousOrder.items>();
            for (const item of previousOrder.items) {
                const storeId = item.shop_product.store.id;
                if (!itemsByStore.has(storeId)) {
                    itemsByStore.set(storeId, []);
                }
                itemsByStore.get(storeId)!.push(item);
            }

            const createdOrders: Order[] = [];

            for (const [_storeId, storeItems] of itemsByStore.entries()) {
                let orderTotalAmount = 0;
                let orderTotalDiscount = 0;
                let orderPayableAmount = 0;
                const orderItems: OrderItem[] = [];

                for (const previousItem of storeItems) {
                    const shopProductId = previousItem.shop_product.id;

                    const currentShopProduct = await shopProductRepo.findOne({
                        where: { id: shopProductId },
                        lock: { mode: 'pessimistic_write' },
                    });

                    if (!currentShopProduct) {
                        throw new NotFoundException(`Product ${shopProductId} is no longer available.`);
                    }

                    if (!currentShopProduct.is_available) {
                        throw new BadRequestException(`Product ${currentShopProduct.id} is not available.`);
                    }

                    if (currentShopProduct.stock < previousItem.quantity) {
                        throw new BadRequestException(
                            `Insufficient stock for product ${currentShopProduct.id}. Available: ${currentShopProduct.stock}, Required: ${previousItem.quantity}`
                        );
                    }

                    currentShopProduct.stock -= previousItem.quantity;
                    await shopProductRepo.save(currentShopProduct);

                    const currentPrice = Number(currentShopProduct.price) || 0;
                    const priceAfterDiscount = Number(currentShopProduct.discount) > 0
                        ? calculateDiscountPrice(currentPrice, currentShopProduct.discount)
                        : currentPrice;
                    const totalAmount = currentPrice * previousItem.quantity;
                    const payableAmount = priceAfterDiscount * previousItem.quantity;
                    const discountedAmount = Number(currentShopProduct.discount) > 0
                        ? totalAmount - payableAmount
                        : 0;

                    orderTotalAmount += totalAmount;
                    orderTotalDiscount += discountedAmount;
                    orderPayableAmount += payableAmount;

                    orderItems.push(
                        orderItemRepo.create({
                            shop_product: currentShopProduct,
                            quantity: previousItem.quantity,
                            price: currentShopProduct.price,
                            total_amount: totalAmount,
                            payable_amount: payableAmount,
                            discounted_amount: discountedAmount,
                        }),
                    );
                }

                const newOrder = orderRepo.create({
                    customer,
                    items: orderItems,
                    total_amount: orderTotalAmount,
                    total_payable_amount: orderPayableAmount,
                    total_discounted_amount: orderTotalDiscount,
                    order_status: OrderStatus.PENDING,
                    payment_type: dto.payment_method,
                    customer_address: { id: dto.customer_address_id },
                });

                const savedOrder = await orderRepo.save(newOrder);
                createdOrders.push(savedOrder);
            }

            await this.cacheService.invalidateCart(customer.id);
            await this.cacheService.del(`cart:formatted:${customer.id}`);

            return {
                message: 'Order reordered successfully',
                order_id: createdOrders.map((o) => o.id)
            };
        });
    }

}
