import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ChangePasswordDto, CreateMerchantDto, ForgotPasswordDto, LoginDto, OtpDto, RefreshTokenDto, ResendOtpDto, ResetPasswordDto, SendOtpDto, signUpDto, VerifyResetPasswordOtpDto } from './dto/auth.dto';
import { supabase } from '../config/supabase.config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { IsNull, Not, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole, VerifyType } from '../common/enums/user-role.enum';
import { Merchant } from '../entities/merchantDetails.entity';
import { Driver } from '../entities/driverDetails.entity';
import { Shopkepper } from '../entities/shopkeeperDetails.entity';
import { Customer } from '../entities/customerDetails.entity';
import { CreateDrivertDto, CreateShopkeeperDto } from './dto/staff.dto';
import { Stores } from '../entities/stores.entity';
import { EntityValidatorService } from '../utils/entity-validator.service';
import { UploadService } from '../utils/upload.service';
import { ACL_ACCESS } from '../common/enums/product.enum';
import { EmployeeStatus } from '../common/enums/employee.enum';
import { CacheService } from '../upstash_redis/cache.service';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Merchant)
        private merchantDetailsRepository: Repository<Merchant>,
        @InjectRepository(Driver)
        private driverDetailsRepository: Repository<Driver>,
        @InjectRepository(Shopkepper)
        private shopkeeperDetailsRepository: Repository<Shopkepper>,
        @InjectRepository(Customer)
        private customerDetailsRepository: Repository<Customer>,
        @InjectRepository(Stores)
        private storeRepository: Repository<Stores>,
        private readonly entityValidatorService: EntityValidatorService,
        private uploadService: UploadService,
        private readonly cacheService: CacheService,
    ) { }

    private async createAdditionalDetailsIfProvided(user: User, role: UserRole, dto: signUpDto, parent_user_id: string) {
        if (role === UserRole.DRIVER && dto.driver_details) {
            const { store_id, merchant_id } = dto?.driver_details;
            await this.entityValidatorService.validateEntities([
                this.entityValidatorService.getStoreCheck(store_id, merchant_id),
                this.entityValidatorService.getMerchantCheck(merchant_id, parent_user_id),
                // this.entityValidatorService.getShopkeeperCheck(shopkeeper_id, merchant_id, store_id),
            ]);
            await this.driverDetailsRepository.save(
                this.driverDetailsRepository.create({
                    ...dto.driver_details,
                    user: { id: user.id },
                    merchant: { id: merchant_id },
                    store: { id: store_id },
                    // shopkeeper: { id: shopkeeper_id }
                })
            );
        }

        if (role === UserRole.SHOPKEEPER && dto.shopkeeper_details) {
            const { store_id, merchant_id } = dto?.shopkeeper_details;
            await this.entityValidatorService.validateEntities([
                this.entityValidatorService.getStoreCheck(store_id, merchant_id),
                this.entityValidatorService.getMerchantCheck(merchant_id, parent_user_id)
            ]);
            await this.shopkeeperDetailsRepository.save(
                this.shopkeeperDetailsRepository.create({
                    ...dto.shopkeeper_details,
                    user: { id: user.id },
                    store: { id: store_id },
                    merchant: { id: merchant_id }
                })
            );
        }
    }

    async register(dto: signUpDto, user: User | null, file?: Express.Multer.File) {
        let { email, password, username, phone_number, role, first_name, last_name } = dto;
        email = email.trim().toLowerCase();
        username = username ? username.trim().toLowerCase() : email;
        const existingUser = await this.userRepo.findOne({
            where: [
                { email }, { username }]
        });
        if (existingUser) throw new ConflictException('Email or username already in use');
        const hashedPassword = await bcrypt.hash(password, 10);
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: { data: { username, phone_number, role } }
        });
        if (error) throw new ConflictException(error.message);
        // ✅ Upload profile picture if file is provided
        let profilePictureUrl: string | null = null;
        if (file) {
            profilePictureUrl = await this.uploadService.uploadFile(
                file,
                'users',
                username,
                ACL_ACCESS.PUBLIC_READ
            );
        }
        const newUser = this.userRepo.create({
            email,
            username,
            phone_number,
            password: hashedPassword,
            role: role,
            first_name,
            last_name,
            supabase_id: data?.user?.id,
            parentUser: { id: user?.id },
            profile_picture_url: profilePictureUrl || undefined,
            status: EmployeeStatus.INACTIVE
        });
        await this.userRepo.save(newUser);
        try {
            if (user) {
                await this.createAdditionalDetailsIfProvided(newUser, dto.role, dto, user.id);
            }
        } catch (err) {
            return {
                message: "User created but failed to add details",
                phone_number: dto.phone_number,
                error: err.message,
            };
        }


        try {
            const { data: otpData, error: otpError } = await supabase.auth.signInWithOtp({
                email: email,
                options: {
                    shouldCreateUser: true,
                }
            });
            
            if (otpError) {
                console.error('Error sending OTP email:', otpError);
            }
        } catch (otpErr) {
            console.error('Exception sending OTP email:', otpErr);
        }

        return {
            message: "User registered, please enter OTP to verify your email",
            email: email
        }
    }

    async verifyOtp(dto: OtpDto) {
        const { destination, otp, type } = dto;

        if (type === VerifyType.EMAIL) {
            const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
                email: destination,
                token: otp, 
                type: 'email', 
            });

            if (verifyError) {
                throw new UnauthorizedException(verifyError.message || "Invalid OTP");
            }
        } else if (type === VerifyType.PHONE_NUMBER) {
            const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
                phone: destination,
                token: otp, 
                type: 'sms', 
            });

            if (verifyError) {
                throw new UnauthorizedException(verifyError.message || "Invalid OTP");
            }
        } else {
            throw new BadRequestException("Invalid verification type");
        }
        // Find user by email or phone number
        const user = await this.userRepo.findOne({
            where: {
                [type === VerifyType.EMAIL ? 'email' : 'phone_number']: destination
            }
        });
        
        if (!user) throw new NotFoundException('User not found');

        if (dto.type === VerifyType.EMAIL) {
            user.is_email_verified = true
        } else if (dto.type === VerifyType.PHONE_NUMBER) {
            user.is_phone_verified = true
        } else {
            throw new BadRequestException("Invalid type")
        }
        user.is_verified = true;
        user.status = EmployeeStatus.ACTIVE;

        if (user.role === UserRole.ADMIN) {
            throw new BadRequestException("Can not be verified");
        } else {
            await this.userRepo.save(user);
        }
        
        if (user.role === UserRole.CUSTOMER) {
            const existingCustomer = await this.customerDetailsRepository.findOne({
                where: {
                    user: { id: user.id }
                }
            });
            if (!existingCustomer) {
                const newCustomer = this.customerDetailsRepository.create({
                    user: {
                        id: user.id
                    }
                });
                await this.customerDetailsRepository.save(newCustomer);
            } else {
                console.log(`customer with user id ${user.id} already exists`);
            }
        }
        const stripPassword = (u?: any) => u ? (({ password, ...rest }) => rest)(u) : u;

        return { message: "OTP verified successfully", user: stripPassword(user) };
    }

    async sendOtp(dto: SendOtpDto) {
        const { type, destination } = dto;

        const user = await this.userRepo.findOne({
            where: {
                [type === VerifyType.EMAIL ? 'email' : 'phone_number']: destination
            }
        });

        if (!user) throw new NotFoundException('User not found');

        if (user.is_verified) {
            throw new BadRequestException("User is already verified");
        }

        // Send OTP using Supabase
        if (type === VerifyType.EMAIL) {
            const { data: otpData, error: otpError } = await supabase.auth.signInWithOtp({
                email: destination,
                options: {
                    shouldCreateUser: true,
                }
            });
            if (otpError) {
                throw new BadRequestException(otpError.message || "Failed to send OTP");
            }
            return { message: "OTP sent successfully to your email" };
        } else if (type === VerifyType.PHONE_NUMBER) {
            const { data: otpData, error: otpError } = await supabase.auth.signInWithOtp({
                phone: destination,
                options: {channel: 'whatsapp'}
            });
            if (otpError) {
                throw new BadRequestException(otpError.message || "Failed to send OTP");
            }
            return { message: "OTP sent successfully to your phone number" };
        } else {
            throw new BadRequestException("Invalid verification type");
        }
    }


    async login(dto: LoginDto) {
        const { email, password } = dto;

        const findUserWithEmail = await this.userRepo.findOne({
            where: {
                email
            }
        });

        if (!findUserWithEmail) throw new NotFoundException("User not found");
        // if (!findUserWithEmail.is_verified) throw new UnauthorizedException("User not verified");

        const { data, error } = await supabase.auth.signInWithPassword({
            email, password
        });

        if (error) throw new UnauthorizedException(error.message || "unauthorized");

        const accessToken = data.session?.access_token;
        const refreshToken = data.session?.refresh_token;

        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        await this.userRepo.update(findUserWithEmail.id, { hashed_refresh_token: hashedRefreshToken });

        const userRole = data?.user?.user_metadata?.role
        let relations: string[] = [];

        switch (userRole) {
            case UserRole.CUSTOMER:
                relations = ['customer.addresses'];
                break;
            case UserRole.DRIVER:
                relations = ['driver'];
                break;
            case UserRole.MERCHANT:
                relations = ['merchant'];
                break;
            case UserRole.SHOPKEEPER:
                relations = ['shopkeeper.merchant'];
                break;
            default:
                relations = [];
        }
        const getUser = await this.userRepo.findOne({
            where: {
                supabase_id: data?.user.id
            }, relations: relations
        });
        const { password: _, hashed_refresh_token, ...userWithoutPassword } = getUser || {};
        return {
            message: "Login successful",
            user: userWithoutPassword,
            access_token: accessToken,
            refresh_token: findUserWithEmail.is_verified ? refreshToken : null
        }
    }

    async resendOtp(dto: ResendOtpDto) {
        const { phone_number } = dto;

        const findUser = await this.userRepo.findOne({
            where: { phone_number }
        });


        if (!findUser) throw new NotFoundException("User not found");

        if (findUser.is_verified) {
            throw new BadRequestException("User is already verified");
        }

        const otp = "123456";

        return {
            message: "OTP resent successfully",
            otp
        };
    }


    async changePassword(dto: ChangePasswordDto) {
        const { error } = await supabase.auth.updateUser(
            { password: dto.newPassword }
        );
        if (error) throw new BadRequestException(error.message);
        return { message: 'Password updated successfully' };
    }

    async forgotPassword(dto: ForgotPasswordDto) {
        const { email } = dto;
        const normalizedEmail = email.trim().toLowerCase();

        const user = await this.userRepo.findOne({
            where: {
                email: normalizedEmail
            }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (!user.is_verified) {
            throw new BadRequestException('User is not verified. Please verify your email first.');
        }

        const { data: otpData, error: otpError } = await supabase.auth.signInWithOtp({
            email: normalizedEmail,
            options: {
                shouldCreateUser: false,
            }
        });

        if (otpError) {
            throw new BadRequestException(otpError.message || "Failed to send password reset OTP");
        }

        return {
            message: "Password reset OTP sent successfully to your email",
            email: normalizedEmail
        };
    }

    async verifyResetPasswordOtp(dto: VerifyResetPasswordOtpDto) {
        const { email, otp } = dto;
        const normalizedEmail = email.trim().toLowerCase();

        const user = await this.userRepo.findOne({
            where: {
                email: normalizedEmail
            }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (!user.is_verified) {
            throw new BadRequestException('User is not verified. Please verify your email first.');
        }

        const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
            email: normalizedEmail,
            token: otp,
            type: 'email',
        });

        if (verifyError) {
            throw new UnauthorizedException(verifyError.message || "Invalid OTP");
        }

        if (!verifyData.session) {
            throw new UnauthorizedException("OTP verification failed. Please try again.");
        }

        const accessToken = verifyData.session.access_token;
        const refreshToken = verifyData.session.refresh_token;
        const expiresIn = 600;

        await this.cacheService.set(
            `password_reset:${normalizedEmail}`,
            { verified: true, accessToken, refreshToken },
            { ttl: expiresIn }
        );

        return {
            message: "OTP verified successfully. You can now reset your password.",
            email: normalizedEmail,
            expiresIn: expiresIn
        };
    }

    async resetPassword(dto: ResetPasswordDto) {
        const { email, newPassword } = dto;
        const normalizedEmail = email.trim().toLowerCase();

        const cachedVerification = await this.cacheService.get<{ verified: boolean; accessToken: string; refreshToken: string }>(
            `password_reset:${normalizedEmail}`
        );

        if (!cachedVerification || !cachedVerification.verified) {
            throw new UnauthorizedException("OTP not verified. Please verify OTP first.");
        }

        const user = await this.userRepo.findOne({
            where: {
                email: normalizedEmail
            }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (!user.is_verified) {
            throw new BadRequestException('User is not verified. Please verify your email first.');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const { createClient } = await import('@supabase/supabase-js');
        const supabaseWithSession = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        await supabaseWithSession.auth.setSession({
            access_token: cachedVerification.accessToken,
            refresh_token: cachedVerification.refreshToken
        });

        const { error: updateError } = await supabaseWithSession.auth.updateUser({
            password: newPassword
        });

        if (updateError) {
            throw new BadRequestException(updateError.message || "Failed to update password");
        }

        user.password = hashedPassword;
        await this.userRepo.save(user);

        await this.cacheService.del(`password_reset:${normalizedEmail}`);

        return {
            message: "Password reset successfully. Please login with your new password."
        };
    }

    async refreshToken(refresh_token: string) {

        const users = await this.userRepo.find({
            where: { hashed_refresh_token: Not(IsNull()) }
        });

        let user: User | null = null;

        for (const u of users) {
            const isValid = await bcrypt.compare(refresh_token, u.hashed_refresh_token);
            if (isValid) {
                user = u;
                break;
            }
        }

        if (!user || !user.hashed_refresh_token)
            throw new UnauthorizedException("Access denied");

        if (user.role !== UserRole.CUSTOMER) {
            throw new BadRequestException("Role access denied")
        }

        const { data, error } = await supabase.auth.refreshSession({ refresh_token });
        console.log({ data });

        if (error) throw new UnauthorizedException(error.message);

        const getUser = await this.userRepo.findOne({
            where: {
                supabase_id: data?.user?.id
            }, relations: ['customer']
        });
        const { password, hashed_refresh_token, ...userWithoutPassword } = getUser || {};

        const newAccessToken = data.session?.access_token;
        const newRefreshToken = data.session?.refresh_token;

        // Save new hashed refresh token
        const hashedNewRefresh = await bcrypt.hash(newRefreshToken as string, 10);
        await this.userRepo.update(user.id, { hashed_refresh_token: hashedNewRefresh });

        return {
            message: "Token refreshed successfully",
            user: userWithoutPassword,
            access_token: newAccessToken,
            refresh_token: newRefreshToken,
        };
    }


    async merhcantDetails(dto: CreateMerchantDto, user: User): Promise<Merchant> {
        let merchantDetails = await this.merchantDetailsRepository.findOne({
            where: {
                user: { id: user.id }
            }
        });
        if (merchantDetails) {
            merchantDetails = { ...merchantDetails, ...dto };
        } else {
            merchantDetails = this.merchantDetailsRepository.create({
                ...dto,
                user: { id: user.id },
            });
        }
        return await this.merchantDetailsRepository.save(merchantDetails);
    }

    // async driverDetails(dto: CreateDrivertDto, user: User): Promise<Driver> {
    //     let driverDetails = await this.driverDetailsRepository.findOne({
    //         where: {
    //             user: { id: user.id }
    //         }
    //     });
    //     if (driverDetails) {
    //         driverDetails = { ...driverDetails, ...dto };
    //     } else {
    //         driverDetails = this.driverDetailsRepository.create({
    //             ...dto,
    //             user: { id: user.id },
    //         });
    //     }
    //     return await this.driverDetailsRepository.save(driverDetails);
    // }

    // async shopkeeperDetails(dto: CreateShopkeeperDto, user: User): Promise<Shopkepper> {
    //     let shopkeeper = await this.shopkeeperDetailsRepository.findOne({
    //         where: {
    //             user: { id: user.id }
    //         }
    //     });
    //     if (shopkeeper) {
    //         shopkeeper = { ...shopkeeper, ...dto };
    //     } else {
    //         shopkeeper = this.shopkeeperDetailsRepository.create({
    //             ...dto,
    //             user: { id: user.id },
    //         });
    //     }
    //     return await this.shopkeeperDetailsRepository.save(shopkeeper);
    // }

    async customerDetails(dto: CreateShopkeeperDto, user: User): Promise<Customer> {
        let customer = await this.customerDetailsRepository.findOne({
            where: {
                user: { id: user.id }
            }
        });
        if (customer) {
            customer = { ...customer, ...dto };
        } else {
            customer = this.customerDetailsRepository.create({
                ...dto,
                user: { id: user.id },
            });
        }
        return await this.customerDetailsRepository.save(customer);
    }

    async getUserDetails(user: User): Promise<User | null> {
        const lowerCaseRole = user.role.trim().toLowerCase();
        const findUser = await this.userRepo.findOne({
            where: {
                id: user.id,
                role: user.role
            }, relations: [lowerCaseRole]
        });
        if (!findUser) throw new NotFoundException("User not found");
        return findUser
    }
}
