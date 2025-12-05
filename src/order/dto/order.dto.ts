import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DriverAssignmentStatus, OrderStatus } from '../../common/enums/order.enum';
import { UserRole } from '../../common/enums/user-role.enum';
import { PaymentMethod } from '../../common/enums/payment.enum';

export class AdminGetOrdersDto {
    @IsOptional()
    @IsString()
    merchant_id?: string; // filter by merchant

    @IsOptional()
    @IsString()
    user_id?: string; // filter by user

    @IsOptional()
    @IsString()
    customer_id?: string; // filter by customer

    @IsOptional()
    @IsString()
    store_id?: string; // filter by store

    @IsOptional()
    @IsString()
    shop_product_id?: string;

    @IsOptional()
    @IsString()
    shopkeeper_id?: string;

    @IsOptional()
    @IsString()
    driver_id?: string;

    @IsOptional()
    @IsEnum(OrderStatus)
    status?: OrderStatus;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
}

export class AssignOrderDto {
    @IsString()
    @IsNotEmpty()
    order_id: string;

    @IsString()
    @IsNotEmpty()
    driver_id: string;

    // @IsString()
    // @IsNotEmpty()
    // store_id: string;
}

export class UpdateDriverOrderStatusDto {
    @IsNotEmpty()
    @IsString()
    order_id: string;

    @IsNotEmpty()
    @IsString()
    driver_id: string;

    @IsNotEmpty()
    @IsEnum(DriverAssignmentStatus)
    status: DriverAssignmentStatus;

    @IsOptional()
    @IsString()
    latitude: string;

    @IsOptional()
    @IsString()
    longitude: string;
}

export class UpdateOrderStatusDto {
    @IsNotEmpty()
    @IsString()
    order_id: string;

    @IsNotEmpty()
    @IsEnum(OrderStatus)
    status: OrderStatus;
}

export class GetDriverOrdersStatusDto {
    @IsOptional()
    @IsEnum({ ...OrderStatus, ...DriverAssignmentStatus })
    status: OrderStatus | DriverAssignmentStatus;
}

export class ReorderDto {
    @IsNotEmpty()
    @IsString()
    order_id: string;

    @IsNotEmpty()
    @IsString()
    customer_address_id: string;

    @IsEnum(PaymentMethod)
    payment_method: PaymentMethod;
}