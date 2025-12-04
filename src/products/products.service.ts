import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Merchant } from '../entities/merchantDetails.entity';
import { Stores } from '../entities/stores.entity';
import { User } from '../entities/user.entity';
import { UploadService } from '../utils/upload.service';
import { In, Repository } from 'typeorm';
import { CreateProductDto, DeleteImagesDto, GetProductDto, UpdateProductDto } from './dto/products.dto';
import { Products } from '../entities/products.entity';
import { ProductImage } from '../entities/productImages.entity';
import { ACL_ACCESS, ProductStatus } from '../common/enums/product.enum';
import { Category } from '../entities/categories.entity';
import 'dotenv/config'
import { UserRole } from '../common/enums/user-role.enum';
import { ShopProduct } from '../entities/shopProducts.entity';
import { GetProductsDto, PaginationDto } from '../common/common-dtos/pagination.dto';
import { paginate } from '../utils/product.utils';
import { GetMasterProductParamsDto } from './dto/getMasterProductParams.dto';

@Injectable()
export class ProductsService {
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
        private readonly shopProductRepo: Repository<ShopProduct>
    ) { }

    async createProduct(
        dto: CreateProductDto,
        images: Express.Multer.File[],
        user: User
    ): Promise<Products | null> {
        const hasUploadedFiles = images && images.length > 0;
        const hasUrlImages = dto.image_urls && dto.image_urls.length > 0;
        if (!hasUploadedFiles && !hasUrlImages) {
            throw new BadRequestException('At least one image (file or URL) is required');
        }

        const category = await this.categoryRepo.findOne({ where: { id: dto.category_id } });
        if (!category) throw new NotFoundException('Category not found');
        const existingProduct = await this.productRepo.findOne({
            where: {
                product_name: dto.product_name
            }
        });
        if (existingProduct) throw new ConflictException("Product with this name already exists");
        if (dto.barcode) {
            const existingBarcode = await this.productRepo.findOne({ where: { barcode: dto.barcode } });
            if (existingBarcode) throw new ConflictException("Product with this barcode already exists");
        }
        const product = this.productRepo.create({
            product_name: dto.product_name,
            description: dto.description,
            product_size: dto.product_size,
            slug: dto.slug,
            barcode: dto.barcode ?? null,
            status: user.role === UserRole.ADMIN ? ProductStatus.APPROVED : ProductStatus.PENDING,
            added_by: user,
            category
        });
        const savedProduct = await this.productRepo.save(product);
        const uploadedImageUrls: string[] = [];
        if (hasUploadedFiles) {
            const s3Urls = await Promise.all(
                images.map((file) =>
                    this.uploadService.uploadFile(file, 'products', savedProduct.product_name, ACL_ACCESS.PUBLIC_READ)
                )
            );
            uploadedImageUrls.push(...s3Urls);
        }

        if (hasUrlImages) {
            uploadedImageUrls.push(...dto.image_urls as any);
        }
        console.log({ uploadedImageUrls });

        const imageEntities = uploadedImageUrls.map((url) =>
            this.productImageRepo.create({ url, product_id: savedProduct.id }),
        );
        console.log({ imageEntities });
        await this.productImageRepo.save(imageEntities);

        return this.productRepo
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .leftJoinAndSelect('product.images', 'images', 'images.is_deleted = :isDeleted', {
                isDeleted: false,
            })
            .where('product.id = :id', { id: savedProduct.id })
            .getOne();
    }

    async addImagesToProduct(_user: User, dto: GetProductDto, files: Express.Multer.File[]) {
        const product = await this.productRepo.findOne({
            where: {
                id: dto.product_id,
                is_deleted: false,
            }, relations: ['images']
        });
        if (!product) throw new NotFoundException("Product not found");
        if (!files || files.length === 0) {
            throw new BadRequestException("No images uploaded");
        };
        const existingImagesCount = product.images.filter(img => !img.is_deleted).length;
        if (existingImagesCount >= 4) {
            throw new BadRequestException("You already have the maximum of 4 images for this product");
        }
        if (existingImagesCount + files.length > 4) {
            throw new BadRequestException(
                `You can only upload ${4 - existingImagesCount} more image(s)`
            );
        }
        const s3Urls = await Promise.all(
            files.map((file) =>
                this.uploadService.uploadFile(file, 'products', product.product_name, ACL_ACCESS.PUBLIC_READ)
            )
        );
        const imageEntities = s3Urls.map((url) =>
            this.productImageRepo.create({ url, product_id: product.id }),
        );
        await this.productImageRepo.save(imageEntities);
        const updaetdProduct = await this.productRepo
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.images', 'images', 'images.is_deleted = :deleted', { deleted: false })
            .where('product.id = :id', { id: product.id })
            .getOne();
        return updaetdProduct
    }

    async getAllMasterProducts(dto: GetMasterProductParamsDto, paginationDto: PaginationDto): Promise<any> {
        const qb = this.productRepo
            .createQueryBuilder('products')
            .leftJoinAndSelect('products.images', 'images', 'images.is_deleted = false')
            .leftJoinAndSelect('products.category', 'category')
            .where('products.is_deleted = :deleted', { deleted: dto.isDeleted ?? false })
            .andWhere('products.status = :status', { status: dto.status ?? ProductStatus.APPROVED })
            .andWhere('products.is_active = :isActive', { isActive: dto.isActive ?? true });

        const result = await paginate(qb, paginationDto);

        return result;
    }


    async generateProductDetails(productName: string) {
        const geminiKey = process.env.AI_API_KEY;
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${geminiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://openrouter.ai', // optional
                'X-Title': 'my-product-detail-generator',           // optional
            },
            body: JSON.stringify({
                model: 'openai/gpt-3.5-turbo',
                messages: [
                    {
                        role: 'user',
                        content: `Give me JSON with keys: description, product_size, and price for product: ${productName}. Only reply with JSON.`,
                    },
                ],
            }),
        });

        const data = await res.json();
        console.log(data);
        if (data?.choices?.[0]?.message?.content) {
            try {
                return JSON.parse(data.choices[0].message.content);
            } catch (e) {
                throw new Error('Invalid JSON received from AI');
            }
        }

        throw new Error(data?.error?.message || 'AI generation failed');
    }

    async getProduct(_user: User, dto: GetProductDto): Promise<Products | null> {
        const getProductById = await this.productRepo.createQueryBuilder("product")
            .leftJoinAndSelect("product.images", "image", "image.is_deleted = false")
            .leftJoinAndSelect("product.category", "category")
            .where("product.id = :productId", { productId: dto.product_id })
            .andWhere("product.is_deleted = false")
            .andWhere("product.status = :status", { status: ProductStatus.APPROVED })
            .getOne();
        if (!getProductById) throw new NotFoundException("Product not found");
        return getProductById
    }

    async updateProduct(
        dto: UpdateProductDto,
        _user: User
    ): Promise<Products | null> {
        const findProduct = await this.productRepo.findOne({
            where: {
                id: dto.product_id,
                is_deleted: false
            }
        });
        if (!findProduct) throw new NotFoundException('Product not found');
        if (dto.category_id) {
            const findCategory = await this.categoryRepo.findOne({
                where: {
                    id: dto.category_id,
                    is_active: true,
                    status: ProductStatus.APPROVED
                }
            });
            if (!findCategory) throw new NotFoundException("Category not found");
            findProduct.category = findCategory
        }
        if (dto.product_name !== undefined) findProduct.product_name = dto.product_name;
        if (dto.description !== undefined) findProduct.description = dto.description;
        if (dto.product_size !== undefined) findProduct.product_size = dto.product_size;
        if (dto.slug !== undefined) findProduct.slug = dto.slug;
        if (dto.status !== undefined) findProduct.status = dto.status as ProductStatus;
        const updatedProduct = await this.productRepo.save(findProduct);

        return this.productRepo
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .leftJoinAndSelect('product.images', 'images', 'images.is_deleted = :isDeleted', {
                isDeleted: false,
            })
            .where('product.id = :id', { id: updatedProduct.id })
            .getOne();
    }

    async softDeleteProuct(_user: User, dto: GetProductDto,) {
        const findProduct = await this.productRepo.findOne({
            where: {
                id: dto.product_id,
                is_deleted: false
            }
        });
        if (!findProduct) throw new NotFoundException('Product not found or already deleted');
        findProduct.is_deleted = true;
        await this.productRepo.save(findProduct);
        const productImages = await this.productImageRepo.find({
            where: {
                product: {
                    id: findProduct.id
                },
                is_deleted: false
            }
        });
        const updatedImages = productImages.map(img => {
            img.is_deleted = true;
            return img;
        });
        if (updatedImages.length > 0) {
            await this.productImageRepo.save(updatedImages);
        }
        return {
            message: "Product deleted successfully"
        }

    }

    async deleteProductImages(user: User, dto: DeleteImagesDto) {
        const findProduct = await this.productRepo.findOne({
            where: {
                id: dto.product_id
            }
        });
        if (!findProduct) throw new NotFoundException('Product not found or already deleted');

        // 2. Filter only images that belong to this product
        const imagesToDelete = findProduct.images.filter(img =>
            dto.images_id.includes(img.id) && !img.is_deleted
        );
        if (imagesToDelete.length === 0) {
            throw new BadRequestException('No matching images found for deletion');
        }
        // 3. Soft delete in DB
        await this.productImageRepo.update(
            { id: In(imagesToDelete.map(img => img.id)) },
            { is_deleted: true }
        );

        return { message: 'Selected images deleted successfully' };
    }
}


