import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post, Query, UploadedFile, UploadedFiles, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { AdminService } from './admin.service';
import { SupabaseAuthGuard } from '../common/guards/auth.guard';
import { UserRole } from '../common/enums/user-role.enum';
import { Roles } from '../common/decorators/role.decorator';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ColumnMappingDto, CreateBannerDto, GetUploadedFileJobs, PublishTempProductsDto, ToggleArchiveDto, UpdateBannerDto } from './dto/admin.dto';
import { FetchUserPipe } from '../common/pipes/fetch-user.pipe';
import CurrentUser from '../common/decorators/user.decorator';
import { User } from '../entities/user.entity';
import { diskStorage } from 'multer';
import { PaginationDto } from '../common/common-dtos/pagination.dto';

@Controller('admin')
export class AdminController {
    constructor(
        private readonly adminService: AdminService
    ) { }

    @Get('get-all-stores')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async getStores(
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const getStores = await this.adminService.getAllStores(user);
            return getStores;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // =====================================BANNER APIS============================================
    @Post('add-banner')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe())
    @UseInterceptors(FileInterceptor('banner_image'))
    async createBanner(
        @Body() dto: CreateBannerDto,
        @UploadedFile() file: Express.Multer.File,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const createBanner = await this.adminService.createBanner(user, dto, file);
            return createBanner;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('update-banner')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    @UseInterceptors(FileInterceptor('banner_image'))
    async updateBanner(
        @Body() dto: UpdateBannerDto,
        @UploadedFile() file: Express.Multer.File,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const updateBanner = await this.adminService.updateBanner(user, dto, file);
            return updateBanner;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('get-banners')
    // @UseGuards(SupabaseAuthGuard)
    // @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async getBanners(@Query() paginationDto: PaginationDto) {
        try {
            const getBanners = await this.adminService.getAllBanners(paginationDto);
            return getBanners;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('get-single-banner/:id')
    // @UseGuards(SupabaseAuthGuard)
    // @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async getSingleBanner(@Param('id') id: string) {
        try {
            const getBanner = await this.adminService.getBanner(id);
            return getBanner;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('delete-banner')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async deleteBanner(
        @Body('banner_id') banner_id: string,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const deleteBanner = await this.adminService.deleteBanner(user, banner_id);
            return deleteBanner;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // ==========================================USERS RELATED APIS=================================
    @Get('get-all-users')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ transform: true }))
    async getAllUsersForAdmin(@Query() query: PaginationDto, @Query('role') role?: UserRole) {
        try {
            const getUsers = await this.adminService.getAllUsers(role || null, query);
            return getUsers;
        } catch (error: any) {
            console.log({ error });
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('get-merchant-users-with-id/:merchant_id')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ transform: true }))
    async getMerchantUsers(
        @Param('merchant_id') merchant_id: string,
        @Query('role') role?: UserRole
    ) {
        try {
            const getUsers = await this.adminService.getMerchantUsers(merchant_id, role || null);
            return getUsers;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // @Post('upload-temp-products')
    // @UseGuards(SupabaseAuthGuard)
    // @Roles(UserRole.ADMIN)
    // @HttpCode(HttpStatus.CREATED)
    // @UseInterceptors(
    //     FilesInterceptor('files', 5, { // allow up to 5 files
    //         storage: diskStorage({
    //             destination: './uploads',
    //             filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
    //         }),
    //     }),
    // )
    // async uploadCsvFiles(@UploadedFiles() files: Express.Multer.File[]) {
    //     try {
    //         const bulkUpload = await this.adminService.bulkUpload(files);
    //         return bulkUpload;
    //                 } catch (error: any) {
    //         throw new HttpException(
    //             error.message,
    //             error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
    //         );
    //     }
    // }

    @Post('get-temp-products/headers')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(
        FileInterceptor('file', {
            limits: { files: 1 }, // only 1 file allowed
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) =>
                    cb(null, Date.now() + '-' + file.originalname),
            }),
        }),
    )
    async getCsvHeaders(@UploadedFile() file: Express.Multer.File) {
        const headers = await this.adminService.extractCsvHeaders(file);
        return { headers };
    }

    @Post('upload-temp-products')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(
        FileInterceptor('file', {
            limits: { files: 1 }, // only 1 file allowed
            storage: diskStorage({
                destination: './uploads',
                // filename: (req, file, cb) =>
                //     cb(null, Date.now() + '-' + file.originalname),
                filename: (req, file, cb) => {
                    const nameOnly = file.originalname.split('.')[0];
                    const timestamp = Date.now();
                    const fileName = `${nameOnly}-${timestamp}`;
                    cb(null, fileName);
                },
            }),
        }),
    )
    async bulkUploadWithMapping(
        @UploadedFile() file: Express.Multer.File,
        @Body() dto: ColumnMappingDto,
    ) {
        return this.adminService.bulkUploadWithMapping(file, dto.mapping, dto.merchant_id);
    }

