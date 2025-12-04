import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateDrivertDto {
    @IsString()
    address_1: string;

    @IsOptional()
    @IsString()
    address_2?: string;

    @IsString()
    country: string;

    @IsString()
    state: string;

    @IsString()
    city: string;

    @IsString()
    vehicle_type: string;

    @IsString()
    license_number: string;

    @IsString()
    current_status: string;

    @IsString()
    current_location: string;

    @IsString()
    @IsNotEmpty()
    merchant_id: string;

    @IsString()
    @IsNotEmpty()
    store_id: string;

    // @IsString()
    // @IsNotEmpty()
    // shopkeeper_id: string;
}

export class CreateShopkeeperDto {
    @IsString()
    address_1: string;

    @IsOptional()
    @IsString()
    address_2?: string;

    @IsString()
    country: string;

    @IsString()
    state: string;

    @IsString()
    city: string;

    @IsString()
    @IsNotEmpty()
    merchant_id: string;

    @IsString()
    @IsNotEmpty()
    store_id: string;
}