import { BadRequestException, Body, Controller, Get, HttpCode, HttpException, HttpStatus, Post, Req, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ChangePasswordDto, CreateMerchantDto, ForgotPasswordDto, LoginDto, OtpDto, RefreshTokenDto, ResendOtpDto, ResetPasswordDto, SendOtpDto, signUpDto, VerifyResetPasswordOtpDto } from './dto/auth.dto';
import { Roles } from '../common/decorators/role.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { RefreshTokenGuard, SupabaseAuthGuard } from '../common/guards/auth.guard';
import CurrentUser from '../common/decorators/user.decorator';
import { User } from '../entities/user.entity';
import { FetchUserPipe } from '../common/pipes/fetch-user.pipe';
import { CreateDrivertDto, CreateShopkeeperDto } from './dto/staff.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe())
    @UseInterceptors(FileInterceptor('profile_picture'))
    async register(@Body() dto: signUpDto, @UploadedFile() file: Express.Multer.File) {
        try {
            const createUser = await this.authService.register(dto, null, file);
            return createUser;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('verify-otp')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async verifyOtp(@Body() dto: OtpDto) {
        try {
            const verify = await this.authService.verifyOtp(dto);
            return verify;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('send-otp')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async sendOtpToDestination(@Body() dto: SendOtpDto) {
        try {
            const sendOtp = await this.authService.sendOtp(dto);
            return sendOtp;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // @Post('resend-otp')
    // @HttpCode(HttpStatus.OK)
    // async resendOtp(@Body() dto: ResendOtpDto) {
    //     try {
    //         const resenOtp = this.authService.resendOtp(dto);
    //         return resenOtp
    //     } catch (error: any) {
    //         throw new HttpException(
    //             error.message,
    //             error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
    //         );
    //     }
    // }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async login(@Body() dto: LoginDto) {
        try {
            const data = await this.authService.login(dto);
            return data;
        } catch (error: any) {
            console.log(error);
            throw new HttpException(error.message, error.status);
        }
    }

    @Post('change-password')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async changePassword(
        @Body() dto: ChangePasswordDto
    ) {
        try {
            const data = await this.authService.changePassword(dto);
            return data
        } catch (error: any) {
            throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
        }
    }

    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        try {
            const result = await this.authService.forgotPassword(dto);
            return result;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('verify-reset-password-otp')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async verifyResetPasswordOtp(@Body() dto: VerifyResetPasswordOtpDto) {
        try {
            const result = await this.authService.verifyResetPasswordOtp(dto);
            return result;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async resetPassword(@Body() dto: ResetPasswordDto) {
        try {
            const result = await this.authService.resetPassword(dto);
            return result;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post("refresh-token")
    @UseGuards(RefreshTokenGuard)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async refresh(@Req() req: any) {
        try {
            const refresh_token = req?.refreshToken;
            const result = await this.authService.refreshToken(refresh_token);
            return result
        } catch (error: any) {
            throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
        }
    }

    @Post('merchant-details')
    @Roles(UserRole.MERCHANT)
    @UseGuards(SupabaseAuthGuard)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async addMerchantDetials(@Body() dto: CreateMerchantDto, @CurrentUser(FetchUserPipe) user: User) {
        try {
            const merchant = await this.authService.merhcantDetails(dto, user);
            return merchant;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('merchant/staff-register')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.MERCHANT)
    @UsePipes(new ValidationPipe())
    @UseInterceptors(FileInterceptor('profile_picture'))
    async registerStaffForMerchant(
        @Body() dto: signUpDto,
        @CurrentUser(FetchUserPipe) user: User,
        @UploadedFile() file: Express.Multer.File
    ) {
        try {
            if ([UserRole.DRIVER, UserRole.SHOPKEEPER].includes(dto.role)) {
                const createStaffUsers = await this.authService.register(dto, user, file);
                return createStaffUsers;
            } else {
                throw new BadRequestException("Invalid Role");
            }
        } catch (error: any) {
            console.log({ error });
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // @Post('driver-details')
    // @Roles(UserRole.DRIVER)
    // @UseGuards(SupabaseAuthGuard)
    // @HttpCode(HttpStatus.OK)
    // @UsePipes(new ValidationPipe())
    // async addDriverDetials(@Body() dto: CreateDrivertDto, @CurrentUser(FetchUserPipe) user: User) {
    //     try {
    //         const driver = await this.authService.driverDetails(dto, user);
    //         return driver;
    //     } catch (error: any) {
    //         throw new HttpException(
    //             error.message,
    //             error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
    //         );
    //     }
    // }

    // @Post('shopkeeper-details')
    // @Roles(UserRole.SHOPKEEPER)
    // @UseGuards(SupabaseAuthGuard)
    // @HttpCode(HttpStatus.OK)
    // @UsePipes(new ValidationPipe())
    // async addShopkeeperDetials(@Body() dto: CreateShopkeeperDto, @CurrentUser(FetchUserPipe) user: User) {
    //     try {
    //         const shopkeeper = await this.authService.shopkeeperDetails(dto, user);
    //         return shopkeeper;
    //     } catch (error: any) {
    //         throw new HttpException(
    //             error.message,
    //             error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
    //         );
    //     }
    // }

    @Post('customer-details')
    @Roles(UserRole.CUSTOMER)
    @UseGuards(SupabaseAuthGuard)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async addCustomerDetials(@Body() dto: CreateShopkeeperDto, @CurrentUser(FetchUserPipe) user: User) {
        try {
            const customer = await this.authService.customerDetails(dto, user);
            return customer;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('get-user-details')
    @UseGuards(SupabaseAuthGuard)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async getUserDetails(@CurrentUser(FetchUserPipe) user: User) {
        try {
            const userDetails = await this.authService.getUserDetails(user);
            return userDetails;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
