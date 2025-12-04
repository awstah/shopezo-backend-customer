import { Type } from 'class-transformer';
import { IsInt, Min, IsString, ArrayNotEmpty, ValidateNested, IsOptional, IsNotEmpty, IsEnum, MaxLength, IsEmail, IsNumber, Max, IsBoolean } from 'class-validator';
import { OrderStatus } from '../../common/enums/order.enum';
import { PaymentMethod } from '../../common/enums/payment.enum';
import { IsPhoneNumberPKOrUAE } from '../../common/validators/phone-number.validator';


export class AddToCartDto {
    @IsString()
    product_id: string;

    @IsInt()
    @Min(1)
    quantity: number;
}

export class UpdateCartItemDto {
    @IsString()
    cart_item_id: string;

    @IsInt()
    @Min(1)
    quantity: number;
}

export class UpdateCartItemProductDto {
    @IsString()
    product_id: string;

    @IsInt()
    @Min(1)
    quantity: number;
}

export class UpdateCartItemsDto {
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => UpdateCartItemProductDto)
    items: UpdateCartItemProductDto[];
}

export class CreateOrderDto {
    user_id: string;
}

export class CheckoutDto {
    @IsOptional()
    @IsString()
    address: string;

    @IsNotEmpty()
    @IsString()
    customer_address_id: string;

    // @IsOptional()
    // @IsString()
    // address_2?: string;

    // @IsOptional()
    // @IsString()
    // city?: string;

    // @IsOptional()
    // @IsString()
    // state?: string;

    // @IsOptional()
    // @IsString()
    // country?: string;

    @IsEnum(PaymentMethod)
    payment_method: PaymentMethod;
}

// export class UpdateOrderStatusDto {
//     @IsEnum(OrderStatus)
//     status: OrderStatus;
// }

export class UpdateCustomerProfileDto {
    @IsOptional()
    @IsString()
    @MaxLength(50)
    username: string;

    @IsOptional()
    @IsEmail()
    email: string;

    @IsString()
    @IsOptional()
    first_name: string;

    @IsString()
    @IsOptional()
    last_name: string;

    @IsString()
    @IsOptional()
    @IsPhoneNumberPKOrUAE()
    phone_number: string;

    @IsOptional()
    @IsString()
    address_1: string;

    @IsOptional()
    @IsString()
    address_2?: string;

    @IsOptional()
    @IsString()
    country: string;

    @IsOptional()
    @IsString()
    state: string;

    @IsOptional()
    @IsString()
    city: string;
}

export class CreateCustomerAddressDto {
    @IsString()
    @IsNotEmpty()
    customer_id: string;

    @IsString()
    @IsNotEmpty()
    address_line: string;

    @IsString()
    @IsNotEmpty()
    city: string;

    @IsString()
    @IsNotEmpty()
    state: string;

    @IsString()
    @IsNotEmpty()
    country: string;

    @IsOptional()
    @IsString()
    postal_code?: string;

    @IsOptional()
    @IsNumber()
    @Min(-90)
    @Max(90)
    latitude?: number;

    @IsOptional()
    @IsNumber()
    @Min(-180)
    @Max(180)
    longitude?: number;

    @IsOptional()
    @IsString()
    label?: string;

    @IsOptional()
    @IsBoolean()
    is_primary?: boolean;
}

export class UpdateAddressDto {
    @IsString()
    @IsNotEmpty()
    address_id: string;

    @IsString()
    @IsNotEmpty()
    customer_id: string;

    @IsString()
    @IsOptional()
    address_line: string;

    @IsString()
    @IsOptional()
    city: string;

    @IsString()
    @IsOptional()
    state: string;

    @IsString()
    @IsOptional()
    country: string;

    @IsOptional()
    @IsString()
    postal_code?: string;

    @IsOptional()
    @IsNumber()
    @Min(-90)
    @Max(90)
    latitude?: number;

    @IsOptional()
    @IsNumber()
    @Min(-180)
    @Max(180)
    longitude?: number;

    @IsOptional()
    @IsString()
    label?: string;

    @IsOptional()
    @IsBoolean()
    is_primary?: boolean;
}

export class TogglePrimaryAddressDto {
    @IsNotEmpty()
    @IsString()
    address_id: string;
}


