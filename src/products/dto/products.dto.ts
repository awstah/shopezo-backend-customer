import {
    IsNotEmpty,
    IsString,
    IsOptional,
    IsNumber,
    IsArray,
    ArrayNotEmpty,
    IsInt,
} from 'class-validator';
import { calculateDiscountPrice } from '../../utils/product.utils';

export class CreateProductDto {
    @IsNotEmpty()
    @IsString()
    product_name: string;

    @IsOptional()
    @IsString()
    description: string;

    @IsOptional()
    @IsString()
    product_size: string;

    @IsOptional()
    @IsString()
    barcode: string;

    @IsNotEmpty()
    @IsString()
    slug: string;

    @IsNotEmpty()
    @IsString()
    category_id: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    image_urls?: string[];
}

export class UpdateProductDto {
    @IsOptional()
    @IsString()
    product_name: string;

    @IsOptional()
    @IsString()
    description: string;

    @IsOptional()
    @IsString()
    product_size: string;

    @IsNotEmpty()
    @IsString()
    product_id: string;

    @IsOptional()
    @IsString()
    category_id: string;

    @IsOptional()
    @IsString()
    status: string;

    @IsNotEmpty()
    @IsString()
    slug: string;
}

export class GetProductDto {
    @IsNotEmpty()
    @IsString()
    product_id: string;
}

export class DeleteImagesDto extends GetProductDto {
    @IsArray()
    @ArrayNotEmpty()
    // @IsUUID('4', { each: true })
    images_id: string[];
}

