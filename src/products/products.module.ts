import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Merchant } from '../entities/merchantDetails.entity';
import { Stores } from '../entities/stores.entity';
import { User } from '../entities/user.entity';
import { UploadService } from '../utils/upload.service';
import { ProductImage } from '../entities/productImages.entity';
import { Products } from '../entities/products.entity';
import { EnhancedScraperService, ScraperService } from '../utils/scrapper.service';
import { SerpScraperService } from '../utils/serp-scraper.service';
import { Category } from '../entities/categories.entity';
import { ShopProduct } from '../entities/shopProducts.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Stores, Merchant, Products, ProductImage, Category, ShopProduct])],
  providers: [ProductsService, UploadService, ScraperService, SerpScraperService, EnhancedScraperService],
  controllers: [ProductsController]
})
export class ProductsModule {}
