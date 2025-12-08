import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ComplaintStatus } from '../common/enums/complaint.enum';
import { PaginationDto } from '../common/common-dtos/pagination.dto';
import { UserRole } from '../common/enums/user-role.enum';
import { Complaint } from '../entities/complaint.entity';
import { Customer } from '../entities/customerDetails.entity';
import { Merchant } from '../entities/merchantDetails.entity';
import { Order } from '../entities/order.entity';
import { User } from '../entities/user.entity';
import { paginate } from '../utils/product.utils';
import { Repository } from 'typeorm';
import { CreateComplaintDto, UpdateComplaintStatusDto } from './dto/complaint.dto';
import { UploadService } from '../utils/upload.service';
import { ACL_ACCESS } from '../common/enums/product.enum';

@Injectable()
export class ComplaintService {
    constructor(
        @InjectRepository(Complaint)
        private readonly complaintRepo: Repository<Complaint>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Customer)
        private readonly customerRepo: Repository<Customer>,
        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>,
        @InjectRepository(Merchant)
        private readonly merchantRepo: Repository<Merchant>,
        private readonly uploadService: UploadService,
    ) { }

    async createComplaint(user: User, dto: CreateComplaintDto, file?: Express.Multer.File): Promise<any> {
        if (user.role !== UserRole.CUSTOMER) {
            throw new ForbiddenException('Only customers can create complaints');
        }

        const customer = await this.customerRepo.findOne({
            where: { user: { id: user.id } },
        });
        if (!customer) throw new NotFoundException('Customer details not found');

        let order: Order | null = null;
        let merchant: Merchant | null = null;

        if (dto.order_id) {
            order = await this.orderRepo.findOne({
                where: { id: dto.order_id },
                relations: ['customer', 'items', 'items.shop_product', 'items.shop_product.store', 'items.shop_product.store.merchant'],
            });
            if (!order) throw new NotFoundException('Order not found');
            if (order.customer.id !== customer.id) {
                throw new ForbiddenException('You can only raise complaints for your own orders');
            }
            const store = order.items[0]?.shop_product?.store;
            merchant = store?.merchant || null;
        }

        let imageUrl: string | null = null;
        if (file) {
            imageUrl = await this.uploadService.uploadFile(file, 'Complaint_images', customer.id, ACL_ACCESS.PUBLIC_READ);
        }

        const complaint = this.complaintRepo.create({
            subject: dto.subject,
            description: dto.description,
            customer,
            user,
            order: order || undefined,
            merchant: merchant || undefined,
            status: ComplaintStatus.OPEN,
            image_url: imageUrl || undefined,
        });
        const saved = await this.complaintRepo.save(complaint);
        const { password, ...safeUser } = user as any;
        return {
            message: 'Complaint created successfully',
            complaint: { ...saved, user: safeUser },
        };
    }

    async getComplaints(user: User, query: PaginationDto, status?: ComplaintStatus, merchantId?: string): Promise<any> {
        if (![UserRole.ADMIN, UserRole.MERCHANT].includes(user.role)) {
            throw new ForbiddenException('Access denied');
        }

        const qb = this.complaintRepo.createQueryBuilder('complaint')
            .leftJoinAndSelect('complaint.user', 'user')
            .leftJoinAndSelect('complaint.customer', 'customer')
            .leftJoinAndSelect('complaint.order', 'order')
            .leftJoinAndSelect('complaint.merchant', 'merchant')
            .leftJoinAndSelect('merchant.user', 'merchantUser')
            .orderBy('complaint.created_at', 'DESC');

        if (status) {
            qb.andWhere('complaint.status = :status', { status });
        }

        if (user.role === UserRole.MERCHANT) {
            const merchant = await this.merchantRepo.findOne({
                where: { user: { id: user.id } },
                relations: ['user'],
            });
            if (!merchant) {
                throw new ForbiddenException('Merchant details not found');
            }
            qb.andWhere('merchant.id = :merchantId', { merchantId: merchant.id });
        } else if (user.role === UserRole.ADMIN && merchantId) {
            qb.andWhere('merchant.id = :merchantId', { merchantId });
        }

        const result = await paginate(qb, query);
        result.data = result.data.map((complaint: any) => {
            if (complaint.user) {
                const { password, ...safeUser } = complaint.user;
                complaint.user = safeUser;
            }
            if (complaint.merchant?.user) {
                const { password, ...safeMerchantUser } = complaint.merchant.user;
                complaint.merchant.user = safeMerchantUser;
            }
            return complaint;
        });

        return result;
    }

    async getCustomerComplaints(user: User, query: PaginationDto, status?: ComplaintStatus): Promise<any> {
        if (user.role !== UserRole.CUSTOMER) {
            throw new ForbiddenException('Access denied');
        }

        const customer = await this.customerRepo.findOne({
            where: { user: { id: user.id } },
        });
        if (!customer) throw new NotFoundException('Customer details not found');

        const qb = this.complaintRepo.createQueryBuilder('complaint')
            .leftJoinAndSelect('complaint.user', 'user')
            .leftJoinAndSelect('complaint.order', 'order')
            .leftJoinAndSelect('complaint.merchant', 'merchant')
            .leftJoinAndSelect('merchant.user', 'merchantUser')
            .where('complaint.customer_id = :customerId', { customerId: customer.id })
            .orderBy('complaint.created_at', 'DESC');

        if (status) {
            qb.andWhere('complaint.status = :status', { status });
        }

        const result = await paginate(qb, query);
        result.data = result.data.map((complaint: any) => {
            if (complaint.user) {
                const { password, ...safeUser } = complaint.user;
                complaint.user = safeUser;
            }
            if (complaint.merchant?.user) {
                const { password, ...safeMerchantUser } = complaint.merchant.user;
                complaint.merchant.user = safeMerchantUser;
            }
            return complaint;
        });

        return result;
    }

    async updateComplaintStatus(user: User, id: string, dto: UpdateComplaintStatusDto): Promise<any> {
        if (![UserRole.ADMIN, UserRole.MERCHANT].includes(user.role)) {
            throw new ForbiddenException('Access denied');
        }

        const complaint = await this.complaintRepo.findOne({
            where: { id },
            relations: ['merchant', 'merchant.user', 'user'],
        });
        if (!complaint) throw new NotFoundException('Complaint not found');

        if (user.role === UserRole.MERCHANT) {
            if (!complaint.merchant?.user || complaint.merchant.user.id !== user.id) {
                throw new ForbiddenException('You are not allowed to update this complaint');
            }
        }

        complaint.status = dto.status;
        complaint.admin_note = dto.admin_note ?? complaint.admin_note;
        const saved = await this.complaintRepo.save(complaint);

        if (saved.user) {
            const { password, ...safeUser } = saved.user as any;
            saved.user = safeUser as any;
        }

        return { message: 'Complaint status updated', complaint: saved };
    }

    async getComplaintById(user: User, id: string): Promise<any> {
        const complaint = await this.complaintRepo.findOne({
            where: { id },
            relations: [
                'user',
                'customer',
                'customer.user',
                'order',
                'merchant',
                'merchant.user',
            ],
        });

        if (!complaint) {
            throw new NotFoundException('Complaint not found');
        }

        if (user.role === UserRole.CUSTOMER) {
            const customer = await this.customerRepo.findOne({
                where: { user: { id: user.id } },
            });
            if (!customer || complaint.customer.id !== customer.id) {
                throw new ForbiddenException('Access denied');
            }
        } else if (user.role === UserRole.MERCHANT) {
            const merchant = await this.merchantRepo.findOne({
                where: { user: { id: user.id } },
            });
            if (!merchant || !complaint.merchant || complaint.merchant.id !== merchant.id) {
                throw new ForbiddenException('Access denied');
            }
        } else if (user.role !== UserRole.ADMIN) {
            throw new ForbiddenException('Access denied');
        }

        if (complaint.user) {
            const { password, ...safeUser } = complaint.user as any;
            complaint.user = safeUser as any;
        }
        if (complaint.customer?.user) {
            const { password, ...safeCustomerUser } = complaint.customer.user as any;
            complaint.customer.user = safeCustomerUser;
        }
        if (complaint.merchant?.user) {
            const { password, ...safeMerchantUser } = complaint.merchant.user as any;
            complaint.merchant.user = safeMerchantUser;
        }

        return complaint;
    }

    async getComplaintCountsByMerchant(user: User): Promise<any> {
        if (user.role !== UserRole.ADMIN) {
            throw new ForbiddenException('Only admins can view complaint counts by merchant');
        }

        const results = await this.complaintRepo
            .createQueryBuilder('complaint')
            .leftJoin('complaint.merchant', 'merchant')
            .leftJoin('merchant.user', 'merchantUser')
            .select('merchant.id', 'merchant_id')
            .addSelect('merchant.businessname', 'business_name')
            .addSelect('COUNT(complaint.id)', 'complaint_count')
            .addSelect('merchantUser.id', 'merchant_user_id')
            .addSelect('merchantUser.email', 'merchant_email')
            .addSelect('merchantUser.first_name', 'merchant_first_name')
            .addSelect('merchantUser.last_name', 'merchant_last_name')
            .where('complaint.merchant_id IS NOT NULL')
            .groupBy('merchant.id')
            .addGroupBy('merchant.businessname')
            .addGroupBy('merchantUser.id')
            .addGroupBy('merchantUser.email')
            .addGroupBy('merchantUser.first_name')
            .addGroupBy('merchantUser.last_name')
            .orderBy('complaint_count', 'DESC')
            .getRawMany();

        return results.map((item: any) => {
            const safeMerchantUser = {
                id: item.merchant_user_id,
                email: item.merchant_email,
                first_name: item.merchant_first_name,
                last_name: item.merchant_last_name,
            };

            return {
                complaint_count: parseInt(item.complaint_count, 10),
                merchant: {
                    id: item.merchant_id,
                    businessname: item.business_name,
                    user: safeMerchantUser,
                },
            };
        });
    }
}

