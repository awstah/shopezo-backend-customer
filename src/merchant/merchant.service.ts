import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { CraeteStoreDto, UpdateMerchantProfileDto, UpdateStatusDto, UpdateStoreDto } from './dto/merchant.dto';
import { Stores } from '../entities/stores.entity';
import { UploadService } from '../utils/upload.service';
import { Merchant } from '../entities/merchantDetails.entity';
import { ACL_ACCESS } from '../common/enums/product.enum';
import { Driver } from '../entities/driverDetails.entity';
import { PaginationDto } from '../common/common-dtos/pagination.dto';
import { paginate } from '../utils/product.utils';
import { EmployeeStatus } from '../common/enums/employee.enum';
import { DriverAvailabilityStatus } from '../common/enums/driver.enum';
import { DriverAssignmentStatus } from '../common/enums/order.enum';
import { Banner } from '../entities/banner.entity';
import { CreateMerchantBannerDto, MerchantStoreBannerDto, UpdateMerchantStoreBannerDto } from '../admin/dto/admin.dto';

@Injectable()
export class MerchantService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Stores)
        private readonly storeRepo: Repository<Stores>,
        private uploadService: UploadService,
        @InjectRepository(Merchant)
        private readonly merchantRepo: Repository<Merchant>,
        @InjectRepository(Driver)
        private readonly driverRepo: Repository<Driver>,
        @InjectRepository(Banner)
        private readonly bannerRepo: Repository<Banner>
    ) { }

    async merchantBanner(user: User, dto: CreateMerchantBannerDto, file: Express.Multer.File): Promise<Banner> {
        const findMerchnatBanners = await this.bannerRepo.find({
            where: {
                store: {
                    id: dto.store_id
                },
                user: {
                    id: user.id
                },
                is_deleted: false
            }
        });
        if (findMerchnatBanners.length > Number(process.env.BANNER_LIMIT) - 1) {
            throw new BadRequestException(`Banner limit exeeded. You can add only ${process.env.BANNER_LIMIT}`)
        }
        const banner = this.bannerRepo.create({
            title: dto.title,
            user: { id: user.id },
            store: { id: dto.store_id }
        });
        const savedBanner = await this.bannerRepo.save(banner);
        if (file) {
            const fileUrl = await this.uploadService.uploadFile(file, 'store_banner', savedBanner.id, ACL_ACCESS.PUBLIC_READ);
            console.log({ fileUrl });
            savedBanner.image = fileUrl;
            console.log({ fileUrl, savedBanner });
            await this.bannerRepo.save(savedBanner);
        }
        return savedBanner;
    }

    async merchantStoreBanners(store_id: string): Promise<Banner[]> {
        const banners = await this.bannerRepo.find({
            where: {
                is_deleted: false,
                store: {
                    id: store_id,
                }
            }
        });
        return banners
    }

    async updateMerchantStoreBanner(user: User, dto: UpdateMerchantStoreBannerDto, file: Express.Multer.File): Promise<Banner> {
        const banner = await this.bannerRepo.findOne({
            where: {
                id: dto.banner_id,
                is_deleted: false,
                user: {
                    id: user.id
                }
            }, relations: ['store']
        });
        if (!banner) throw new NotFoundException("Banner not found");
        if (dto.title) {
            banner.title = dto.title
        };
        if (dto.store_id) {
            const bannerLimit = Number(process.env.BANNER_LIMIT) || 5
            const existingBannersCount = await this.bannerRepo.count({
                where: {
                    store: { id: dto.store_id },
                    is_deleted: false
                }
            });
            if (existingBannersCount >= bannerLimit) {
                throw new BadRequestException(
                    `Store already has ${existingBannersCount} active banners. Limit is ${bannerLimit}`
                );
            }
            banner.store = { id: dto.store_id } as any;
        }
        if (file) {
            const fileUrl = await this.uploadService.uploadFile(file, 'store_banner', banner.id, ACL_ACCESS.PUBLIC_READ);
            banner.image = fileUrl;
        }
        return this.bannerRepo.save(banner);
    }

    async merchantStoreBanner(dto: MerchantStoreBannerDto): Promise<Banner> {
        const banner = await this.bannerRepo.findOne({
            where: { id: dto.banner_id, is_deleted: false, store: { id: dto.store_id } }
        });
        if (!banner) throw new NotFoundException("Banner not found");
        return banner
    }

    async deleteMerchantStoreBanner(user: User, dto: MerchantStoreBannerDto): Promise<any> {
        const banner = await this.bannerRepo.findOne({
            where: { id: dto.banner_id, is_deleted: false, store: { id: dto.store_id }, user: { id: user.id } }
        });
        if (!banner) throw new NotFoundException("Banner not found or already delted");
        banner.is_deleted = true;
        await this.bannerRepo.save(banner)
        return {
            message: "Banner deleted successfully"
        }
    }

    async updateMerchantProfile(user: User, dto: UpdateMerchantProfileDto): Promise<any> {
        const findUserWithMerchantDetails = await this.userRepo.findOne({
            where: {
                id: user.id,
                role: user.role,
                is_verified: true
            }, relations: ['merchant']
        });
        if (!findUserWithMerchantDetails || !findUserWithMerchantDetails.merchant) {
            throw new NotFoundException('Merchant details not found. Please complete profile.');
        };
        if (dto.email && dto.email !== findUserWithMerchantDetails.email) {
            const emailTaken = await this.userRepo.findOne({ where: { email: dto.email } });
            if (emailTaken) throw new ConflictException("Email already in use");
        }
        if (dto.username && dto.username !== findUserWithMerchantDetails.username) {
            const usernameTaken = await this.userRepo.findOne({ where: { username: dto.username } });
            if (usernameTaken) throw new ConflictException('Username already in use.');
        }
        // Update User fields if provided
        if (dto.first_name !== undefined) findUserWithMerchantDetails.first_name = dto.first_name;
        if (dto.last_name !== undefined) findUserWithMerchantDetails.last_name = dto.last_name;
        if (dto.email !== undefined) findUserWithMerchantDetails.email = dto.email;
        if (dto.username !== undefined) findUserWithMerchantDetails.username = dto.username;
        if (dto.phone_number !== undefined) findUserWithMerchantDetails.phone_number = dto.phone_number;

        // Update Customer fields if provided
        const mcerchantDetailsProfile: Merchant = findUserWithMerchantDetails.merchant;
        if (dto.address_1 !== undefined) mcerchantDetailsProfile.address_1 = dto.address_1;
        if (dto.address_2 !== undefined) mcerchantDetailsProfile.address_2 = dto.address_2;
        if (dto.country !== undefined) mcerchantDetailsProfile.country = dto.country;
        if (dto.state !== undefined) mcerchantDetailsProfile.state = dto.state;
        if (dto.city !== undefined) mcerchantDetailsProfile.city = dto.city;
        if (dto.businessname !== undefined) mcerchantDetailsProfile.businessname = dto.businessname;
        await Promise.all([
            this.userRepo.save(findUserWithMerchantDetails),
            this.merchantRepo.save(mcerchantDetailsProfile),
        ]);
        const { password, ...userWithoutPassword } = findUserWithMerchantDetails;
        return {
            message: 'Profile updated successfully',
            data: userWithoutPassword,
        };

    }

    async getMerchantUsers(user: User, role?: UserRole, status?: EmployeeStatus): Promise<any> {
        const findUser = await this.userRepo.findOne({
            where: {
                id: user.id
            }
        });
        if (!findUser) throw new NotFoundException("User not found");
        const findMerchnatUsers = await this.userRepo.find({
            where: {
                parentUser: { id: user.id },
                role: role,
                status
            }, relations: role ? [role.toLowerCase()] : [UserRole.SHOPKEEPER.toLowerCase(), UserRole.DRIVER.toLowerCase()]
        });
        const result = findMerchnatUsers.map(({ password, ...user }) => user);
        return result
    }

    async updateEmployeeStatus(dto: UpdateStatusDto, user: User): Promise<any> {
        const findUser = await this.userRepo.findOne({
            where: {
                id: user.id
            }
        });
        if (!findUser) throw new NotFoundException("User not found");
        const findEmployee = await this.userRepo.findOne({
            where: {
                id: dto.employee_id,
                parentUser: {
                    id: user.id
                }
            }
        });
        if (!findEmployee) throw new NotFoundException("Employee not found");
        findEmployee.status = dto.status;
        if (dto.status === EmployeeStatus.ACTIVE) {
            findEmployee.is_phone_verified = true;
            findEmployee.is_email_verified = true;
            findEmployee.is_verified = true;
        } else {
            findEmployee.is_phone_verified = false;
            findEmployee.is_email_verified = false;
            findEmployee.is_verified = false;
        }
        await this.userRepo.save(findEmployee);
        const { password, ...employeeWithoutPassword } = findEmployee
        return {
            message: "Status has been updated",
            employeeWithoutPassword
        }
    }

    async createStore(dto: CraeteStoreDto, logo: Express.Multer.File, user: User): Promise<Stores> {
        const findMerchant = await this.merchantRepo.findOne({
            where: {
                user: {
                    id: user.id
                }
            }
        });
        if (!findMerchant) throw new NotFoundException("Merchant details not found");
        // console.log({merchant: findUser.merchant});
        const existingStore = await this.storeRepo.findOne({
            where: { store_name: dto.store_name }
        });
        if (existingStore) throw new BadRequestException("Store with this name already exists")
        const store = this.storeRepo.create({
            store_name: dto.store_name,
            store_address: dto.store_address,
            user: { id: user.id },
            merchant: { id: findMerchant.id },
            latitude: dto.latitude,
            longitude: dto.longitude
        });
        const saved = await this.storeRepo.save(store);

        if (logo) {
            const logoUrl = await this.uploadService.uploadFile(logo, 'stores', saved.store_name, ACL_ACCESS.PUBLIC_READ);
            console.log({ logoUrl });
            saved.store_logo = logoUrl;
            console.log({ logoUrl, saved });
            await this.storeRepo.save(saved);
        }

        return saved;
    }

    async upadateStore(dto: UpdateStoreDto, logo: Express.Multer.File, user: User, id: string): Promise<Stores> {
        const findMerchant = await this.merchantRepo.findOne({
            where: {
                user: { id: user.id }
            }
        });
        if (!findMerchant) throw new NotFoundException("Merchant details not found");
        const findStore = await this.storeRepo.findOne({
            where: { id, is_deleted: false, user: { id: user.id }, merchant: { id: findMerchant.id } }
        });
        if (!findStore) throw new NotFoundException("Store not found");
        findStore.store_name = dto.store_name;
        findStore.store_address = dto.store_address;
        if (dto.latitude) findStore.latitude = dto.latitude
        if (dto.longitude) findStore.longitude = dto.longitude

        const saved = await this.storeRepo.save(findStore);
        console.log({ saved });

        if (logo) {
            const logoUrl = await this.uploadService.uploadFile(logo, 'stores', saved.id, ACL_ACCESS.PUBLIC_READ);
            console.log({ logoUrl });
            saved.store_logo = logoUrl;
            console.log({ logoUrl, saved });
            await this.storeRepo.save(saved);
        }

        return saved;
    }

    async getAllStores(user: User): Promise<Stores[]> {
        const findUser = await this.userRepo.findOne({
            where: {
                id: user.id
            }
        });
        if (!findUser) throw new NotFoundException("User not found");
        const getStores = await this.storeRepo.find({
            where: { user: { id: user.id }, is_deleted: false }
        });
        return getStores
    }

    async getSingleStore(user: User, id: string): Promise<any> {
        const store = await this.storeRepo
            .createQueryBuilder('store')
            .leftJoinAndSelect('store.user', 'user')
            .leftJoinAndSelect('store.shop_products', 'shop_products', 'shop_products.is_deleted = :isDeleted', { isDeleted: false })
            .leftJoinAndSelect('shop_products.product', 'product', 'product.is_deleted = :isDeleted', { isDeleted: false })
            .leftJoinAndSelect('product.images', 'images', 'images.is_deleted = :isDeleted', { isDeleted: false })
            .leftJoinAndSelect('product.category', 'category')
            .where('store.id = :id', { id })
            .andWhere('store.is_deleted = :false', { false: false })
            .andWhere('user.id = :userId', { userId: user.id })
            .getOne();

        if (!store) throw new NotFoundException('Store not found');
        const { password, ...userWithoutPassword } = store.user;
        const shopProducts = store.shop_products?.map((sp) => ({
            ...sp,
            price: Number(sp.price)
        }));
        return {
            ...store,
            user: userWithoutPassword,
            shop_products: shopProducts,
        };
    }

    async deleteStore(user: User, id: string): Promise<any> {
        const findUser = await this.userRepo.findOne({
            where: {
                id: user.id
            }
        });
        if (!findUser) throw new NotFoundException("User not found");
        const findStore = await this.storeRepo.findOne({
            where: { id, user: { id: user.id }, is_deleted: false }
        });
        if (!findStore) throw new NotFoundException('Store not found or already deleted');
        findStore.is_deleted = true;
        await this.storeRepo.save(findStore);
        return { message: "Store has been deleted successfully" }
    }

    async getStoreDrivers(user: User, store_id: string, query: PaginationDto): Promise<any> {
        const store = await this.storeRepo.findOne({
            where: {
                id: store_id,
                is_deleted: false,
            }, relations: ['merchant', 'shop_keepers', 'merchant.user', 'shop_keepers.user']
        });
        if (!store) throw new NotFoundException("Store not found");
        const isMerchantOwner = store.merchant?.user?.id === user.id;
        const isShopkeeperOwner = store.shop_keepers?.some(
            (sk) => sk.user?.id === user.id,
        );
        if (!isMerchantOwner && !isShopkeeperOwner) {
            throw new BadRequestException('Invalid store');
        }
        const qb = this.driverRepo
            .createQueryBuilder('driver')
            .leftJoinAndSelect('driver.user', 'user')
            .leftJoinAndSelect('driver.assignments', 'assignedOrders')
            .where('driver.store_id = :storeId', { storeId: store.id })
            .andWhere('driver.driver_status = :driverStatus', { driverStatus: DriverAvailabilityStatus.FREE })
            .andWhere('user.status = :status', { status: EmployeeStatus.ACTIVE })
            .andWhere('user.is_verified = :isVerified', { isVerified: true })
        // .orderBy('driver.created_at', 'DESC');

        const { data, total, page, limit } = await paginate(qb, query);
        const sanitizedData = data.map((driver) => {
            if (driver.user) {
                const driverAssignedOrdersLength = driver.assignments.filter(order => order.status === DriverAssignmentStatus.ASSIGNED || order.status === DriverAssignmentStatus.ACCEPTED);
                const totalAssignedOrdersToDriver = driverAssignedOrdersLength.length;
                const { password, ...userWithoutPassword } = driver.user;
                return { ...driver, user: userWithoutPassword, assignedOrders: totalAssignedOrdersToDriver };
            }
            return driver;
        });
        return {
            data: sanitizedData,
            total,
            page,
            limit,
        };
    }
}
