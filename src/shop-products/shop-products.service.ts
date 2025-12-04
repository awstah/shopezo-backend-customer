import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/categories.entity';
import { ProductImage } from '../entities/productImages.entity';
import { Products } from '../entities/products.entity';
import { ShopProduct } from '../entities/shopProducts.entity';
import { Stores } from '../entities/stores.entity';
import { User } from '../entities/user.entity';
import { UploadService } from '../utils/upload.service';
import { ProductStatus } from '../common/enums/product.enum';
import { paginate } from '../utils/product.utils';
import { GetProductsDto } from '../common/common-dtos/pagination.dto';
import { UserRole } from '../common/enums/user-role.enum';
import { Favourites } from '../entities/favourites.entity';
import { ProductResponseDto, SearchProduct } from './dto/shop-product.dto';

@Injectable()
export class ShopProductsService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Stores)
        private readonly storeRepo: Repository<Stores>,
        private uploadService: UploadService,
        @InjectRepository(Products)
        private readonly productRepo: Repository<Products>,
        @InjectRepository(ProductImage)
        private readonly productImageRepo: Repository<ProductImage>,
        @InjectRepository(Category)
        private readonly categoryRepo: Repository<Category>,
        @InjectRepository(ShopProduct)
        private readonly shopProductRepo: Repository<ShopProduct>,
        @InjectRepository(Favourites)
        private readonly favRepo: Repository<Favourites>,
    ) { }

    async getAllShopProductsOfSingleStore(_user: User, storeId: string, dto: GetProductsDto): Promise<any> {
        const getShopProducts = await this.shopProductRepo.createQueryBuilder("shop_product")
            .leftJoinAndSelect("shop_product.product", "product")
            .leftJoinAndSelect("shop_product.store", "store")
            .leftJoinAndSelect("product.images", "image", "image.is_deleted = false") // only active images
            .leftJoinAndSelect("product.category", "category")
            .leftJoin("store.user", "storeUser")
            .where("product.is_deleted = false")
            .andWhere("shop_product.is_deleted = false")
            .andWhere("shop_product.is_available = true")
            .andWhere("store.id = :storeId", { storeId })
            .andWhere("store.is_deleted = false")
        // .getMany();
        const result = await paginate(getShopProducts, dto);
        return result;
        // return ProductResponseDto.fromQueryList(getShopProducts)
    }
// next method is updated we can remove this later
    async searchProducts(dto: SearchProduct): Promise<any> {
        const searchProds = await this.shopProductRepo.query(
            `SELECT * FROM public.fun_search_shop_products($1, $2, $3, $4)`,
            [
                dto.text || '',
                dto.category_id || null,
                dto.store_ids ? dto.store_ids.join(',') : null,
               
            ]
        );
        return ProductResponseDto.fromQueryList(searchProds);
    }

    async searchProductsForStores(dto: SearchProduct, paginationDto: GetProductsDto): Promise<any> {
        const { page = 1, limit = 10 } = paginationDto;
        const offset = (page - 1) * limit;
        
        const storeIdsArray = dto.store_ids && dto.store_ids.length > 0 
            ? dto.store_ids 
            : null;

        const searchProds = await this.shopProductRepo.query(
            `SELECT * FROM public.fun_search_shop_products($1, $2, $3, $4, $5)`,
            [
                dto.text || '',
                dto.category_id || null,
                storeIdsArray,
                limit,
                offset
            ]
        );

        const total = searchProds.length > 0 ? Number(searchProds[0]?.total_count || 0) : 0;

        const productsWithoutTotal = searchProds.map(({ total_count, ...rest }) => rest);
        const data = ProductResponseDto.fromQueryList(productsWithoutTotal);

        return {
            data,
            total,
            page: Number(page),
            limit: Number(limit)
        };
    }
    // async getDetailOfShopProduct(_user: User, dto: GetShopProductDto): Promise<ShopProduct | null> {
    //     const getShopProductById = await this.shopProductRepo.createQueryBuilder("shop_product")
    //         .leftJoinAndSelect("shop_product.product", "product")
    //         .leftJoinAndSelect("shop_product.store", "store")
    //         .leftJoinAndSelect("product.images", "image", "image.is_deleted = false")
    //         .leftJoin("store.user", "storeUser")
    //         .where("shop_product.id = :shopProductId", { shopProductId: dto.shop_product_id })
    //         .andWhere("product.is_deleted = false")
    //         .andWhere("product.status = :status", { status: ProductStatus.APPROVED })
    //         .andWhere("store.is_deleted = false")
    //         // .andWhere("storeUser.id = :userId", { userId: user.id })
    //         .getOne();
    //     if (!getShopProductById) throw new NotFoundException("Shop Product not found");
    //     return getShopProductById
    // }

    async listAllShopProducts(_user: User | null, dto: GetProductsDto, category_id?: string | null | undefined): Promise<any> {
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
        // .getMany();
        const result = await paginate(qb, dto);
        return {
            ...result,
            data: ProductResponseDto.fromQueryList(result.data)
        }
        // return ProductResponseDto.fromQueryList(shopProducts)
    }

    async shopProductDetails(user: User, id: string): Promise<any> {
        const findShopProduct = await this.shopProductRepo
            .createQueryBuilder('shop_product')
            .leftJoinAndSelect('shop_product.store', 'store')
            .leftJoinAndSelect('shop_product.product', 'product')
            .leftJoinAndSelect('product.images', 'images', 'images.is_deleted = :deleted', { deleted: false })
            .leftJoinAndSelect('product.category', 'category')
            .where('shop_product.id = :id', { id })
            .getOne();

        if (!findShopProduct) throw new NotFoundException("Shop product not found");
        const response = ProductResponseDto.fromQuery(findShopProduct);
        if (user.role === UserRole.CUSTOMER) {
            const fav = await this.favRepo.findOne({
                where: {
                    user: { id: user.id },
                    shop_product: { id: findShopProduct.id },
                },
            });
            return {
                ...response,
                is_fav: fav?.is_fav
            }
        }
        return response;

    }
}
