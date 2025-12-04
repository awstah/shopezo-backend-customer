import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Banner } from '../entities/banner.entity';
import { UploadService } from '../utils/upload.service';
import { Stores } from '../entities/stores.entity';
import { Driver } from '../entities/driverDetails.entity';
import { TempProducts } from '../entities/tempProducts.entity';
import { Merchant } from '../entities/merchantDetails.entity';
import { Products } from '../entities/products.entity';
import { Category } from '../entities/categories.entity';
import { ProductDuplicates } from '../entities/productDuplicates.entity';
import { UploadJob } from '../entities/uploadJob.entity';
import { EnhancedScraperService } from '../utils/scrapper.service';
import { ProductImage } from '../entities/productImages.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Banner, Stores, Driver, TempProducts, Merchant, Products, Category, ProductDuplicates, UploadJob, ProductImage])],
  providers: [AdminService, UploadService, EnhancedScraperService],
  controllers: [AdminController]
})
export class AdminModule {}
