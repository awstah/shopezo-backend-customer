import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Banner } from '../entities/banner.entity';
import { User } from '../entities/user.entity';
import { Brackets, DataSource, In, IsNull, Repository } from 'typeorm';
import { CreateBannerDto, GetUploadedFileJobs, PublishTempProductsDto, ToggleArchiveDto, UpdateBannerDto } from './dto/admin.dto';
import { UploadService } from '../utils/upload.service';
import { ACL_ACCESS, ProductStatus, UploadJobStatus } from '../common/enums/product.enum';
import { UserRole } from '../common/enums/user-role.enum';
import { TempProducts } from '../entities/tempProducts.entity';
import { parseCsvFile } from '../utils/csv-parser.utils';
import * as fs from 'fs';
import { paginate } from '../utils/product.utils';
import { PaginationDto } from '../common/common-dtos/pagination.dto';
import { Driver } from '../entities/driverDetails.entity';
import { Stores } from '../entities/stores.entity';
import { DriverAssignmentStatus } from '../common/enums/order.enum';
import * as fastcsv from 'fast-csv';
import { Merchant } from '../entities/merchantDetails.entity';
import { Products } from '../entities/products.entity';
import { ProductDuplicates } from '../entities/productDuplicates.entity';
import { Category } from '../entities/categories.entity';
import { generateUniqueSlug } from '../utils/slugify.utils';
import { UploadJob } from '../entities/uploadJob.entity';
import { ProductImage } from '../entities/productImages.entity';
import { EnhancedScraperService } from '../utils/scrapper.service';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Banner)
        private readonly bannerRepo: Repository<Banner>,
        @InjectRepository(TempProducts)
        private readonly tempProductRepo: Repository<TempProducts>,
        @InjectRepository(Stores)
        private readonly storeRepo: Repository<Stores>,
        @InjectRepository(Driver)
        private readonly driverRepo: Repository<Driver>,
        @InjectRepository(Merchant)
        private readonly merchantRepo: Repository<Merchant>,
        @InjectRepository(Products)
        private readonly productRepo: Repository<Products>,
        @InjectRepository(ProductDuplicates)
        private readonly productDuplicatesRepo: Repository<ProductDuplicates>,
        @InjectRepository(Category)
        private readonly categoryRepo: Repository<Category>,
        @InjectRepository(ProductImage)
        private readonly productImageRepo: Repository<ProductImage>,
        @InjectRepository(UploadJob)
        private readonly uploadJobRepo: Repository<UploadJob>,
        private readonly dataSource: DataSource,
        private uploadService: UploadService,
        private readonly ehnhancedScraperService: EnhancedScraperService,
    ) { }

    async getAllStores(_user: User): Promise<Stores[]> {
        const getStores = await this.storeRepo.find({
            where: { is_deleted: false }, relations: ['merchant']
        });
        return getStores
    }

    async createBanner(user: User, dto: CreateBannerDto, file: Express.Multer.File): Promise<Banner> {
        const findUser = await this.userRepo.findOne({
            where: {
                id: user.id
            }
        });
        if (!findUser) throw new NotFoundException("User not found");
        const banner = this.bannerRepo.create({
            title: dto.title,
            user: { id: user.id }
        });
        const savedBanner = await this.bannerRepo.save(banner);
        if (file) {
            const fileUrl = await this.uploadService.uploadFile(file, 'banner', savedBanner.id, ACL_ACCESS.PUBLIC_READ);
            console.log({ fileUrl });
            savedBanner.image = fileUrl;
            console.log({ fileUrl, savedBanner });
            await this.bannerRepo.save(savedBanner);
        }
        return savedBanner;
    }

    async updateBanner(user: User, dto: UpdateBannerDto, file: Express.Multer.File): Promise<Banner> {
        const findUser = await this.userRepo.findOne({
            where: {
                id: user.id
            }
        });
        if (!findUser) throw new NotFoundException("User not found");
        const banner = await this.bannerRepo.findOne({
            where: {
                id: dto.banner_id,
                is_deleted: false
            }
        });
        if (!banner) throw new NotFoundException("Banner not found");
        if (dto.title) {
            banner.title = dto.title
            await this.bannerRepo.save(banner);
        };
        if (file) {
            const fileUrl = await this.uploadService.uploadFile(file, 'banner', banner.id, ACL_ACCESS.PUBLIC_READ);
            banner.image = fileUrl;
            console.log({ fileUrl, banner });
            await this.bannerRepo.save(banner);
        }
        return banner;
    }

    async getAllBanners(paginationDto: PaginationDto): Promise<any> {
        const qb = this.bannerRepo
            .createQueryBuilder('banner')
            .where('banner.is_deleted = :isDeleted', { isDeleted: false });

        const result = await paginate(qb, paginationDto);

        return result;
    }

    async getBanner(id: string): Promise<Banner> {
        const banner = await this.bannerRepo.findOne({
            where: { id, is_deleted: false }
        });
        if (!banner) throw new NotFoundException("Banner not found");
        return banner
    }

    async deleteBanner(_user: User, id: string): Promise<any> {
        const banner = await this.bannerRepo.findOne({
            where: { id, is_deleted: false }
        });
        if (!banner) throw new NotFoundException("Banner not found or already delted");
        banner.is_deleted = true;
        await this.bannerRepo.save(banner)
        return {
            message: "Banner deleted successfully"
        }
    }

    async getAllUsers(role: UserRole | null, dto: PaginationDto): Promise<any> {
        const qb = this.userRepo.createQueryBuilder('user');
        if (role) {
            qb.where('user.role = :role', { role });
        } else {
            qb.where('user.role != :adminRole', { adminRole: UserRole.ADMIN });
        }
        if (role) {
            switch (role) {
                case UserRole.MERCHANT:
                    qb.innerJoinAndSelect('user.merchant', 'merchant');
                    break;
                case UserRole.SHOPKEEPER:
                    qb.innerJoinAndSelect('user.shopkeeper', 'shopKeeper');
                    break;
                case UserRole.DRIVER:
                    qb.innerJoinAndSelect('user.driver', 'driver');
                    break;
                case UserRole.CUSTOMER:
                    qb.innerJoinAndSelect('user.customer', 'customer');
                    break;
                default:
                    break;
            }
        } else {
            qb.leftJoinAndSelect('user.merchant', 'merchant')
                .leftJoinAndSelect('user.shopkeeper', 'shopKeeper')
                .leftJoinAndSelect('user.driver', 'driver')
                .leftJoinAndSelect('user.customer', 'customer')
                .where('user.role != :adminRole', { adminRole: UserRole.ADMIN })
                .andWhere(
                    new Brackets((qb) => {
                        qb.where('merchant.id IS NOT NULL')
                            .orWhere('driver.id IS NOT NULL')
                            .orWhere('shopKeeper.id IS NOT NULL')
                            .orWhere('customer.id IS NOT NULL');
                    }),
                );
        }
        const result = await paginate(qb, dto);
        const data = result.data.map(({ password, ...user }) => user);
        return { data, page: result.page, limit: result.limit, total: result.total }
    }


    async getMerchantUsers(merchant_id: string, role: UserRole | null): Promise<User[]> {
        const relations = role ? [role.toLowerCase()] : [UserRole.DRIVER.toLowerCase(), UserRole.SHOPKEEPER.toLowerCase()];
        const merchantUser = await this.userRepo.find({
            where: {
                parentUser: {
                    id: merchant_id
                },
                ...(role ? { role } : {}),

            }, relations
        });
        if (!merchantUser) throw new NotFoundException("Merchant not found");
        return merchantUser;
    }

    private readonly validColumns = [
        'barcode',
        'title',
        'category',
        'unit',
        'packaging',
        'inventory_type',
        'description'
    ];

    async extractCsvHeaders(file: Express.Multer.File): Promise<string[]> {
        if (!file) throw new BadRequestException('No file provided');

        return new Promise((resolve, reject) => {
            const headers: string[] = [];
            fs.createReadStream(file.path)
                .pipe(fastcsv.parse({ headers: true }))
                .on('headers', (hdrs) => {
                    headers.push(...hdrs);
                    fs.unlinkSync(file.path);
                    resolve(headers);
                })
                .on('error', (err) => reject(err));
        });
    }

    private async createUploadJob(fileName: string, totalCsvRecords: number, merchant: Merchant) {
        const job = this.uploadJobRepo.create({
            file_name: fileName,
            total_csv_records: totalCsvRecords,
            total_inserted: 0,
            status: UploadJobStatus.PENDING,
            merchant,
        });
        return this.uploadJobRepo.save(job);
    }

    async bulkUploadWithMapping(file: Express.Multer.File, mappingRaw: any, merchantId: string,): Promise<{ jobId: string }> {
        if (!file) throw new BadRequestException('No CSV file provided');

        const merchant = await this.merchantRepo.findOne({ where: { id: merchantId } });

        if (!merchant) {
            try { fs.unlinkSync(file.path); } catch (e) { }
            throw new NotFoundException('Merchant details not found');
        }

        let mapping: Record<string, string>;

        try {
            console.log(mapping = typeof mappingRaw === 'string' ? JSON.parse(mappingRaw) : mappingRaw);
            mapping = typeof mappingRaw === 'string' ? JSON.parse(mappingRaw) : mappingRaw;
        } catch (e) {
            console.log({ e, er: e.message });
            try { fs.unlinkSync(file.path); } catch (ee) { }
            throw new BadRequestException('Invalid mapping JSON format');
        }

        // parse CSV rows (synchronous here to determine total rows before creating job)

        const rows = await parseCsvFile(file.path);

        if (rows.length === 0) {
            try { fs.unlinkSync(file.path); } catch (e) { }
            throw new BadRequestException('CSV file is empty');
        }

        // validate mapping CSV column names exist
        const csvHeaders = Object.keys(rows[0]);
        const invalidColumns: string[] = [];

        for (const [dbCol, csvCol] of Object.entries(mapping)) {
            if (csvCol && !csvHeaders.includes(csvCol)) {
                invalidColumns.push(`${dbCol} -> ${csvCol}`);
            }
        }

        if (invalidColumns.length > 0) {
            try { fs.unlinkSync(file.path); } catch (e) { }
            throw new BadRequestException(
                `Invalid mapping provided. These CSV columns are missing: ${invalidColumns.join(', ')}`,
            );
        }

        // validate DB column keys (strict)
        const invalidDbColumns = Object.keys(mapping).filter(k => !this.validColumns.includes(k));

        if (invalidDbColumns.length > 0) {
            try { fs.unlinkSync(file.path); } catch (e) { }
            throw new BadRequestException(`Invalid DB columns provided: ${invalidDbColumns.join(', ')}`);
        }

        // build unique fileName (use original stored filename because multer already saved with timestamp)
        // file.originalname is original; file.filename is stored name (see controller config)
        const storedFileName = file.filename ?? `${file.originalname.split('.')[0]}-${Date.now()}`;
        // create job record
        const job = await this.createUploadJob(storedFileName, rows.length, merchant);

        // start background processing (non-blocking). We pass rows to avoid re-parsing file.
        // we still pass file.path to cleanup file at the end.
        this.processCsvAsync(job.id, file.path, rows, mapping, merchant).catch(async (err) => {
            console.error('processCsvAsync error:', err);
            try {
                await this.uploadJobRepo.update(job.id, { status: UploadJobStatus.FAILED });
            } catch (_) { }
            // ensure file removed
            try { if (fs.existsSync(file.path)) fs.unlinkSync(file.path); } catch (e) { }
        });

        return { jobId: job.id };
    }

    private async processCsvAsync(
        jobId: string,
        filePath: string,
        rows: any[],
        mapping: Record<string, string>,
        merchant: Merchant,
    ): Promise<void> {
        try {
            // map rows -> Partial<TempProducts> array
            const mappedRows: Partial<TempProducts>[] = rows.map((row) => {
                const obj: any = {};

                for (const validCol of this.validColumns) {
                    const csvCol = mapping[validCol]; // e.g. barcode -> "code"
                    if (csvCol && row[csvCol] !== undefined) {
                        // map DB field names to TempProducts entity columns
                        // your TempProducts fields use the same names as validColumns
                        obj[validCol] = row[csvCol];
                    }
                }

                if (!obj['category'] || obj['category'].trim() === '') {
                    obj['category'] = 'Not_Category';
                }

                if (!obj['description'] || obj['description'].trim() === '') {
                    obj['description'] = "Need to add description"; // mark for AI generation later
                }

                obj['merchant'] = merchant;
                return obj;
            });

            // fetch job to read file_name (we stored it)
            const job = await this.uploadJobRepo.findOne({ where: { id: jobId }, relations: ['merchant'] });
            if (!job) throw new Error('Job not found during processing');

            // set file_name on each mapped row
            mappedRows.forEach(r => (r['file_name'] = job.file_name));

            // Bulk insert in chunks to avoid too-large single insert (safe for big CSVs)
            const CHUNK_SIZE = 500;
            let totalInserted = 0;

            for (let i = 0; i < mappedRows.length; i += CHUNK_SIZE) {
                const chunk = mappedRows.slice(i, i + CHUNK_SIZE);
                if (chunk.length === 0) continue;

                const insertResult = await this.tempProductRepo.createQueryBuilder()
                    .insert()
                    .into(TempProducts)
                    .values(chunk)
                    .returning('id, title')
                    .execute();

                totalInserted += chunk.length;

                // for (const inserted of insertResult.generatedMaps) {
                //     const tempProductId = inserted.id;
                //     const title = inserted.title;

                //     if (title) {
                //         this.fetchAndSaveProductImage(title, tempProductId).catch((err) =>
                //             console.error('Image fetch failed for', title, err.message)
                //         );
                //     }
                // }
                const productsForImage = insertResult.generatedMaps
                    .filter(item => item.title)
                    .map(item => ({
                        title: item.title,
                        tempProductId: item.id,
                    }));

                // Run image scraping in parallel batches
                if (productsForImage.length > 0) {
                    await this.fetchImagesForAll(productsForImage);
                }
                // optional: update job progress after each chunk
                await this.uploadJobRepo.update(jobId, { total_inserted: totalInserted });
            }

            // mark job completed
            await this.uploadJobRepo.update(jobId, {
                total_inserted: totalInserted,
                status: UploadJobStatus.COMPLETED,
                completed_at: new Date(),
            });

            try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (e) { }
        } catch (err) {
            try { await this.uploadJobRepo.update(jobId, { status: UploadJobStatus.FAILED }); } catch (_) { }
            try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (e) { }
            throw err;
        }
    }

    private async fetchAndSaveProductImage(title: string, tempProductId: string) {
        try {
            const limit = parseInt(process.env.AUTO_IMAGE_SCRAP_LIMIT || '1', 10);

            const images = await this.ehnhancedScraperService.getProductImages(title, limit, false);

            if (!images || images.length === 0) return;

            const imageRepo = this.dataSource.getRepository(ProductImage);
            const imageEntities = images.map((url) =>
                imageRepo.create({
                    url,
                    temp_product: { id: tempProductId }
                })
            );

            await imageRepo.save(imageEntities);
            console.log(
                `✅ Saved ${images.length} image(s) for product "${title}" (TempProductID: ${tempProductId})`
            );
        } catch (error) {
            console.warn(`❌ Failed to fetch image for "${title}":`, error.message);
        }
    }

    private async fetchAndSaveCategoryImage(categoryName: string, category: Category) {
        try {
            // For categories, we only need 1 image
            const limit = 1;

            const images = await this.ehnhancedScraperService.getProductImages(categoryName, limit, false);

            if (!images || images.length === 0) {
                console.warn(`⚠️ No images found for category "${categoryName}"`);
                return;
            }

            // Update category with the first image
            category.category_image = images[0];
            await this.categoryRepo.save(category);

            console.log(
                `✅ Saved category image for "${categoryName}" (CategoryID: ${category.id})`
            );
        } catch (error) {
            console.warn(`❌ Failed to fetch image for category "${categoryName}":`, error.message);
        }
    }

    private async fetchImagesForAll(products: { title: string; tempProductId: string }[]): Promise<void> {
        const concurrency = parseInt(process.env.AUTO_IMAGE_SCRAP_REQUEST_LIMIT || '1', 10);

        if (!Array.isArray(products) || products.length === 0) return;

        console.log(`🚀 Starting image scraping for ${products.length} products (Concurrency = ${concurrency})`);

        const chunks: { title: string; tempProductId: string }[][] = [];
        for (let i = 0; i < products.length; i += concurrency) {
            chunks.push(products.slice(i, i + concurrency));
        }

        let processed = 0;

        for (const batch of chunks) {
            await Promise.allSettled(
                batch.map(async (p) => {
                    await this.fetchAndSaveProductImage(p.title, p.tempProductId);
                    processed++;
                    console.log(`📦 Progress: ${processed}/${products.length}`);
                })
            );

            await new Promise((r) => setTimeout(r, 200));
        }

        console.log(`✅ Completed image scraping for ${products.length} products.`);
    }

    // job status getter
    async getUploadJobStatus(jobId: string) {
        const job = await this.uploadJobRepo.findOne({ where: { id: jobId }, relations: ['merchant'] });
        if (!job) throw new NotFoundException('Job not found');
        // If pending return light payload; if completed/failed return full job
        if (job.status === UploadJobStatus.PENDING) {
            return { jobId: job.id, status: job.status, total_csv_records: job.total_csv_records, total_inserted: job.total_inserted };
        }
        return job;
    }

    async getAllUploadJobs(dto: GetUploadedFileJobs, query: PaginationDto): Promise<any> {
        const { merchant_id, status, search } = dto || {};
        const page = query.page || 1;
        const limit = query.limit || 10;

        // Build base query for filtering
        const baseQb = this.uploadJobRepo.createQueryBuilder('job')
            .leftJoin('job.merchant', 'merchant');

        if (merchant_id) baseQb.andWhere('merchant.id = :merchantId', { merchantId: merchant_id });
        if (status) baseQb.andWhere('job.status = :status', { status });
        if (search) {
            baseQb.andWhere('LOWER(job.file_name) LIKE LOWER(:search)', {
                search: `%${search}%`,
            });
        }

        // Get total count
        const total = await baseQb.getCount();

        // Build query with join and count for data
        const qb = this.uploadJobRepo.createQueryBuilder('job')
            .leftJoinAndSelect('job.merchant', 'merchant')
            .leftJoin(
                'temp_products',
                'temp',
                'temp.file_name = job.file_name AND temp.is_published = false'
            )
            .leftJoin(
                'product_duplicates',
                'dup',
                'dup.file_name = job.file_name'
            )
            .addSelect('COUNT(DISTINCT temp.id)', 'unpublished_count')
            .addSelect('COUNT(DISTINCT dup.id)', 'duplicates_count')
            .groupBy('job.id')
            .addGroupBy('merchant.id');

        if (merchant_id) qb.andWhere('merchant.id = :merchantId', { merchantId: merchant_id });
        if (status) qb.andWhere('job.status = :status', { status });
        if (search) {
            qb.andWhere('LOWER(job.file_name) LIKE LOWER(:search)', {
                search: `%${search}%`,
            });
        }
        qb.orderBy('job.updated_at', 'DESC');

        // Get raw results to access the count
        const result = await qb
            .skip((page - 1) * limit)
            .take(limit)
            .getRawAndEntities();

        return {
            data: result.raw.map((raw: any) => ({
                id: raw.job_id,
                file_name: raw.job_file_name,
                uploaded_at: raw.job_created_at,
                status: raw.job_status,
                merchant_id: raw.merchant_id,
                unpublished_count: parseInt(raw.unpublished_count || '0', 10),
                duplicates_count: parseInt(raw.duplicates_count || '0', 10),
            })),
            page: page,
            limit: limit,
            total: total
        }
    }

    async publishFileToProducts(dto: PublishTempProductsDto) {
        const { merchant_id, file_name, temp_ids } = dto || {}

        if (file_name && temp_ids) {
            throw new BadRequestException("You can only add selected csv entries to the product or can add with filename");
        }

        const findMerchantUser = await this.merchantRepo.findOne({
            where: {
                id: merchant_id
            }, relations: ['user']
        });

        if (!findMerchantUser) throw new NotFoundException("This merchant not found");

        let tempRecords: TempProducts[] = [];

        if (file_name) {
            tempRecords = await this.tempProductRepo.find({
                where: { merchant: { id: merchant_id }, file_name: file_name, is_archive: false, is_published: false }, relations: ['merchant']
            });
        } else if (temp_ids?.length) {
            tempRecords = await this.tempProductRepo.find({
                where: { id: In(temp_ids), merchant: { id: merchant_id }, is_archive: false, is_published: false },
                relations: ['merchant'],
            });

        }

        if (!tempRecords.length) throw new NotFoundException('No temp records found');

        let inserted = 0;
        let duplicates = 0;

        for (const temp of tempRecords) {
            // 🔍 check duplicate conditions
            const existingProduct = await this.productRepo.createQueryBuilder('p')
                .where('p.barcode = :barcode', { barcode: temp.barcode })
                .orWhere('LOWER(p.product_name) LIKE LOWER(:title)', { title: `%${temp.title}%` })
                .andWhere('p.product_size = :size', { size: temp.unit })
                .andWhere('p.is_deleted = :deleted', { deleted: false })
                .getOne();

            if (existingProduct) {
                // duplicate → save in ProductDuplicates table
                const dup = this.productDuplicatesRepo.create({
                    file_name: temp.file_name,
                    temp_product: temp,
                    product: existingProduct,
                });
                await this.productDuplicatesRepo.save(dup);

                duplicates++;
                continue;
            }

            let category: Category;

            const existingCategory = await this.categoryRepo.findOne({
                where: { category_name: temp.category }
            });

            if (!existingCategory) {
                // const catSlug = await generateUniqueSlug(this.categoryRepo, temp.category);
                // console.log({ catSlug });
                const newCategory = this.categoryRepo.create({
                    category_name: temp.category,
                    is_active: true,
                    status: ProductStatus.APPROVED,
                    added_by: findMerchantUser.user
                });
                const savedNewCat = await this.categoryRepo.save(newCategory);
                category = savedNewCat;

                // Fetch and save category image asynchronously
                this.fetchAndSaveCategoryImage(temp.category, savedNewCat).catch((err) =>
                    console.error('Category image fetch failed for', temp.category, err.message)
                );
            } else {
                category = existingCategory
            }

            const slug = await generateUniqueSlug(this.productRepo, temp.title);

            // ✅ insert new product
            const newProduct = this.productRepo.create({
                barcode: temp.barcode,
                product_name: temp.title,
                product_size: temp.unit,
                category: category,
                description: temp.description,
                added_by: findMerchantUser.user,
                is_active: true,
                status: ProductStatus.APPROVED,
                slug,
            });

            const saved = await this.productRepo.save(newProduct);

            // update temp record with product_id
            temp.product = saved;
            await this.tempProductRepo.save(temp);

            // 🔄 Update ProductImage table: assign product_id where temp_product_id matches
            await this.productImageRepo.createQueryBuilder()
                .update()
                .set({ product: saved })
                .where('temp_product_id = :tempId', { tempId: temp.id })
                .execute();

            inserted++;
        }
        //  // update many here
        await this.tempProductRepo.update(tempRecords.map(temp => temp.id), { is_published: true });
        return { inserted, duplicates };
    }

    async getAllDuplicates(file_name: string, dto: PaginationDto): Promise<any> {
        const qb = this.productDuplicatesRepo.createQueryBuilder('dp')
            .leftJoin('dp.temp_product', 'temp_product')
            .leftJoin('dp.product', 'product')
            .select('temp_product.title', 'csv_product_name')
            .select([
                'dp.id',
                'dp.file_name',
                'dp.created_at',
                'dp.updated_at',
                'temp_product.title',
                'product.product_name',
            ]);
        if (file_name) {
            qb.andWhere('LOWER(dp.file_name) LIKE LOWER(:file_name)', { file_name: `%${file_name}%` });
        }
        const { data, total, page, limit } = await paginate(qb, dto);
        const formattedData = data.map((d: any) => ({
            id: d.dp_id || d.id,
            file_name: d.file_name || null,
            csv_product_name: d.temp_product?.title || null,
            main_product_name: d.product?.product_name || null,
            created_at: d.dp_created_at || d.created_at,
            updated_at: d.dp_updated_at || d.updated_at,
        }));

        return { data: formattedData, total, page, limit };
    }


    async getDuplicateCountsByMerchant(merchant_id: string): Promise<any> {
        if (!merchant_id) throw new BadRequestException("Merchant id required");
        const result = await this.productDuplicatesRepo
            .createQueryBuilder('dp')
            .innerJoin('dp.temp_product', 'temp_product')
            .where('temp_product.merchant_id = :merchant_id', { merchant_id })
            .andWhere('dp.file_name IS NOT NULL')
            .select('dp.file_name', 'file_name')
            .addSelect('COUNT(dp.id)', 'items')
            .groupBy('dp.file_name')
            .orderBy('items', 'DESC')
            .getRawMany();

        return {
            data: result.map(r => ({
                file_name: r.file_name,
                items: Number(r.items),
            })),
        };
    }


    async getDuplicateProductDetails(dpId: string): Promise<ProductDuplicates> {
        const getProductDup = await this.productDuplicatesRepo.findOne({
            where: {
                id: dpId
            }, relations: ['temp_product', 'product']
        });
        if (!getProductDup) throw new NotFoundException("No product found");
        return getProductDup
    }

    async acceptDuplicateProduct(duplicateId: string): Promise<{ message: string; productId: string }> {
        let newCategoryId: string | null = null;
        let newCategoryName: string | null = null;

        const result = await this.dataSource.transaction(async (manager) => {
            const dupRepo = manager.getRepository(ProductDuplicates);
            const prodRepo = manager.getRepository(Products);
            const cateRepo = manager.getRepository(Category);
            const imageRepo = manager.getRepository(ProductImage);
            const tempRepo = manager.getRepository(TempProducts);

            // 1️⃣ Fetch duplicate record with relations
            const duplicate = await dupRepo.findOne({
                where: { id: duplicateId },
                relations: ['temp_product.merchant.user', 'product'],
            });
            if (!duplicate) throw new NotFoundException('Duplicate product not found.');

            // 2️⃣ Check for existing product with same barcode (Fast check)
            if (duplicate.temp_product.barcode) {
                const barcodeExists = await prodRepo
                    .createQueryBuilder('p')
                    .where('p.barcode = :barcode', { barcode: duplicate.temp_product.barcode })
                    .getExists();

                if (barcodeExists) {
                    throw new BadRequestException(
                        `A product with barcode "${duplicate.temp_product.barcode}" already exists.`,
                    );
                }
            }
            let category: Category | null | undefined;
            if (duplicate.temp_product.category) {
                const existingCategory = await cateRepo.findOne({
                    where: { category_name: duplicate.temp_product.category }
                });
                if (!existingCategory) {
                    const catSlug = await generateUniqueSlug(cateRepo, duplicate.temp_product.category);
                    console.log({ catSlug });
                    const newCategory = cateRepo.create({
                        category_name: duplicate.temp_product.category,
                        is_active: true,
                        status: ProductStatus.APPROVED,
                        added_by: duplicate.temp_product.merchant.user,
                        slug: catSlug
                    });
                    category = await cateRepo.save(newCategory);
                    
                    // Store category info to fetch image after transaction
                    newCategoryId = category.id;
                    newCategoryName = duplicate.temp_product.category;
                } else {
                    category = existingCategory
                }
            }

            // 3️⃣ Generate unique slug based on title
            const slug = await generateUniqueSlug(prodRepo, duplicate.temp_product.title);

            // 4️⃣ Insert product efficiently
            const newProduct = prodRepo.create({
                product_name: duplicate.temp_product.title,
                barcode: duplicate.temp_product.barcode,
                product_size: duplicate.temp_product.unit,
                category: category ? category : undefined,
                slug,
                is_active: true,
                added_by: duplicate.temp_product.merchant.user,
                status: ProductStatus.APPROVED
            });
            const savedProduct = await prodRepo.save(newProduct);

            duplicate.temp_product.product = savedProduct;
            await tempRepo.save(duplicate.temp_product);

            // 6️⃣ Update images: set product_id where temp_product_id matches
            await imageRepo.createQueryBuilder()
                .update()
                .set({ product: savedProduct })
                .where('temp_product_id = :tempId', { tempId: duplicate.temp_product.id })
                .execute();

            // 5️⃣ Delete duplicate record
            await dupRepo.delete(duplicateId);

            return {
                message: 'Duplicate product accepted successfully.',
                productId: savedProduct.id,
            };
        });

        // Fetch category image after transaction completes
        if (newCategoryId && newCategoryName) {
            const categoryForImage = await this.categoryRepo.findOne({ where: { id: newCategoryId } });
            if (categoryForImage) {
                this.fetchAndSaveCategoryImage(newCategoryName, categoryForImage).catch((err) =>
                    console.error('Category image fetch failed for', newCategoryName, err.message)
                );
            }
        }

        return result;
    }

    async rejectDuplicateProduct(duplicateId: string): Promise<{ message: string }> {
        const dupRepo = this.dataSource.getRepository(ProductDuplicates);
        const deleted = await dupRepo.delete(duplicateId);

        if (!deleted.affected)
            throw new NotFoundException('Duplicate product not found.');

        return { message: 'Duplicate product rejected successfully.' };
    }

    async listUploadedFiles(merchantId: string) {
        if (!merchantId) throw new BadRequestException('merchantId is required');

        const qb = this.tempProductRepo.createQueryBuilder('t')
            .select('t.file_name', 'fileName')
            .addSelect('COUNT(*)', 'totalRecords')
            .addSelect('MAX(t.created_at)', 'uploadedAt')
            .where('t.merchant_id = :merchantId', { merchantId })
            .groupBy('t.file_name')
            .orderBy('"uploadedAt"', 'DESC');

        const rows = await qb.getRawMany();
        return rows.map(r => ({
            fileName: r.fileName,
            totalRecords: Number(r.totalRecords),
            uploadedAt: r.uploadedAt
        }));
    }

    async getFileEntriesWithFilters(fileName: string, merchantId: string, is_archive: boolean, paginationDto: PaginationDto) {
        if (!fileName) throw new BadRequestException('fileName is required');
        if (!merchantId) throw new BadRequestException('merchantId is required');
        const qb = this.tempProductRepo
            .createQueryBuilder('tempProduct')
            .leftJoinAndSelect('tempProduct.images', 'images', 'images.is_deleted = false')
            .where('tempProduct.file_name = :fileName', { fileName })
            .andWhere('tempProduct.is_archive = :archive', { archive: is_archive })
            .andWhere('tempProduct.is_published = false')
            .andWhere('tempProduct.product IS NULL')
            .andWhere('tempProduct.merchant_id = :merchantId', { merchantId })
            .orderBy('tempProduct.updated_at', 'DESC');

        return paginate(qb, paginationDto);
    }

    async getAllFileEntries(fileName: string, merchantId: string, paginationDto: PaginationDto) {
        if (!fileName) throw new BadRequestException('fileName is required');
        if (!merchantId) throw new BadRequestException('merchantId is required');
        const qb = this.tempProductRepo
            .createQueryBuilder('tempProduct')
            .leftJoinAndSelect('tempProduct.images', 'images', 'images.is_deleted = false')
            .where('tempProduct.file_name = :fileName', { fileName })
            .andWhere('tempProduct.is_archive = false')
            .andWhere('tempProduct.is_published = false')
            .andWhere('tempProduct.product IS  NULL')
            .andWhere('tempProduct.merchant_id = :merchantId', { merchantId })
            .orderBy('tempProduct.updated_at', 'DESC');

        return paginate(qb, paginationDto);
    }

    async archiveToggleTempProducts(dto: ToggleArchiveDto) {
        const { merchant_id, temp_ids, file_name } = dto;

        if (file_name && temp_ids) {
            throw new BadRequestException("You can only add selected csv entries to the product or can add with filename");
        }

        let tempProducts: TempProducts[];
        if (file_name) {
            tempProducts = await this.tempProductRepo.find({
                where: {
                    file_name,
                    merchant: { id: merchant_id },
                },
            });
        } else if (temp_ids?.length) {
            tempProducts = await this.tempProductRepo.find({
                where: {
                    id: In(temp_ids),
                    merchant: { id: merchant_id },
                },
            });
        } else {
            throw new BadRequestException('No valid temp_ids or filename provided');
        }

        if (!tempProducts.length) {
            throw new BadRequestException('No valid products found for the given criteria');
        }

        for (const product of tempProducts) {
            product.is_archive = !product.is_archive;
        }

        await this.tempProductRepo.save(tempProducts);

        return {
            message: `${tempProducts.length} product(s) archive status toggled successfully`,
            updated: tempProducts.map((p) => ({
                id: p.id,
                is_archive: p.is_archive,
            })),
        };
    }

    async deleteFileEntries(fileName: string, merchantId: string) {
        if (!fileName) throw new BadRequestException('fileName is required');
        if (!merchantId) throw new BadRequestException('merchantId is required');

        const res = await this.tempProductRepo.createQueryBuilder()
            .delete()
            .from(TempProducts)
            .where('file_name = :fileName AND merchant_id = :merchantId', { fileName, merchantId })
            .execute();

        return { deleted: res.affected ?? 0 };
    }

    async getMerchantDetails(merchant_user_id: string): Promise<any> {
        const merchant = await this.userRepo
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.merchant', 'merchantDetails')
            .leftJoinAndSelect('merchantDetails.stores', 'merchantStores')
            .leftJoinAndSelect('merchantDetails.shop_keepers', 'merchantShopkeepers')
            .leftJoinAndSelect('merchantDetails.drivers', 'merchantDrivers')
            .leftJoinAndSelect('merchantStores.shop_keepers', 'merchantStoresShopkeepers')
            .leftJoinAndSelect('merchantStores.drivers', 'merchantStoresdrivers')
            .where('user.id = :merchant_user_id', { merchant_user_id })
            .andWhere('user.role = :user_role', { user_role: UserRole.MERCHANT })
            .andWhere('merchantStores.is_deleted = :isDeleted', { isDeleted: false })
            .getOne();
        if (!merchant) throw new NotFoundException("Merchant not found");
        const { password, ...merchantUser } = merchant
        return merchantUser;
    }

    async getStoreDrivers(user: User, store_id: string, query: PaginationDto): Promise<any> {
        const store = await this.storeRepo.findOne({
            where: {
                id: store_id,
                is_deleted: false,
            }
        });
        if (!store) throw new NotFoundException("Store not found");
        const qb = this.driverRepo
            .createQueryBuilder('driver')
            .leftJoinAndSelect('driver.assignments', 'assignedOrders')
            .leftJoinAndSelect('driver.user', 'user')
            .where('driver.store_id = :storeId', { storeId: store.id })
        // .andWhere('user.status = :status', { status: EmployeeStatus.ACTIVE })
        // .andWhere('user.is_verified = :isVerified', { isVerified: true })
        // .orderBy('driver.created_at', 'DESC');

        const { data, total, page, limit } = await paginate(qb, query);
        const sanitizedData = data.map((driver) => {
            if (driver.user) {
                const driverAssignedOrdersLength = driver.assignments.filter(order => order.status === DriverAssignmentStatus.ASSIGNED || order.status === DriverAssignmentStatus.ACCEPTED);
                const totalAssignedOrdersToDriver = driverAssignedOrdersLength.length;
                const { password, ...userWithoutPassword } = driver.user;
                return { ...driver, user: userWithoutPassword, assignedOrders: totalAssignedOrdersToDriver };
            }
            return driver;
        });
        return {
            data: sanitizedData,
            total,
            page,
            limit,
        };
    }
}
