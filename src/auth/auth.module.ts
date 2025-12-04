import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Merchant } from '../entities/merchantDetails.entity';
import { Driver } from '../entities/driverDetails.entity';
import { Shopkepper } from '../entities/shopkeeperDetails.entity';
import { Customer } from '../entities/customerDetails.entity';
import { Stores } from '../entities/stores.entity';
import { EntityValidatorService } from '../utils/entity-validator.service';
import { UploadService } from '../utils/upload.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Merchant, Driver, Shopkepper, Customer, Stores])],
  controllers: [AuthController],
  providers: [AuthService, EntityValidatorService, UploadService]
})
export class AuthModule {}
