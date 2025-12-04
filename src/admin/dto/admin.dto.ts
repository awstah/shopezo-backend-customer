import { IsString, IsOptional, IsNotEmpty, IsObject, IsEnum, ValidateIf, IsArray, ArrayNotEmpty } from 'class-validator';
import { UploadJobStatus } from '../../common/enums/product.enum';

export class CreateBannerDto {
  @IsString()
  @IsOptional()
  title: string;
}

export class CreateMerchantBannerDto extends CreateBannerDto {
  @IsString()
  @IsNotEmpty()
  store_id: string
}

export class UpdateBannerDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsNotEmpty()
  banner_id: string
}

export class ColumnMappingDto {
  @IsString()
  @IsNotEmpty()
  mapping: Record<string, string>;
  // e.g. { barcode: "code", title: "product_name", category: "categ", ... }

  @IsString()
  @IsNotEmpty()
  merchant_id: string
}

export class UpdateMerchantStoreBannerDto extends UpdateBannerDto {
  @IsString()
  @IsOptional()
  store_id: string
}

export class MerchantStoreBannerDto {
  @IsNotEmpty()
  @IsString()
  store_id: string

  @IsNotEmpty()
  @IsString()
  banner_id: string
}

export class GetUploadedFileJobs {
  @IsOptional()
  @IsString()
  merchant_id: string

  @IsOptional()
  @IsEnum(UploadJobStatus)
  status: UploadJobStatus

  @IsOptional()
  @IsString()
  search?: string;
}

export class PublishTempProductsDto {
  @IsNotEmpty()
  @IsString()
  merchant_id: string;

  @IsOptional()
  @IsString()
  file_name: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true, message: 'Each temp_id must be a string' })
  temp_ids: string[];
}

export class ToggleArchiveDto {
  @IsNotEmpty()
  @IsString()
  merchant_id: string;

  @IsOptional()
  @IsString()
  file_name: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true, message: 'Each temp_id must be a string' })
  temp_ids: string[];
}