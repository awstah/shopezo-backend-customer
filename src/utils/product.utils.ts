import { ObjectLiteral, SelectQueryBuilder } from "typeorm";
import { PaginationDto } from "../common/common-dtos/pagination.dto";

export function calculateDiscountPrice(price: number, discount: number = 0): number{

    if (!price || isNaN(price)) return 0
    if (!discount) return 0;
    return Number((price * (1 - discount / 100)).toFixed(2));
}

export async function paginate<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    paginationDto: PaginationDto,
): Promise<{ data: T[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10 } = paginationDto; // Default values

    const [data, total] = await qb
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

    return {
        data,
        total,
        page: Number(page),
        limit: Number(limit),
    };
}
