import { Module } from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { MerchantController } from './merchant.controller';
import { User } from '../entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stores } from '../entities/stores.entity';
import { UploadService } from '../utils/upload.service';
import { Merchant } from '../entities/merchantDetails.entity';
import { Driver } from '../entities/driverDetails.entity';
import { Banner } from '../entities/banner.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Stores, Merchant, Driver, Banner])],
  providers: [MerchantService, UploadService],
  controllers: [MerchantController]
})
export class MerchantModule {}
