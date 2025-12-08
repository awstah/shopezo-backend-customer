import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../common/decorators/role.decorator';
import CurrentUser from '../common/decorators/user.decorator';
import { ComplaintStatus } from '../common/enums/complaint.enum';
import { UserRole } from '../common/enums/user-role.enum';
import { SupabaseAuthGuard } from '../common/guards/auth.guard';
import { PaginationDto } from '../common/common-dtos/pagination.dto';
import { ComplaintService } from './complaint.service';
import { CreateComplaintDto, UpdateComplaintStatusDto } from './dto/complaint.dto';
import { User } from '../entities/user.entity';
import { FetchUserPipe } from '../common/pipes/fetch-user.pipe';

@Controller('complaints')
export class ComplaintController {
    constructor(private readonly complaintService: ComplaintService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.CUSTOMER)
    @UseInterceptors(FileInterceptor('image'))
    @UsePipes(new ValidationPipe())
    async createComplaint(
        @Body() dto: CreateComplaintDto,
        @CurrentUser(FetchUserPipe) user: User,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        try {
            return await this.complaintService.createComplaint(user, dto, file);
        } catch (error: any) {
            throw new HttpException(error.message, error?.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.ADMIN, UserRole.MERCHANT)
    @UsePipes(new ValidationPipe({ transform: true }))
    async listComplaints(
        @CurrentUser(FetchUserPipe) user: User,
        @Query() query: PaginationDto,
        @Query('status') status?: ComplaintStatus,
        @Query('merchant_id') merchantId?: string,
    ) {
        try {
            return await this.complaintService.getComplaints(user, query, status, merchantId);
        } catch (error: any) {
            throw new HttpException(error.message, error?.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('counts-by-merchant')
    @HttpCode(HttpStatus.OK)
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.ADMIN)
    @UsePipes(new ValidationPipe({ transform: true }))
    async getComplaintCountsByMerchant(
        @CurrentUser(FetchUserPipe) user: User,
    ) {
        try {
            return await this.complaintService.getComplaintCountsByMerchant(user);
        } catch (error: any) {
            throw new HttpException(error.message, error?.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('my')
    @HttpCode(HttpStatus.OK)
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.CUSTOMER)
    @UsePipes(new ValidationPipe({ transform: true }))
    async listMyComplaints(
        @CurrentUser(FetchUserPipe) user: User,
        @Query() query: PaginationDto,
        @Query('status') status?: ComplaintStatus,
    ) {
        try {
            return await this.complaintService.getCustomerComplaints(user, query, status);
        } catch (error: any) {
            throw new HttpException(error.message, error?.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.MERCHANT)
    @UsePipes(new ValidationPipe())
    async getComplaint(
        @Param('id') id: string,
        @CurrentUser(FetchUserPipe) user: User,
    ) {
        try {
            return await this.complaintService.getComplaintById(user, id);
        } catch (error: any) {
            throw new HttpException(error.message, error?.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Patch(':id/status')
    @HttpCode(HttpStatus.OK)
    @UseGuards(SupabaseAuthGuard)
    @Roles(UserRole.ADMIN, UserRole.MERCHANT)
    @UsePipes(new ValidationPipe())
    async updateStatus(
        @Param('id') id: string,
        @Body() dto: UpdateComplaintStatusDto,
        @CurrentUser(FetchUserPipe) user: User,
    ) {
        try {
            return await this.complaintService.updateComplaintStatus(user, id, dto);
        } catch (error: any) {
            throw new HttpException(error.message, error?.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

