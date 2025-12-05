import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { Customer } from '../entities/customerDetails.entity';
import { Stores } from '../entities/stores.entity';
import { User } from '../entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Products } from '../entities/products.entity';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cartItem.entity';
import { UserPaymentMethod } from '../entities/userPaymentMethod.entity';
import { Favourites } from '../entities/favourites.entity';
import { ShopProduct } from '../entities/shopProducts.entity';
import { CustomerAddress } from '../entities/customerAddress.entity';
import { Category } from '../entities/categories.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Stores, Customer, Products, Cart, CartItem, UserPaymentMethod, Favourites, ShopProduct, CustomerAddress, Category])],
  providers: [CustomerService],
  controllers: [CustomerController]
})
export class CustomerModule {}
