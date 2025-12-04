import { Type } from "class-transformer";
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";
import { IsPhoneNumberPKOrUAE } from "../../common/validators/phone-number.validator";

export class CraeteStoreDto {
    @IsNotEmpty()
    @IsString()
    store_name: string;

    @IsString()
    @IsNotEmpty()
    store_address: string;

    @Type(() => Number)
    @IsNumber()
    @Min(-90)
    @Max(90)
    latitude?: number;

    @Type(() => Number)
    @IsNumber()
    @Min(-180)
    @Max(180)
    longitude?: number;
}

export class UpdateStoreDto {
    @IsOptional()
    @IsString()
    store_name: string;

    @IsString()
    @IsOptional()
    store_address: string;

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    @Min(-90)
    @Max(90)
    latitude?: number;

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    @Min(-180)
    @Max(180)
    longitude?: number;
}

export class UpdateStatusDto {
    @IsNotEmpty()
    @IsString()
    employee_id: string;

    @IsString()
    @IsNotEmpty()
    status: string;
}

export class UpdateMerchantProfileDto {
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

    @IsOptional()
    @IsString()
    businessname: string;
}