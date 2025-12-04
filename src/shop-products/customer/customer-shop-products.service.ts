import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../entities/categories.entity';
import { Favourites } from '../../entities/favourites.entity';
import { ProductImage } from '../../entities/productImages.entity';
import { Products } from '../../entities/products.entity';
import { ShopProduct } from '../../entities/shopProducts.entity';
import { Stores } from '../../entities/stores.entity';
import { User } from '../../entities/user.entity';
import { UploadService } from '../../utils/upload.service';
import { GetProductsDto } from '../../common/common-dtos/pagination.dto';
import { paginate } from '../../utils/product.utils';
import { ProductResponseDto } from '../dto/shop-product.dto';

@Injectable()
export class CustomerShopProductsService {
    constructor(
        @InjectRepository(ShopProduct)
        private readonly shopProductRepo: Repository<ShopProduct>
    ) { }

    async listMoreShopProducts(_user: User | null, dto: GetProductsDto, category_id?: string | null | undefined): Promise<any> {
        const qb = this.shopProductRepo
            .createQueryBuilder('shop_product')
            .leftJoinAndSelect('shop_product.store', 'store')
            .leftJoinAndSelect('shop_product.product', 'product')
            .leftJoin('product.images', 'images')
            .addSelect([
                // 'shop_product.id',
                'product.product_name',
                'product.description',
                'shop_product.price',
                'product.product_size',
                'shop_product.stock',
                'shop_product.reviews',
                'shop_product.created_at',
                'shop_product.updated_at',
                'store.id',
                'store.store_name',
                'store.store_address',
                'store.store_logo',
                'store.is_deleted',
                'store.createdAt',
                'store.updatedAt',
                'images.url',
                'images.is_deleted',
            ])
            .where('product.is_deleted = :deleted', { deleted: false })
            .andWhere('product.category_id = :category_id', { category_id });
        // .getMany();
        const result = await paginate(qb, dto);
        return {
            ...result,
            data: ProductResponseDto.fromQueryList(result.data)
        }
        // return ProductResponseDto.fromQueryList(shopProducts)
    }
}