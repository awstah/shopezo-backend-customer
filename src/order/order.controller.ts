import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Param, Post, Query, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { Roles } from '../common/decorators/role.decorator';
import CurrentUser from '../common/decorators/user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { SupabaseAuthGuard } from '../common/guards/auth.guard';
import { FetchUserPipe } from '../common/pipes/fetch-user.pipe';
import { CheckoutDto } from '../customer/dto/customer.dto';
import { OrderService } from './order.service';
import { User } from '../entities/user.entity';
import { AdminGetOrdersDto, AssignOrderDto, GetDriverOrdersStatusDto, UpdateDriverOrderStatusDto, UpdateOrderStatusDto } from './dto/order.dto';
import { PaginationDto } from '../common/common-dtos/pagination.dto';
import { DriverAssignmentStatus, OrderStatus } from '../common/enums/order.enum';
import { PaymentMethod } from '../common/enums/payment.enum';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('order')
export class OrderController {
    constructor(
        private readonly orderService: OrderService
    ) { }

    @Post('create-order')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.CUSTOMER)
    @UsePipes(new ValidationPipe())
    async placeOrder(
        @Body() dto: CheckoutDto,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const order = await this.orderService.createOrder(user, dto);
            return order;
        } catch (error: any) {
            console.log(error);
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('get-customer-orders')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.CUSTOMER)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async customerOrders(
        @CurrentUser(FetchUserPipe) user: User,
        @Query() query: PaginationDto,
        @Query('status') status?: OrderStatus,
        @Query('payment-type') payment_type?: PaymentMethod
    ) {
        try {
            const customerorders = await this.orderService.getCustomerOrders(user, query, status, payment_type);
            return customerorders;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('get-all-orders')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.ADMIN, UserRole.MERCHANT)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async allOrders(
        @Query() dto: AdminGetOrdersDto,
        @Query() query: PaginationDto,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const getAllOrders = await this.orderService.getAllOrdersForAdmin(user, dto, query);
            return getAllOrders;
        } catch (error: any) {
            console.log({ error });
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('get-order-details/:id')
    @UseGuards(SupabaseAuthGuard)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async getOrder(
        @Param('id') order_id: string,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const orderDetail = await this.orderService.getOrderDetail(user, order_id);
            return orderDetail;
        } catch (error: any) {
            console.log({ error });
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('driver/get-order-details/:id')
    @UseGuards(SupabaseAuthGuard)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async getDriverOrder(
        @Param('id') order_id: string,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const orderDetail = await this.orderService.getDriverOrderDetail(user, order_id);
            return orderDetail;
        } catch (error: any) {
            console.log({ error });
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('assign-order-to-driver')
    @HttpCode(HttpStatus.OK)
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.MERCHANT, UserRole.SHOPKEEPER)
    @UsePipes(new ValidationPipe())
    async assignOrder(
        @Body() dto: AssignOrderDto,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const assignOrder = await this.orderService.assignOrderToDriver(user, dto);
            return assignOrder;
        } catch (error: any) {
            console.log(error);
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('update-order-status')
    @HttpCode(HttpStatus.OK)
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.MERCHANT, UserRole.SHOPKEEPER)
    @UsePipes(new ValidationPipe())
    async updateOrderStatus(
        @Body() dto: UpdateOrderStatusDto,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const updateOrderStatus = await this.orderService.orderStatus(user, dto);
            return updateOrderStatus;
        } catch (error: any) {
            console.log(error);
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('get-driver-orders')
    @HttpCode(HttpStatus.OK)
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.DRIVER)
    @UsePipes(new ValidationPipe())
    async driverOrders(
        @Query() query: PaginationDto,
        @Query() dto: GetDriverOrdersStatusDto,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const getDriverOrders = await this.orderService.getAllDriverOrders(user, query, dto);
            return getDriverOrders;
        } catch (error: any) {
            console.log(error);
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('update-order-status-by-driver')
    @HttpCode(HttpStatus.OK)
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.DRIVER)
    @UsePipes(new ValidationPipe())
    @UseInterceptors(FileInterceptor('delivery_image'))
    async updateOrderStatusByDriver(
        @Body() dto: UpdateDriverOrderStatusDto,
        @CurrentUser(FetchUserPipe) user: User,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        try {
            console.log({file});
            const updateOrderStatus = await this.orderService.orderStatusByDriver(user, dto, file);
            return updateOrderStatus;
        } catch (error: any) {
            console.log(error);
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
