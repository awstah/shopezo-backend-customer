import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCategoryDto {
    @IsString()
    @IsNotEmpty()
    category_name: string;

    @IsString()
    @IsOptional()
    parent_id?: string;
}

export class UpdateCategoryDto {
    @IsString()
    @IsOptional()
    category_name: string;

    @IsString()
    @IsNotEmpty()
    category_id: string;

    @IsString()
    @IsOptional()
    parent_id?: string;
}