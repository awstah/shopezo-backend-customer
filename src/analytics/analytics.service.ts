import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Merchant } from '../entities/merchantDetails.entity';
import { Stores } from '../entities/stores.entity';
import { User } from '../entities/user.entity';
import { Order } from '../entities/order.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { GetDashboardDataDto, GetDriverDashboardDataDto, GetMerchantReenueDto, GetRecentOrdersDto, GetStoreRevenueDto } from './dto/analytics.dto';
import { DriverAssignmentStatus, OrderStatus } from '../common/enums/order.enum';
import { OrderDriverAssignment } from '../entities/orderDriverAssignment.entity';
import { Driver } from '../entities/driverDetails.entity';
import { Shopkepper } from '../entities/shopkeeperDetails.entity';
import { PaginationDto } from '../common/common-dtos/pagination.dto';
import { paginate } from '../utils/product.utils';

@Injectable()
export class AnalyticsService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Merchant)
        private merchantDetailsRepo: Repository<Merchant>,
        @InjectRepository(Stores)
        private storeRepo: Repository<Stores>,
        @InjectRepository(Order)
        private orderRepo: Repository<Order>,
        @InjectRepository(OrderDriverAssignment)
        private orderDriverAssignmentRepo: Repository<OrderDriverAssignment>,
        @InjectRepository(Driver)
        private driverDetailsRepo: Repository<Driver>,
        @InjectRepository(Shopkepper)
        private shopkeeperDetailsRepo: Repository<Shopkepper>
    ) { }

    private getDateRange(startDate?: Date, endDate?: Date) {
        const now = new Date();

        // ✅ No date provided → last 30 days (including today)
        if (!startDate && !endDate) {
            const start = new Date(now);
            start.setDate(now.getDate() - 29);
            start.setUTCHours(0, 0, 0, 0);

            const end = new Date(now);
            end.setUTCHours(23, 59, 59, 999);

            return { startDate: start, endDate: end };
        }

        // ✅ Only startDate → till today
        if (startDate && !endDate) {
            const end = new Date(now);
            end.setUTCHours(23, 59, 59, 999);
            return { startDate, endDate: end };
        }

        // ✅ Only endDate → last 30 days till endDate
        if (!startDate && endDate) {
            const start = new Date(endDate);
            start.setDate(start.getDate() - 29);
            start.setUTCHours(0, 0, 0, 0);

            const end = new Date(endDate);
            end.setUTCHours(23, 59, 59, 999)
            return { startDate: start, endDate: end };
        }

        // ✅ Both provided
        return { startDate, endDate };
    }

    private async buildRevenueQuery(
        filters: {
            merchantId?: string;
            storeId?: string;
            startDate?: Date;
            endDate?: Date;
        }
    ) {
        const { merchantId, storeId, startDate, endDate } = filters;

        const subQuery = this.orderRepo
            .createQueryBuilder('o')
            .select('o.id')
            .leftJoin('o.items', 'items')
            .leftJoin('items.shop_product', 'shop_product')
            .leftJoin('shop_product.store', 'store')
            .leftJoin('store.merchant', 'merchant')
            .andWhere('o.order_status = :status', { status: OrderStatus.COMPLETE })
            .andWhere('store.is_deleted = false');

        if (merchantId) subQuery.andWhere('merchant.id = :merchantId', { merchantId });
        if (storeId) subQuery.andWhere('store.id = :storeId', { storeId });

        subQuery.andWhere('o.created_at >= :startDate', { startDate });
        subQuery.andWhere('o.created_at <= :endDate', { endDate });

        const qb = this.orderRepo
            .createQueryBuilder('order')
            .select('SUM(order.total_payable_amount)', 'totalRevenue')
            .where(`order.id IN (${subQuery.getQuery()})`)
            .setParameters(subQuery.getParameters());

        return qb;
    }

    private calculateOrderStats(orderCounts: { status: OrderStatus; count: string }[]) {
        const findCount = (status: OrderStatus) =>
            Number(orderCounts.find((x) => x.status === status)?.count || 0);

        const totalPendingOrders = findCount(OrderStatus.PENDING);
        const totalCancelOrders = findCount(OrderStatus.CANCEL);
        const totalActiveOrders = orderCounts
            .filter(
                (o) =>
                    o.status !== OrderStatus.PENDING &&
                    o.status !== OrderStatus.CANCEL,
            )
            .reduce((sum, o) => sum + Number(o.count), 0);

        return { totalPendingOrders, totalCancelOrders, totalActiveOrders };
    }

    private buildActiveStoresQuery(filters: { merchantId?: string }) {
        const { merchantId } = filters;

        const qb = this.storeRepo
            .createQueryBuilder('s')
            .where('s.is_deleted = false');

        if (merchantId) qb.andWhere('s.merchant_id = :merchantId', { merchantId });

        return qb;
    }

    private buildOrderStatsQuery(filters: {
        merchantId?: string;
        storeId?: string;
        startDate?: Date;
        endDate?: Date;
    }) {
        const { merchantId, storeId, startDate, endDate } = filters;

        const qb = this.orderRepo
            .createQueryBuilder('order')
            .leftJoin('order.items', 'items')
            .leftJoin('items.shop_product', 'shop_product')
            .leftJoin('shop_product.store', 'store')
            .leftJoin('store.merchant', 'merchant')
            .select('order.order_status', 'status')
            .addSelect('COUNT(order.id)', 'count')
            .andWhere('store.is_deleted = false');

        if (merchantId) qb.andWhere('merchant.id = :merchantId', { merchantId });
        if (storeId) qb.andWhere('store.id = :storeId', { storeId });
        qb.andWhere('order.created_at >= :startDate', { startDate });
        qb.andWhere('order.created_at <= :endDate', { endDate });

        return qb.groupBy('order.order_status');
    }

    // 🔹 Dashboard for Admin
    async getAdminDashboardStats(dto: GetDashboardDataDto) {
        const { start_date, end_date, merchant_id, store_id } = dto || {};
        const { startDate, endDate } = this.getDateRange(start_date, end_date);
        // ✅ Revenue
        const revenueQb = await this.buildRevenueQuery({
            merchantId: merchant_id,
            storeId: store_id,
            startDate,
            endDate
        });
        const revenueResult = await revenueQb.getRawOne<{ totalRevenue: string }>();
        const totalRevenue = revenueResult?.totalRevenue
            ? Number(revenueResult.totalRevenue)
            : 0;

        // ✅ Orders
        const orderQb = this.buildOrderStatsQuery({
            merchantId: merchant_id,
            storeId: store_id,
            startDate,
            endDate,
        });
        const orderCounts = await orderQb.getRawMany<{ status: OrderStatus; count: string }>();
        const { totalPendingOrders, totalCancelOrders, totalActiveOrders } =
            this.calculateOrderStats(orderCounts);

        // ✅ Stores
        const storeQb = this.buildActiveStoresQuery({ merchantId: merchant_id });
        const activeStores = await storeQb.getCount();

        return {
            totalRevenue,
            totalActiveOrders,
            totalPendingOrders,
            totalCancelOrders,
            totalActiveStores: activeStores,
        };
    }

    // Dashboard for merchant
    async getMerchantDashboardStats(user: User, dto: GetDashboardDataDto) {
        const { start_date, end_date, store_id } = dto || {};
        const merchant = await this.merchantDetailsRepo.findOne({
            where: {
                user: { id: user.id }
            }
        });
        if (!merchant) throw new NotFoundException("Merchant details not fuond");
        const { startDate, endDate } = this.getDateRange(start_date, end_date);
        // ✅ Revenue
        const revenueQb = await this.buildRevenueQuery({
            merchantId: merchant.id,
            storeId: store_id,
            startDate,
            endDate
        });
        const revenueResult = await revenueQb.getRawOne<{ totalRevenue: string }>();
        const totalRevenue = revenueResult?.totalRevenue
            ? Number(revenueResult.totalRevenue)
            : 0;

        // ✅ Orders
        const orderQb = this.buildOrderStatsQuery({
            merchantId: merchant.id,
            storeId: store_id,
            startDate,
            endDate,
        });
        const orderCounts = await orderQb.getRawMany<{ status: OrderStatus; count: string }>();
        const { totalPendingOrders, totalCancelOrders, totalActiveOrders } =
            this.calculateOrderStats(orderCounts);

        // ✅ Stores
        const storeQb = this.buildActiveStoresQuery({ merchantId: merchant.id });
        const activeStores = await storeQb.getCount();

        return {
            totalRevenue,
            totalActiveOrders,
            totalPendingOrders,
            totalCancelOrders,
            totalActiveStores: activeStores,
        };
    }

    async getDriverDashboardStats(user: User, dto: GetDriverDashboardDataDto) {
        const { start_date, end_date } = dto || {};
        const driver = await this.driverDetailsRepo.findOne({
            where: {
                user: { id: user.id }
            }
        });
        if (!driver) throw new NotFoundException("Driver not found");
        const { startDate, endDate } = this.getDateRange(start_date, end_date);
        const assignments = await this.orderDriverAssignmentRepo
            .createQueryBuilder('oda')
            .leftJoinAndSelect('oda.order', 'order')
            .where('oda.driver_id = :driverId', { driverId: driver.id })
            .andWhere('order.id IS NOT NULL') // ensure order exists
            .andWhere('oda.created_at >= :startDate', { startDate })
            .andWhere('oda.created_at <= :endDate', { endDate })
            .getMany();

        // Totals
        const total = assignments.length;
        const assigned = assignments.filter(a => a.status === DriverAssignmentStatus.ASSIGNED).length;
        // const totalRejectedOrders = assignments.filter(a => a.status === DriverAssignmentStatus.REJECTED).length;
        const completed = assignments.filter(a => a.status === DriverAssignmentStatus.DELIVERED).length;
        const picked = assignments.filter(a => a.status === DriverAssignmentStatus.PICKED).length;
        const accepted = assignments.filter(a => a.status === DriverAssignmentStatus.ACCEPTED).length;
        const cancel = assignments.filter(a => a.order?.order_status === OrderStatus.CANCEL).length;
        const active = accepted + picked

        return {
            orders: {
                total, assigned, completed, accepted, picked, cancel, active
            }
        };
    }

    async getShopkeeperDashboardStats(user: User, dto: GetDashboardDataDto) {
        const { start_date, end_date } = dto || {};
        const shopkeeper = await this.shopkeeperDetailsRepo.findOne({
            where: {
                user: { id: user.id }
            }, relations: ['merchant', 'store']
        });
        if (!shopkeeper) throw new NotFoundException("Shopkeeper not fuond");
        if (!shopkeeper.merchant) throw new NotFoundException("merchant details of shopkeeper not fuond");
        if (!shopkeeper.store) throw new NotFoundException("store of shopkeeper not fuond");
        const { startDate, endDate } = this.getDateRange(start_date, end_date);
        // ✅ Revenue
        const revenueQb = await this.buildRevenueQuery({
            merchantId: shopkeeper.merchant.id,
            storeId: shopkeeper.store.id,
            startDate,
            endDate
        });
        const revenueResult = await revenueQb.getRawOne<{ totalRevenue: string }>();
        const totalRevenue = revenueResult?.totalRevenue
            ? Number(revenueResult.totalRevenue)
            : 0;

        // ✅ Orders
        const orderQb = this.buildOrderStatsQuery({
            merchantId: shopkeeper.merchant.id,
            storeId: shopkeeper.store.id,
            startDate,
            endDate,
        });
        const orderCounts = await orderQb.getRawMany<{ status: OrderStatus; count: string }>();
        const { totalPendingOrders, totalCancelOrders, totalActiveOrders } =
            this.calculateOrderStats(orderCounts);

        // ✅ Stores
        const storeQb = this.buildActiveStoresQuery({ merchantId: shopkeeper.merchant.id });
        const activeStores = await storeQb.getCount();

        return {
            totalRevenue,
            totalActiveOrders,
            totalPendingOrders,
            totalCancelOrders,
            totalActiveStores: activeStores,
        };
    }

    // 🔹 Helper to safely extract order counts
    // private findCount(
    //     arr: { status: string; count: string }[],
    //     status: string,
    // ): number {
    //     const found = arr.find((x) => x.status === status);
    //     return found ? Number(found.count) : 0;
    // }

    async getRecentOrders(user: User, dto: GetRecentOrdersDto): Promise<any> {
        const { status, store_id, limit =5 } = dto || {};
        const page = 1;
        // const effectiveLimit = Math.min(limit, 50);

        let qb = this.orderRepo.createQueryBuilder('o')
            .leftJoinAndSelect('o.items', 'items')
            .leftJoinAndSelect('items.shop_product', 'sp')
            .leftJoinAndSelect('sp.product', 'product')
            .leftJoinAndSelect('sp.store', 'store')
            .leftJoinAndSelect('store.merchant', 'merchant')
            .where('store.is_deleted = false')

        // 🧩 Role-based filters
        if (user.role === UserRole.SHOPKEEPER) {
            const shopkeeper = await this.shopkeeperDetailsRepo.findOne({
                where: { user: { id: user.id } },
                relations: ['store'],
            });
            if (!shopkeeper || !shopkeeper.store)
                throw new NotFoundException('Shopkeeper store not found');

            qb = qb.andWhere('store.id = :storeId', { storeId: shopkeeper.store.id });
        }

        if (user.role === UserRole.MERCHANT) {
            const merchant = await this.merchantDetailsRepo.findOne({
                where: { user: { id: user.id } },
            });
            if (!merchant)
                throw new NotFoundException('Merchant not found');

            qb = qb.andWhere('store.merchant_id = :merchantId', { merchantId: merchant.id });

            if (store_id) {
                qb = qb.andWhere('store.id = :storeId', { storeId: store_id });
            }
        }

        // 🧩 Optional status filter
        if (status) {
            qb = qb.andWhere('o.order_status = :status', { status });
        }

        // 🧩 Sort by latest orders
        qb = qb.orderBy('o.updated_at', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)

        // ✅ Execute query
        const orders = await qb.getMany();
        return orders
    }

    async getRevenueByStore(user: User, dto: GetStoreRevenueDto) {
        const { store_id, start_date, end_date, merchant_id } = dto || {};
        let merchantId: string | undefined;
        if (user.role === UserRole.MERCHANT) {
            const merchant = await this.merchantDetailsRepo.findOne({
                where: { user: { id: user.id } },
                relations: ['stores']
            });
            if (!merchant) throw new NotFoundException("Merchant details not found");
            const storeExists = merchant.stores.some(s => s.id === store_id && !s.is_deleted);
            if (!storeExists) throw new BadRequestException("Store does not belong to this merchant");
            merchantId = merchant.id;
        } else if (user.role === UserRole.ADMIN) {
            merchantId = merchant_id || undefined;
        } else {
            throw new BadRequestException("Invalid role")
        }
        const qb = await this.buildRevenueQuery({
            merchantId,
            storeId: store_id,
            startDate: start_date,
            endDate: end_date
        });

        const result = await qb.getRawOne<{ totalRevenue: string }>();
        return { totalRevenue: result?.totalRevenue ? Number(result.totalRevenue) : 0 };
    }

    async getRevenueByMerchantNew(user: User, dto: GetMerchantReenueDto) {
        const { start_date, end_date, merchant_id } = dto || {};
        let merchantId: string | undefined;
        if (user.role === UserRole.MERCHANT) {
            const merchant = await this.merchantDetailsRepo.findOne({
                where: {
                    user: {
                        id: user.id
                    }
                }
            });
            if (!merchant) throw new NotFoundException("Merchant details not found");
            merchantId = merchant.id;
        } else if (user.role === UserRole.ADMIN) {
            if (!merchant_id) throw new BadRequestException("Merchant_id required for admin role");
            merchantId = dto.merchant_id;
        } else {
            throw new BadRequestException("Invalid role")
        }
        const qb = await this.buildRevenueQuery({
            merchantId,
            startDate: start_date,
            endDate: end_date
        });
        const result = await qb.getRawOne<{ totalRevenue: string }>();
        return { totalRevenue: result?.totalRevenue ? Number(result.totalRevenue) : 0 };
    }

    async getRevenueByMerchant(user: User, dto: GetMerchantReenueDto) {
        const { start_date, end_date, merchant_id } = dto || {};
        let merchantId: string | undefined;
        if (user.role === UserRole.MERCHANT) {
            const merchant = await this.merchantDetailsRepo.findOne({
                where: {
                    user: {
                        id: user.id
                    }
                }
            });
            if (!merchant) throw new NotFoundException("Merchant details not found");
            merchantId = merchant.id;
        } else if (user.role === UserRole.ADMIN) {
            if (!merchant_id) throw new BadRequestException("Merchant_id required for admin role");
            merchantId = dto.merchant_id;
        } else {
            throw new BadRequestException("Invalid role")
        }
        const subQuery = this.orderRepo
            .createQueryBuilder('o')
            .select('o.id')
            .leftJoin('o.items', 'items')
            .leftJoin('items.shop_product', 'shop_product')
            .leftJoin('shop_product.store', 'store')
            .leftJoin('store.merchant', 'merchant')
            .where('merchant.id = :merchantId', { merchantId })
            .andWhere('o.order_status = :status', { status: OrderStatus.COMPLETE });

        if (start_date) subQuery.andWhere('order.created_at >= :startDate', { startDate: start_date });
        if (end_date) {
            const endDateWithTime = new Date(end_date);
            endDateWithTime.setUTCHours(23, 59, 59, 999);
            console.log({ endDateWithTime });
            subQuery.andWhere('order.created_at <= :endDate', { endDate: endDateWithTime });
        }
        const qb = this.orderRepo
            .createQueryBuilder('order')
            .select('SUM(order.total_payable_amount)', 'totalRevenue')
            .where(`order.id IN (${subQuery.getQuery()})`)
            .setParameters(subQuery.getParameters());
        const result = await qb.getRawOne<{ totalRevenue: string }>();
        return { totalRevenue: result?.totalRevenue ? Number(result.totalRevenue) : 0 };
    }

    async getGlobalRevenue(startDate?: Date, endDate?: Date) {
        const qb = this.orderRepo
            .createQueryBuilder('order')
            .select('SUM(order.total_payable_amount)', 'totalRevenue')
            .where('order.order_status = :status', { status: 'COMPLETED' });

        if (startDate) qb.andWhere('order.created_at >= :startDate', { startDate });
        if (endDate) qb.andWhere('order.created_at <= :endDate', { endDate });

        return qb.getRawOne<{ totalRevenue: string }>();
    }

}
