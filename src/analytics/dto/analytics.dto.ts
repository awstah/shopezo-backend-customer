import { IsString, IsOptional, IsNotEmpty, IsEnum, IsInt, Min, Max } from 'class-validator';
import { OrderStatus } from '../../common/enums/order.enum';

export class GetMerchantReenueDto {
    @IsString()
    @IsOptional()
    merchant_id?: string;

    // @IsString()
    @IsOptional()
    start_date?: Date;

    @IsOptional()
    end_date?: Date;
}

export class GetStoreRevenueDto extends GetMerchantReenueDto {
    @IsString()
    @IsNotEmpty()
    store_id: string;
}

export class GetDashboardDataDto {
    @IsString()
    @IsOptional()
    merchant_id?: string;

    // @IsString()
    @IsOptional()
    start_date?: Date;

    @IsOptional()
    end_date?: Date;

    @IsString()
    @IsOptional()
    store_id: string;

    @IsString()
    @IsOptional()
    status: OrderStatus;
}

export class GetDriverDashboardDataDto {
    // @IsString()
    @IsOptional()
    start_date?: Date;

    @IsOptional()
    end_date?: Date;
}


export class GetRecentOrdersDto {
    @IsOptional()
    @IsEnum(OrderStatus)
    status: OrderStatus;

    @IsOptional()
    @IsString()
    store_id: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(20)
    limit: number; // default 5 or 10
}

