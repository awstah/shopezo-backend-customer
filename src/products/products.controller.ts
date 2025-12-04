import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Post, Query, UploadedFiles, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Roles } from '../common/decorators/role.decorator';
import CurrentUser from '../common/decorators/user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { SupabaseAuthGuard } from '../common/guards/auth.guard';
import { FetchUserPipe } from '../common/pipes/fetch-user.pipe';
import { ProductsService } from './products.service';
import { CreateProductDto, DeleteImagesDto, GetProductDto, UpdateProductDto } from './dto/products.dto';
import { User } from '../entities/user.entity';
import { EnhancedScraperService, ScraperService } from '../utils/scrapper.service';
import { GetProductsDto, PaginationDto } from '../common/common-dtos/pagination.dto';
import { GetMasterProductParamsDto } from './dto/getMasterProductParams.dto';

@Controller('products')
export class ProductsController {
    constructor(
        private readonly productService: ProductsService,
        private readonly scraperService: ScraperService,
        private readonly ehnhancedScraperService: EnhancedScraperService,
    ) { }

    // ========================== MERCHANT + ADMIN APIS ========================
    @Post('add-product')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.MERCHANT, UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    @UseInterceptors(FilesInterceptor('product_images', 4))
    async addProducts(
        @Body() dto: CreateProductDto,
        @UploadedFiles() images: Express.Multer.File[],
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const product = await this.productService.createProduct(dto, images, user);
            return product;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('add-product-images')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.MERCHANT, UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    @UseInterceptors(FilesInterceptor('product_images'))
    async addImages(
        @Body() dto: GetProductDto,
        @UploadedFiles() files: Express.Multer.File[],
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const addImage = await this.productService.addImagesToProduct(user, dto, files);
            return addImage;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('get-all-master-products')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.ADMIN, UserRole.MERCHANT)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async getAllProducts(@Query() query: GetMasterProductParamsDto) {
        try {
            const { page, limit, ...filterDto } = query;
            const paginationDto: PaginationDto = { page, limit };
            const getMasterProducts = await this.productService.getAllMasterProducts(filterDto, paginationDto);
            return getMasterProducts;
        } catch (error: any) {
            console.log({ error });
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('scrap-images')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.MERCHANT, UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async scrapeImagesFromWeb(@Body('product_name') query: string) {
        try {
            const urls = await this.scraperService.scrapeImages(query);
            return { images: urls };
        } catch (err) {
            throw new HttpException(
                'Scraping failed: ' + err.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('scrap-images/s3')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.MERCHANT, UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async scrapeImagesFromWeb1(@Body('product_name') query: string, @Body('from_web') fromWebOnly?: boolean,) {
        try {
            const urls = await this.ehnhancedScraperService.getProductImages(query, 5, fromWebOnly || false);
            return { images: urls };
        } catch (err) {
            throw new HttpException(
                'Scraping failed: ' + err.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('generate-product-details')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.MERCHANT, UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async generateProductDetailsFromAi(@Body('product_name') product_name: string) {
        try {
            const details = await this.productService.generateProductDetails(product_name);
            return details;
        } catch (err) {
            throw new HttpException(
                'Scraping failed: ' + err.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('get-product-detail')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.MERCHANT, UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async getProductDetails(
        @Body() dto: GetProductDto,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const getSignleProductDetails = await this.productService.getProduct(user, dto);
            return getSignleProductDetails;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('update-product')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async updateProductOfStore(
        @Body() dto: UpdateProductDto,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const update = await this.productService.updateProduct(dto, user);
            return update;
        } catch (error: any) {
            console.log({ error });
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('delete-product')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async deleteProduct(
        @Body() dto: GetProductDto,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const softDelete = await this.productService.softDeleteProuct(user, dto);
            return softDelete;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('delete-product-images')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async deleteImages(
        @Body() dto: DeleteImagesDto,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const softDeleteImages = await this.productService.deleteProductImages(user, dto);
            return softDeleteImages;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
