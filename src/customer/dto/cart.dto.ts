import { Type } from 'class-transformer';
import { IsInt, Min, IsString, ArrayNotEmpty, ValidateNested, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class AddToCartDto {
    @IsString()
    shop_product_id: string;

    @IsInt()
    @Min(1)
    quantity: number;
}

export class UpdateCartItemDto {
    @IsString()
    cart_item_id: string;

    @IsInt()
    @Min(1)
    quantity: number;
}

export class UpdateCartItemProductDto {
    @IsString()
    shop_product_id: string;

    @IsInt()
    @Min(1)
    quantity: number;
}

export class UpdateCartItemsDto {
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => UpdateCartItemProductDto)
    items: UpdateCartItemProductDto[];
}

export class AddToFavouriteDto {
    @IsNotEmpty()
    @IsString()
    shop_product_id: string
}

export class AddFavToCartDto {
    @IsNotEmpty()
    @IsArray()
    @IsString({ each: true })
    shop_product_ids: string[];

}

