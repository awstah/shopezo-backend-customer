import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Merchant } from '../entities/merchantDetails.entity';
import { Stores } from '../entities/stores.entity';
import { Order } from '../entities/order.entity';
import { OrderDriverAssignment } from '../entities/orderDriverAssignment.entity';
import { Driver } from '../entities/driverDetails.entity';
import { Shopkepper } from '../entities/shopkeeperDetails.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Merchant, Stores, Order, OrderDriverAssignment, Driver, Shopkepper])],
  providers: [AnalyticsService],
  controllers: [AnalyticsController]
})
export class AnalyticsModule {}
