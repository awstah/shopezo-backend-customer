// create-payment-method.dto.ts
import { IsNotEmpty, IsString, IsNumberString, Length, IsOptional } from 'class-validator';

export class AddCardDto {
  @IsNotEmpty()
  @IsString()
  card_holder_name: string;

  @IsNotEmpty()
  @IsNumberString()
  @Length(13, 19)
  card_number: string;

  @IsNotEmpty()
  @IsNumberString()
  @Length(2, 2)
  expiry_month: string;

  @IsNotEmpty()
  @IsNumberString()
  @Length(2, 4)
  expiry_year: string;

  @IsNotEmpty()
  @IsNumberString()
  @Length(3, 4)
  cvv: string;

}

export class UpdateCardDto {
  @IsNotEmpty()
  @IsString()
  card_id: string

  @IsOptional()
  @IsString()
  card_holder_name: string;

  @IsOptional()
  @IsNumberString()
  @Length(13, 19)
  card_number: string;

  @IsOptional()
  @IsNumberString()
  @Length(2, 2)
  expiry_month: string;

  @IsOptional()
  @IsNumberString()
  @Length(2, 4)
  expiry_year: string;

  @IsOptional()
  @IsNumberString()
  @Length(3, 4)
  cvv: string;

}
