import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { CustomerService } from './customer.service';
import CurrentUser from '../common/decorators/user.decorator';
import { FetchUserPipe } from '../common/pipes/fetch-user.pipe';
import { User } from '../entities/user.entity';
import { Roles } from '../common/decorators/role.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { SupabaseAuthGuard } from '../common/guards/auth.guard';
import { AddFavToCartDto, AddToCartDto, AddToFavouriteDto, UpdateCartItemsDto } from './dto/cart.dto';
import { AddCardDto, UpdateCardDto } from './dto/payment-method.dto';
import { CreateCustomerAddressDto, TogglePrimaryAddressDto, UpdateAddressDto, UpdateCustomerProfileDto } from './dto/customer.dto';
import { PaginationDto } from '../common/common-dtos/pagination.dto';

@Controller('customer')
export class CustomerController {
    constructor(
        private readonly customerService: CustomerService
    ) { }

    @Get('get-store-categories')
    @Roles(UserRole.CUSTOMER)
    @UseGuards(SupabaseAuthGuard)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async storeCategories(@Query('store_id') storeId: string) {
        try {
            const storeCategories = await this.customerService.getCateoriesByStore(storeId);
            return storeCategories;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }


    @Post('update-customer-profile')
    @Roles(UserRole.CUSTOMER)
    @UseGuards(SupabaseAuthGuard)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async updateCustomerDetails(@Body() dto: UpdateCustomerProfileDto, @CurrentUser(FetchUserPipe) user: User) {
        try {
            const updateUser = await this.customerService.updateCustomerProfile(user, dto);
            return updateUser;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('add-card')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.CUSTOMER)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async addCard(
        @Body() dto: AddCardDto,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const addCard = await this.customerService.addCardDetails(user, dto);
            return addCard;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('update-card')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.CUSTOMER)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async updateCard(
        @Body() dto: UpdateCardDto,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const updateCard = await this.customerService.updateCardDetails(user, dto);
            return updateCard;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('remove-card/:id')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.CUSTOMER)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async deleteCard(
        @Param('id') id: string,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const deleteCard = await this.customerService.deleteCard(user, id);
            return deleteCard;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('card-details/:id')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.CUSTOMER)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async cardDetails(
        @Param('id') id: string,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const cardDetails = await this.customerService.getCardDetails(user, id);
            return cardDetails;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('get-cards')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.CUSTOMER)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async getCards(
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const getCards = await this.customerService.getUserCards(user);
            return getCards;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }


    @Get('get-stores')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.CUSTOMER)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async getAllStores(
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const getStores = await this.customerService.listAllStores(user);
            return getStores;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('store-details/:id')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.CUSTOMER)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async getStoreDetails(
        @Param('id') id: string,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const getStores = await this.customerService.storeDetails(user, id);
            return getStores;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('cart/add')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.CUSTOMER)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async addCart(
        @Body() dto: AddToCartDto,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const addCart = await this.customerService.addToCart(dto, user);
            return addCart;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('cart/update')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.CUSTOMER)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async updateCart(
        // @Body() dto: UpdateCartItemDto,
        @Body() dto: UpdateCartItemsDto,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const updateCart = await this.customerService.updateCartItem(user, dto);
            return updateCart;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('get-cart')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.CUSTOMER)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async getCart(
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const getCart = await this.customerService.getUserCart(user);
            // const getCart = await this.customerService.getOrCreateCart(user);
            return getCart;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Delete('cart/remove/:cart_item_id')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.CUSTOMER)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async removeItem(
        @Param('cart_item_id') cart_item_id: string,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const removeCart = await this.customerService.removeCartItem(cart_item_id, user);
            return removeCart;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('add-remove-fav')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.CUSTOMER)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async favProducts(
        @Body() dto: AddToFavouriteDto,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const toggleFav = await this.customerService.toggleFav(user, dto);
            return toggleFav;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('fav-to-cart')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.CUSTOMER)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async favToCart(
        @Body() dto: AddFavToCartDto,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const favtocart = await this.customerService.addFavoritesToCart(user, dto);
            return favtocart;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('get-favourties')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.CUSTOMER)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async getFavItems(
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const getFavs = await this.customerService.getFavItems(user);
            return getFavs;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('best-selling')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.CUSTOMER)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async bestSelling(
        @CurrentUser(FetchUserPipe) user: User,
        @Query('store_id') storeId: string,
        @Query() paginationDto: PaginationDto
    ) {
        try {
            const { page = 1, limit = 5 } = paginationDto;
            const bestSelling = await this.customerService.getBestSelling(user, storeId, limit, page);
            return bestSelling;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('frequent-search')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.CUSTOMER)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async frequesntlySearch(
        @CurrentUser(FetchUserPipe) user: User,
        @Query('store_id') storeId: string,
        @Query() paginationDto: PaginationDto
    ) {
        try {
            const { page = 1, limit = 5 } = paginationDto;
            const frequesntlySearch = await this.customerService.getFrequentlySearched(user, storeId, limit, page);
            return frequesntlySearch;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('exclusive-offer')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.CUSTOMER)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async exclusiveOffer(
        @CurrentUser(FetchUserPipe) user: User,
        @Query('store_id') storeId: string,
        @Query() paginationDto: PaginationDto
    ) {
        try {
            const { page = 1, limit = 5 } = paginationDto;
            const exclusiveOffer = await this.customerService.getExclusiveOffers(user, storeId, limit, page);
            return exclusiveOffer;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('add-address')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.CUSTOMER)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async addAddress(
        @Body() dto: CreateCustomerAddressDto,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const customerAddress = await this.customerService.createCustomerAddress(user, dto);
            return customerAddress;
        } catch (error: any) {
            console.log({ error });
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('update-address')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.CUSTOMER)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async updateAddress(
        @Body() dto: UpdateAddressDto,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const updateCustomerAddress = await this.customerService.updateCustomerAddress(user, dto);
            return updateCustomerAddress;
        } catch (error: any) {
            console.log({ error });
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('get-customer-addresses')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.CUSTOMER)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async getAddresses(
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const addresses = await this.customerService.getAllAddresses(user);
            return addresses;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('delete-address/:id')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.CUSTOMER)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async deleteAddress(
        @CurrentUser(FetchUserPipe) user: User,
        @Param('id') id: string
    ) {
        try {
            const deletetCustomerAddress = await this.customerService.deleteAddress(user, id);
            return deletetCustomerAddress;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('address-details/:id')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.CUSTOMER)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async addressDetails(
        @CurrentUser(FetchUserPipe) user: User,
        @Param('id') id: string
    ) {
        try {
            const getCustomerAddressDetails = await this.customerService.getAddressDetails(user, id);
            return getCustomerAddressDetails;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }


    @Post('toggle-address-as-primary')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.CUSTOMER)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async togglePrimaryAddress(
        @Body() dto: TogglePrimaryAddressDto,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            return this.customerService.toggleAddressAsPrimary(user, dto);
        } catch (error: any) {
            console.log({ error });
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }


}
