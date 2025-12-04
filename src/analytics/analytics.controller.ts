import { Body, Controller, HttpCode, HttpException, HttpStatus, Post, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../common/decorators/role.decorator';
import CurrentUser from '../common/decorators/user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { SupabaseAuthGuard } from '../common/guards/auth.guard';
import { FetchUserPipe } from '../common/pipes/fetch-user.pipe';
import { GetDashboardDataDto, GetDriverDashboardDataDto, GetMerchantReenueDto, GetRecentOrdersDto, GetStoreRevenueDto } from './dto/analytics.dto';
import { User } from '../entities/user.entity';
import { PaginationDto } from '../common/common-dtos/pagination.dto';

@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticService: AnalyticsService) { }

    @Post('get-store-revenue')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.ADMIN, UserRole.MERCHANT)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async storeRevenue(
        @Body() dto: GetStoreRevenueDto,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const storeRevenue = await this.analyticService.getRevenueByStore(user, dto);
            return storeRevenue;
        } catch (error: any) {
            console.log({ error });
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('get-merchant-revenue')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.ADMIN, UserRole.MERCHANT)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async merchantRevenue(
        @Body() dto: GetMerchantReenueDto,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const getMerchantrevenue = await this.analyticService.getRevenueByMerchantNew(user, dto);
            return getMerchantrevenue;
        } catch (error: any) {
            console.log({ error });
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('dashboard/admin')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async getAdminDashboard(
        @Body() dto: GetDashboardDataDto,
        // @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            return await this.analyticService.getAdminDashboardStats(dto);
        } catch (error: any) {
            console.log({ error });
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Post('dashboard/merchant')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.MERCHANT)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async getMerchantDashboard(
        @Body() dto: GetDashboardDataDto,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            return await this.analyticService.getMerchantDashboardStats(user, dto);
        } catch (error: any) {
            console.log({ error });
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Post('dashboard/driver')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.DRIVER)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async getDriverDashboard(
        @Body() driverFilters: GetDriverDashboardDataDto,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            return await this.analyticService.getDriverDashboardStats(user, driverFilters);
        } catch (error: any) {
            console.log({ error });
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Post('dashboard/shopkeeper')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.SHOPKEEPER)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async getShopkeeperDashboard(
        @Body() dto: GetDashboardDataDto,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            return await this.analyticService.getShopkeeperDashboardStats(user, dto);
        } catch (error: any) {
            console.log({ error });
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Post('recent-orders')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.MERCHANT, UserRole.SHOPKEEPER)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async recentOrders(
        @Body() dto: GetRecentOrdersDto,
        @CurrentUser(FetchUserPipe) user: User,
    ) {
        try {
            return this.analyticService.getRecentOrders(user, dto);
        } catch (error: any) {
            console.log({ error });
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

}
