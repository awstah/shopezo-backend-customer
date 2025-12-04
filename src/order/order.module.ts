import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cartItem.entity';
import { Customer } from '../entities/customerDetails.entity';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/orderItem.entity';
import { User } from '../entities/user.entity';
import { ShopProduct } from '../entities/shopProducts.entity';
import { Shopkepper } from '../entities/shopkeeperDetails.entity';
import { Driver } from '../entities/driverDetails.entity';
import { OrderDriverAssignment } from '../entities/orderDriverAssignment.entity';
import { UploadService } from '../utils/upload.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Customer, Cart, CartItem, OrderItem, Order, ShopProduct, Shopkepper, Driver, OrderDriverAssignment])],
  providers: [OrderService, UploadService],
  controllers: [OrderController]
})
export class OrderModule {}
