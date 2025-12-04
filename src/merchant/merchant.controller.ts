import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { SupabaseAuthGuard } from '../common/guards/auth.guard';
import { Roles } from '../common/decorators/role.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import CurrentUser from '../common/decorators/user.decorator';
import { FetchUserPipe } from '../common/pipes/fetch-user.pipe';
import { User } from '../entities/user.entity';
import { CraeteStoreDto, UpdateMerchantProfileDto, UpdateStatusDto, UpdateStoreDto } from './dto/merchant.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaginationDto } from '../common/common-dtos/pagination.dto';
import { CreateMerchantBannerDto, MerchantStoreBannerDto, UpdateBannerDto, UpdateMerchantStoreBannerDto } from '../admin/dto/admin.dto';
import { EmployeeStatus } from '../common/enums/employee.enum';

@Controller('merchant')
export class MerchantController {
    constructor(private readonly merchantService: MerchantService) { }

    @Post('add-merchant-store-banner')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.MERCHANT)
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe())
    @UseInterceptors(FileInterceptor('banner_image'))
    async createMerchantBanner(
        @Body() dto: CreateMerchantBannerDto,
        @UploadedFile() file: Express.Multer.File,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const createMerchantBanner = await this.merchantService.merchantBanner(user, dto, file);
            return createMerchantBanner;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('get-merchant-store-banners/:store_id')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    @UseInterceptors(FileInterceptor('banner_image'))
    async getMerchantBanners(
        @Param('store_id') store_id: string,
    ) {
        try {
            const createMerchantBanner = await this.merchantService.merchantStoreBanners(store_id);
            return createMerchantBanner;
        } catch (error: any) {
            console.log({ error });
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('update-merchant-store-banner')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.MERCHANT)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    @UseInterceptors(FileInterceptor('banner_image'))
    async updateBanner(
        @Body() dto: UpdateMerchantStoreBannerDto,
        @UploadedFile() file: Express.Multer.File,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const updateBanner = await this.merchantService.updateMerchantStoreBanner(user, dto, file);
            return updateBanner;
        } catch (error: any) {
            console.log({ error });
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('get-single-merchant-store-banner')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async getSingleBanner(@Body() dto: MerchantStoreBannerDto) {
        try {
            const getBanner = await this.merchantService.merchantStoreBanner(dto);
            return getBanner;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('delete-merchant-store-banner')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.MERCHANT)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async deleteBanner(
        @Body() dto: MerchantStoreBannerDto,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const deleteBanner = await this.merchantService.deleteMerchantStoreBanner(user, dto);
            return deleteBanner;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('update-merchant-profile')
    @Roles(UserRole.MERCHANT)
    @UseGuards(SupabaseAuthGuard)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async updateCustomerDetails(@Body() dto: UpdateMerchantProfileDto, @CurrentUser(FetchUserPipe) user: User) {
        try {
            const updateUser = await this.merchantService.updateMerchantProfile(user, dto);
            return updateUser;
        } catch (error: any) {
            console.log({ error });
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('get-merchant-users')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.MERCHANT)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async getUsers(
        @CurrentUser(FetchUserPipe) user: User, 
        @Query('role') role?: UserRole,
        @Query('status') status?: EmployeeStatus
    ) {
        try {
            const merchantUsers = await this.merchantService.getMerchantUsers(user, role, status);
            return merchantUsers;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('update-employee-status')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.MERCHANT)
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe())
    async updateStatus(
        @Body() dto: UpdateStatusDto,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const updateStatus = await this.merchantService.updateEmployeeStatus(dto, user);
            return updateStatus;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('create-store')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.MERCHANT)
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe())
    @UseInterceptors(FileInterceptor('store_logo'))
    async createStore(
        @Body() dto: CraeteStoreDto,
        @UploadedFile() file: Express.Multer.File,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const createStore = await this.merchantService.createStore(dto, file, user);
            return createStore;
        } catch (error: any) {
            console.log({ error });
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('update-store/:id')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.MERCHANT)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    @UseInterceptors(FileInterceptor('store_logo'))
    async upadteStore(
        @Body() dto: UpdateStoreDto,
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const createStore = await this.merchantService.upadateStore(dto, file, user, id);
            return createStore;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('get-all-stores')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.MERCHANT)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async getStores(
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const getStores = await this.merchantService.getAllStores(user);
            return getStores;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('get-single-store/:id')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.MERCHANT)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async getStore(
        @Param('id') id: string,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const getStore = await this.merchantService.getSingleStore(user, id);
            return getStore;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Delete('delete-store/:id')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.MERCHANT)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async deleteStore(
        @Param('id') id: string,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const deleteStore = await this.merchantService.deleteStore(user, id);
            return deleteStore;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('get-store-drivers/:store_id')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.MERCHANT, UserRole.SHOPKEEPER)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async storeDrivers(
        @Param('store_id') store_id: string,
        @CurrentUser(FetchUserPipe) user: User,
        @Query() query: PaginationDto
    ) {
        try {
            const storeDrivers = await this.merchantService.getStoreDrivers(user, store_id, query);
            return storeDrivers;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}