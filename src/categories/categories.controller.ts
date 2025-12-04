import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post, Query, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../common/decorators/role.decorator';
import CurrentUser from '../common/decorators/user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { SupabaseAuthGuard } from '../common/guards/auth.guard';
import { FetchUserPipe } from '../common/pipes/fetch-user.pipe';
import { User } from '../entities/user.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/categories.dto';
import { PaginationDto } from '../common/common-dtos/pagination.dto';

@Controller('categories')
export class CategoriesController {
    constructor(
        private readonly categoryService: CategoriesService
    ) { }

    @Post('create-category')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe())
    @UseInterceptors(FileInterceptor('category_image'))
    async createCategory(
        @Body() dto: CreateCategoryDto,
        @UploadedFile() file: Express.Multer.File,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const createCategory = await this.categoryService.createCategory(user, file, dto);
            return createCategory;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('update-category')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    @UseInterceptors(FileInterceptor('category_image'))
    async upadteCategory(
        @Body() dto: UpdateCategoryDto,
        @UploadedFile() file: Express.Multer.File,
        @CurrentUser(FetchUserPipe) user: User
    ) {
        try {
            const update = await this.categoryService.updateCategory(user, file, dto);
            return update;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('delete-category')
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async deleteCategory(@Body('category_id') category_id: string) {
        try {
            const deleteCategory = await this.categoryService.deleteCategory(category_id);
            return deleteCategory;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('get-all')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async getCategories(@Query() paginationDto: PaginationDto) {
        try {
            const getCategories = await this.categoryService.getAllCategories(paginationDto);
            return getCategories;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async getCategory(@Param('id') id: string) {
        try {
            const getCategory = await this.categoryService.getSingleCategory(id);
            return getCategory;
        } catch (error: any) {
            throw new HttpException(
                error.message,
                error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
