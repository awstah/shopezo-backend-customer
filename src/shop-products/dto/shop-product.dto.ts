import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { calculateDiscountPrice } from "../../utils/product.utils";

export class CreateShopProductDto {
    @IsNotEmpty()
    @IsNumber()
    price: number;

    @IsNotEmpty()
    @IsNumber()
    stock: number;

    @IsNotEmpty()
    @IsString()
    product_id: string;

    @IsNotEmpty()
    @IsString()
    store_id: string;

    @IsOptional()
    @IsNumber()
    discount: number

    @IsOptional()
    @IsString()
    sku: string
}

export class UpdateShopProductDto {
    @IsNotEmpty()
    @IsString()
    shop_product_id: string;

    @IsOptional()
    @IsNumber()
    price: number;

    @IsOptional()
    @IsNumber()
    stock: number;

    @IsOptional()
    @IsString()
    product_id: string;

    @IsOptional()
    @IsString()
    store_id: string;

    @IsOptional()
    @IsNumber()
    discount: number;
}

export class DeleteShopProductDto {
    @IsNotEmpty()
    @IsString()
    shop_product_id: string;
}

export class GetShopProductDto {
    @IsNotEmpty()
    @IsString()
    shop_product_id: string;
}

export class SearchProduct {
    @IsString()
    @IsOptional()
    text: string

    @IsString()
    @IsOptional()
    category_id: string

    @IsString()
    @IsOptional()
    store_ids: string[]
}


export class SearchProductByStoreDto {
    @IsString()
    @IsOptional()
    text: string

    @IsString()
    @IsOptional()
    category_id: string

    @IsString()
    @IsOptional()
    store_id: string
}


export class ProductResponseDto {
    shop_product_id: string;
    product_name: string;
    description: string;
    price: number;
    product_size: string;
    discount: number;
    discountedPrice: number | null;
    stock: number;
    category_id?: string;
    category_name?: string;
    store: {
        id: string;
        store_name: string;
        store_address: string;
        store_logo: string;
    };
    images: string[];
    reviews: number;
    created_at: Date;
    updated_at: Date;

    // ✅ static helper
    static fromQuery(sp: any): ProductResponseDto {
        return {
            shop_product_id: sp.shop_product_id || sp.id, // shop_product_id
            product_name: sp.product ? sp.product.product_name : sp.product_name,
            description: sp.product ? sp.product.description : sp.description,
            price: Number(sp.price),
            product_size: sp.product ? sp.product.product_size : sp.product_size,
            discount: sp.discount,
            discountedPrice: calculateDiscountPrice(sp.price, sp.discount),
            stock: sp.stock,
            category_id: sp.product?.category?.id || sp.category_id,
            category_name: sp.product?.category?.category_name || sp.category_name,
            store: {
                id: sp.store ? sp.store.id : sp.store_id,
                store_name: sp.store ? sp.store.store_name : sp.store_name,
                store_address: sp.store ? sp.store.store_address : sp.store_address,
                store_logo: sp.store ? sp.store.store_logo : sp.store_logo,
            },
            images: sp.product ? (sp.product.images?.filter((img: any) => !img.is_deleted).map((img: any) => img.url) ?? []) : sp.images,
            // reviews: Math.floor(Math.random() * 6),
            reviews: Number(sp.reviews),
            created_at: sp.created_at && sp.created_at,
            updated_at: sp.updated_at && sp.updated_at,
        };
    }

    static fromQueryList(spList: any[]): ProductResponseDto[] {
        return spList.map((sp) => ProductResponseDto.fromQuery(sp));
    }
}