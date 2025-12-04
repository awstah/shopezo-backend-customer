import { IsDefined, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, ValidateIf, ValidateNested } from "class-validator";
import { UserRole, VerifyType } from "../../common/enums/user-role.enum";
import { Type } from "class-transformer";
import { CreateDrivertDto, CreateShopkeeperDto } from "./staff.dto";
import { IsPhoneNumberPKOrUAE } from "../../common/validators/phone-number.validator";

export class signUpDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    @IsOptional()
    username: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    first_name: string;

    @IsString()
    @IsNotEmpty()
    last_name: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    @IsPhoneNumberPKOrUAE()
    phone_number: string;

    @IsEnum(UserRole)
    role: UserRole;

    // Driver details only required when role === DRIVER
    @ValidateIf((o) => o.role === UserRole.SHOPKEEPER)
    @IsDefined()
    @ValidateNested()
    @Type(() => CreateShopkeeperDto)
    shopkeeper_details: CreateShopkeeperDto;

    // Shopkeeper details only required when role === SHOPKEEPER
    @ValidateIf((o) => o.role === UserRole.DRIVER)
    @IsDefined()
    @ValidateNested()
    @Type(() => CreateDrivertDto)
    driver_details: CreateDrivertDto;
}

export class LoginDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}

export class ChangePasswordDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    newPassword: string;
}

export class RefreshTokenDto {

    @IsString()
    @IsNotEmpty()
    user_id: string;

    @IsString()
    @IsNotEmpty()
    refresh_token: string;
}

export class CreateMerchantDto {
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
    businessname: string;
}

export class OtpDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(6)
    otp: string

    @IsString()
    @IsNotEmpty()
    destination: string

    @IsEnum(VerifyType)
    @IsNotEmpty()
    type: VerifyType;
}

export class SendOtpDto {
    @IsEnum(VerifyType)
    @IsNotEmpty()
    type: VerifyType;

    @IsString()
    @IsNotEmpty()
    destination: string;
}


export class ResendOtpDto {
    @IsString()
    @IsNotEmpty()
    phone_number: string
}

export class ForgotPasswordDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
}

export class VerifyResetPasswordOtpDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(6)
    otp: string;
}

export class ResetPasswordDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    newPassword: string;
}