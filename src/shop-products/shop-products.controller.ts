import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Param, Post, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ShopProductsService } from './shop-products.service';
import { ScraperService } from '../utils/scrapper.service';
import { Roles } from '../common/decorators/role.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { SupabaseAuthGuard } from '../common/guards/auth.guard';
import CurrentUser from '../common/decorators/user.decorator';
import { FetchUserPipe } from '../common/pipes/fetch-user.pipe';
import { User } from '../entities/user.entity';
import { MerchantShopProductsService } from './merchant/merchant-shop-products.service';
import { GetProductsDto, PaginationDto } from '../common/common-dtos/pagination.dto';
import { CustomerShopProductsService } from './customer/customer-shop-products.service';
import { UpdateShopProductDto, CreateShopProductDto, GetShopProductDto, SearchProduct, DeleteShopProductDto, SearchProductByStoreDto } from './dto/shop-product.dto';

@Controller('shop-products')
export class ShopProductsController {
    constructor(
        private readonly shopProductService: ShopProductsService,
        private readonly merchantShopProductService: MerchantShopProductsService,
        private readonly customerShopProductService: CustomerShopProductsService,
        // private readonly scraperService: ScraperService,
    ) { }

    // ===============================MERCHANT APIS===========================================
    @Post('merchant/add-shop-product')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.MERCHANT)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async addProductsToShop(
        @Body() dto: CreateShopProductDto,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const shopProduct = await this.merchantShopProductService.addShoptoProduct(user, dto);
            return shopProduct;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('merchant/update-shop-product')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.MERCHANT)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async updateMerchantShopProduct(
        @Body() dto: UpdateShopProductDto,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const updateShopProduct = await this.merchantShopProductService.updateShopProduct(user, dto);
            return updateShopProduct;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('merchant/get-all-shop-products')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.MERCHANT)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async getAllShopProductsOfMerchant(
        @CurrentUser(FetchUserPipe) user: User,
        @Query() query: PaginationDto
    ) {
        try {
            const updateShopProduct = await this.merchantShopProductService.getMerchantShopProducts(user, query);
            return updateShopProduct;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }


    @Get('top-selling')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.MERCHANT, UserRole.SHOPKEEPER)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async getTopSellingProducts(
        @CurrentUser(FetchUserPipe) user: User,
        @Query('store_id') storeId: string,
        @Query('top') top: string
    ) {
        try {
            return await this.merchantShopProductService.getTopSellingProducts(user, storeId, top);
        } catch (error) {
            console.log({error});
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }



    // ===============================ADMIN + MERCHANT APIS============================================
    // @Post('get-shop-product-detail')
    // @UseGuards(SupabaseAuthGuard)
    // @Roles(UserRole.MERCHANT, UserRole.ADMIN)
    // @HttpCode(HttpStatus.OK)
    // @UsePipes(new ValidationPipe())
    // async getShopProductDetails(
    //     @Body() dto: GetShopProductDto,
    //     @CurrentUser(FetchUserPipe) user: User
    // ) {
    //     try {
    //         const getSignleShopProductDetails = await this.shopProductService.getDetailOfShopProduct(user, dto);
    //         return getSignleShopProductDetails;
    //     } catch (error: any) {
    //         throw new HttpException(
    //             error.message,
    //             error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
    //         );
    //     }
    // }

    @Post('delete-shop-product')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.MERCHANT, UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async deletShopProduct(
        @Body() dto: DeleteShopProductDto,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const shopProduct = await this.merchantShopProductService.deletedShoptoProduct(user, dto);
            return shopProduct;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // ===================================COMMON APIS=============================================
    @Post('search-products')
    @UseGuards(SupabaseAuthGuard)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async searchProducts(
        @Body() dto: SearchProduct,
        @Query() paginationDto: GetProductsDto
    ) {
        try {
            const searchProducts = await this.shopProductService.searchProductsForStores(dto, paginationDto);
            return searchProducts;
        } catch (error: any) {
            console.log({ error });
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('search-store-products')
    @UseGuards(SupabaseAuthGuard)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async searchStoreProducts(
        @Body() dto: SearchProductByStoreDto,
        @Query() paginationDto: GetProductsDto
    ) {
        try {
            const searchStoreProducts = await this.shopProductService.searchProductsByStore(dto, paginationDto);
            return searchStoreProducts;
        } catch (error: any) {
            console.log({ error });
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('get-shop-products-of-single-store')
    @UseGuards(SupabaseAuthGuard)
    // @Roles(UserRole.MERCHANT, UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async getStoreProducts(
        @Body('store_id') storeId: string,
        @CurrentUser(FetchUserPipe) user: User,
        @Query() query: GetProductsDto
    ) {
        try {
            const getProducts = await this.shopProductService.getAllShopProductsOfSingleStore(user, storeId, query);
            return getProducts;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('shop-product-details/:id')
    @UseGuards(SupabaseAuthGuard)
    // @Roles(UserRole.CUSTOMER)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async getShopProductDetails(
        @Param('id') id: string,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const getShopProductDetail = await this.shopProductService.shopProductDetails(user, id);
            return getShopProductDetail;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // =====================================CUSTOMER + ADMIN APIS========================================
    @Get('get-all-shop-products')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async getAllShopProducts(
        @CurrentUser(FetchUserPipe) user: User,
        @Query() query: GetProductsDto
    ) {
        try {
            const getProducts = await this.shopProductService.listAllShopProducts(user, query);
            return getProducts;
        } catch (error: any) {
            console.log({ error });
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // =========================================CUSTOMER APIS==========================================
    @Post('customer/get-more-shop-products')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.CUSTOMER)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async getMoreSimilarProducts(
        @CurrentUser(FetchUserPipe) user: User,
        @Query() query: GetProductsDto,
        @Body('category_id') category_id: string
    ) {
        try {
            const getMoreProducts = await this.customerShopProductService.listMoreShopProducts(user, query, category_id);
            return getMoreProducts;
        } catch (error: any) {
            console.log({ error });
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
