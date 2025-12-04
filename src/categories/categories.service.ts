import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../entities/categories.entity';
import { User } from '../entities/user.entity';
import { IsNull, Repository } from 'typeorm';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/categories.dto';
import { UploadService } from '../utils/upload.service';
import { ACL_ACCESS } from '../common/enums/product.enum';
import { paginate } from '../utils/product.utils';
import { PaginationDto } from '../common/common-dtos/pagination.dto';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepo: Repository<Category>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private uploadService: UploadService
    ) { }

    async createCategory(user: User, file: Express.Multer.File, dto: CreateCategoryDto): Promise<Category> {
        const findUser = await this.userRepo.findOne({
            where: {
                id: user.id,
                is_verified: true
            }
        });
        if (!findUser) throw new NotFoundException("User not found");
        const { parent_id, category_name } = dto
        const existingCategory = await this.categoryRepo.findOne({
            where: {
                category_name
            }
        });
        if (existingCategory) throw new BadRequestException("Category with this name already exists");
        const createCategory = await this.categoryRepo.create({
            category_name,
        });
        if (parent_id) {
            const parent = await this.categoryRepo.findOne({ where: { id: parent_id } });
            if (!parent) throw new NotFoundException('Parent category not found');
            createCategory.parent = parent;
        };
        const savedCategory = await this.categoryRepo.save(createCategory);
        if (file) {
            const fileUrl = await this.uploadService.uploadFile(file, 'categories', savedCategory.id, ACL_ACCESS.PUBLIC_READ);
            console.log({ fileUrl });
            savedCategory.category_image = fileUrl;
            console.log({ fileUrl, savedCategory });
            await this.categoryRepo.save(savedCategory);
        };
        return savedCategory
    }

    async updateCategory(user: User, file: Express.Multer.File, dto: UpdateCategoryDto): Promise<any> {
        const findCategory = await this.categoryRepo.findOne({
            where: {
                id: dto.category_id
            }
        });
        if (!findCategory) throw new NotFoundException("Category not found")
        if (dto.parent_id) {
            const parent = await this.categoryRepo.findOne({
                where: {
                    id: dto.parent_id
                }
            });
            if (!parent) throw new NotFoundException("Parent category not found");
            findCategory.parent = parent
        }
        if (dto.category_name) findCategory.category_name = dto.category_name;
        if (file) {
            const fileUrl = await this.uploadService.uploadFile(file, 'categories', findCategory.id, ACL_ACCESS.PUBLIC_READ);
            console.log({ fileUrl });
            findCategory.category_image = fileUrl;
            console.log({ fileUrl, findCategory });
        }
        await this.categoryRepo.save(findCategory);
        return {
            message: "Category updated sucessfully",
            findCategory
        }
    }

    async deleteCategory(id: string) {
        const category = await this.categoryRepo.findOne({ where: { id } });
        if (!category) throw new NotFoundException('Category not found');
        await this.categoryRepo.remove(category);
        return {
            message: "Category deleted sucessfully"
        }
    }

    async getAllCategories(paginationDto: PaginationDto): Promise<any> {
        const qb = this.categoryRepo
            .createQueryBuilder('category')
            .where('category.is_active = :isActive', { isActive: true });
    
        const result = await paginate(qb, paginationDto);
    
        return result;
    }

    async getSingleCategory(id: string): Promise<Category> {
        const category = await this.categoryRepo.findOne({
            where: { id },
            relations: ['products', 'children'],
        });
        if (!category) throw new NotFoundException('Category not found');
        return category;
    }
}
