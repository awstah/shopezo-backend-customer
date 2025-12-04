import { Module } from '@nestjs/common';
import { ShopProductsService } from './shop-products.service';
import { ShopProductsController } from './shop-products.controller';
import { AdminShopProductsService } from './admin/admin-shop-products.service';
import { MerchantShopProductsService } from './merchant/merchant-shop-products.service';
import { CustomerShopProductsService } from './customer/customer-shop-products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../entities/categories.entity';
import { Merchant } from '../entities/merchantDetails.entity';
import { ProductImage } from '../entities/productImages.entity';
import { Products } from '../entities/products.entity';
import { ShopProduct } from '../entities/shopProducts.entity';
import { Stores } from '../entities/stores.entity';
import { User } from '../entities/user.entity';
import { UploadService } from '../utils/upload.service';
import { Favourites } from '../entities/favourites.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Stores, Merchant, Products, ProductImage, Category, ShopProduct, Favourites])],
  providers: [ShopProductsService, UploadService, AdminShopProductsService, MerchantShopProductsService, CustomerShopProductsService],
  controllers: [ShopProductsController]
})
export class ShopProductsModule { }
