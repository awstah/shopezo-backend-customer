import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Merchant } from '../entities/merchantDetails.entity';
import { Stores } from '../entities/stores.entity';
import { User } from '../entities/user.entity';
import { Category } from '../entities/categories.entity';
import { UploadService } from '../utils/upload.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Category])],
  providers: [CategoriesService, UploadService],
  controllers: [CategoriesController]
})
export class CategoriesModule {}
