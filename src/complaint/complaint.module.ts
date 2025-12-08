import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Complaint } from '../entities/complaint.entity';
import { Customer } from '../entities/customerDetails.entity';
import { Merchant } from '../entities/merchantDetails.entity';
import { Order } from '../entities/order.entity';
import { User } from '../entities/user.entity';
import { ComplaintController } from './complaint.controller';
import { ComplaintService } from './complaint.service';
import { UploadService } from '../utils/upload.service';

@Module({
    imports: [TypeOrmModule.forFeature([Complaint, User, Customer, Order, Merchant])],
    controllers: [ComplaintController],
    providers: [ComplaintService, UploadService],
})
export class ComplaintModule { }

