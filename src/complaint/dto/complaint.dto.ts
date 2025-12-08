import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ComplaintStatus } from '../../common/enums/complaint.enum';

export class CreateComplaintDto {
    @IsString()
    @MaxLength(250)
    subject: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNotEmpty()
    @IsString()
    order_id: string;
}

export class UpdateComplaintStatusDto {
    @IsEnum(ComplaintStatus)
    status: ComplaintStatus;

    @IsOptional()
    @IsString()
    admin_note?: string;
}