    @Get('uploaded-jobs')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async getUploadJobs(@Body() dto: GetUploadedFileJobs, @Query() query: PaginationDto) {
        try {
            const uploadedJobs = await this.adminService.getAllUploadJobs(dto, query);
            return uploadedJobs
        } catch (error: any) {
            console.log({ error });
            throw new BadRequestException()
        }
    }

    @Get('upload-job-status/:jobId')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async getUploadJobStatus(@Param('jobId') jobId: string) {
        try {
            const uploadedJob = await this.adminService.getUploadJobStatus(jobId);
            return uploadedJob
        } catch (error: any) {
            console.log({ error });
            throw new BadRequestException()
        }
    }

    @Post('temp-products/publish')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async publishFile(
        @Body() dto: PublishTempProductsDto,
    ) {
        try {
            return this.adminService.publishFileToProducts(dto);
        } catch (error: any) {
            console.log({ error });
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('get-all-duplicate-products')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async getAllDuplicates(
        @Query() query: PaginationDto,
        @Query("file_name") file_name: string,
    ) {
        try {
            return this.adminService.getAllDuplicates(file_name, query);
        } catch (error: any) {
            console.log({ error });
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('get-duplicate-counts/:merchant_id')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async getDuplicateCounts(
        @Param('merchant_id') merchant_id: string
    ) {
        try {
            return this.adminService.getDuplicateCountsByMerchant(merchant_id);
        } catch (error: any) {
            console.log({ error });
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('get-duplicate-product-details/:dpId')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async getDuplicateDetails(
        @Param('dpId') dpId: string,
    ) {
        try {
            return this.adminService.getDuplicateProductDetails(dpId);
        } catch (error: any) {
            console.log({ error });
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('accept-duplicate-product/:dup_product_id')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async acceptDuplicate(
        @Param('dup_product_id') dup_product_id: string,
    ) {
        try {
            return this.adminService.acceptDuplicateProduct(dup_product_id);
        } catch (error: any) {
            console.log({ error });
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('reject-duplicate-product/:dup_product_id')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async rejectDuplicate(
        @Param('dup_product_id') dup_product_id: string,
    ) {
        try {
            return this.adminService.rejectDuplicateProduct(dup_product_id);
        } catch (error: any) {
            console.log({ error });
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('list-temp-products/files')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async getUploadedFiles(
        @Query('merchant_id') merchant_id: string,
    ) {
        try {
            return this.adminService.listUploadedFiles(merchant_id);
        } catch (error: any) {
            console.log({ error });
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('temp-products/entries')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async getFileEntries(
        @Query('file_name') fileName: string,
        @Query('merchant_id') merchant_id: string,
        @Query('is_archive') is_archive: boolean,
        @Query() paginationDto: PaginationDto,
    ) {
        try {
            if (is_archive === undefined) {
                return this.adminService.getAllFileEntries(fileName, merchant_id, paginationDto);
            } else {
                return this.adminService.getFileEntriesWithFilters(fileName, merchant_id, is_archive, paginationDto);
            }
        } catch (error: any) {
            console.log({ error });
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('archive-toggle-temp-products')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async setIsArchive(
        @Body() dto: ToggleArchiveDto
    ) {
        try {
            return this.adminService.archiveToggleTempProducts(dto);
        } catch (error: any) {
            console.log({ error });
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Delete('delete-temp-products/file/:fileName')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async deleteFileEntries(
        @Param('fileName') fileName: string,
        @Query('merchant_id') merchant_id: string,
    ) {
        try {
            return this.adminService.deleteFileEntries(fileName, merchant_id);
        } catch (error: any) {
            console.log({ error });
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('get-merchant-details/:merchant_user_id')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ transform: true }))
    async merchantDetails(
        @Param('merchant_user_id') merchant_user_id: string
    ) {
        try {
            const merchantDetails = await this.adminService.getMerchantDetails(merchant_user_id);
            return merchantDetails;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('get-store-drivers/:store_id')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async storeDrivers(
        @Param('store_id') store_id: string,
        @CurrentUser(FetchUserPipe) user: User,
        @Query() query: PaginationDto
    ) {
        try {
            const storeDrivers = await this.adminService.getStoreDrivers(user, store_id, query);
            return storeDrivers;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }


}
