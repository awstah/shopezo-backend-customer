import { PaginationDto } from "../../common/common-dtos/pagination.dto";
import { IsOptional } from "class-validator";
import { Transform } from "class-transformer";
import { Type } from "class-transformer";
import { IsBoolean } from "class-validator";
import { IsEnum } from "class-validator";
import { ProductStatus } from "../../common/enums/product.enum";

 export class GetMasterProductParamsDto extends PaginationDto {
    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    @Type(() => Boolean)
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    @Type(() => Boolean)
    @IsBoolean()
    isDeleted?: boolean;

    @IsOptional()
    @IsEnum(ProductStatus)
    status?: ProductStatus;
    
 }