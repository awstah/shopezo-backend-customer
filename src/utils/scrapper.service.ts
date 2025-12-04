import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

@Injectable()
export class ScraperService {
    async scrapeImages(query: string, limit = 5): Promise<string[]> {
        const searchUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2&first=1&tsc=ImageBasicHover`;

        const { data: html } = await axios.get(searchUrl, {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0.4472.124 Safari/537.36',
            },
        });

        const $ = cheerio.load(html);
        const imageUrls: string[] = [];

        $('a.iusc').each((_, element) => {
            const metaRaw = $(element).attr('m');
            if (metaRaw) {
                try {
                    const meta = JSON.parse(metaRaw);
                    if (meta?.murl) {
                        imageUrls.push(meta.murl);
                    }
                } catch (_) { }
            }
        });

        if (imageUrls.length === 0) {
            throw new Error('No images found from Bing');
        }

        return imageUrls.slice(0, limit);
    }
}

export class EnhancedScraperService {
    private readonly s3 = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
    });
    private readonly bucket = process.env.AWS_S3_BUCKET_NAME!;

    /**
     * 🔍 Step 1: Get existing images from S3 bucket
     */
    private async getS3Images(productName: string, limit = 5): Promise<string[]> {
        const normalized = productName.trim().replace(/\s+/g, '-');
        const prefix = `products/${normalized}/`;

        try {
            const command = new ListObjectsV2Command({
                Bucket: this.bucket,
                Prefix: prefix,
            });

            const result = await this.s3.send(command);
            const keys = result.Contents?.map((obj) => obj.Key) || [];
            console.log('📦 S3 Keys Found:', keys);
            const s3Urls =
                keys.map(
                    (key) =>
                        `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
                );
            console.log('✅ Returning S3 URLs:', s3Urls);

            return s3Urls.slice(0, limit);
        } catch (err) {
            console.error('Error fetching S3 images:', err);
            return [];
        }
    }

    /**
     * 🌐 Step 2: Scrape images from the web (Bing)
     */
    private async scrapeFromWeb(query: string, limit = 5): Promise<string[]> {
        const searchUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2&first=1`;

        try {
            const { data: html } = await axios.get(searchUrl, {
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0.4472.124 Safari/537.36',
                },
            });

            const $ = cheerio.load(html);
            const urls: string[] = [];

            $('a.iusc').each((_, el) => {
                const meta = $(el).attr('m');
                if (meta) {
                    try {
                        const json = JSON.parse(meta);
                        if (json?.murl) urls.push(json.murl);
                    } catch { }
                }
            });

            return urls.slice(0, limit);
        } catch (err) {
            console.error('Error scraping Bing:', err);
            throw new InternalServerErrorException('Web scraping failed.');
        }
    }

    /**
     * ⚙️ Step 3: Main logic to get combined images
     */
    // async getProductImages(productName: string, totalImages = 5): Promise<string[]> {
    //     const s3Images = await this.getS3Images(productName, totalImages);
    //     console.log({ s3Images });
    //     const remaining = totalImages - s3Images.length;
    //     console.log({ remaining });

    //     if (remaining <= 0) return s3Images;

    //     const webImages = await this.scrapeFromWeb(productName, remaining);
    //     console.log({ webImages });
    //     return [...s3Images, ...webImages];
    // }

    async getProductImages(
        query: string,
        limit = 5,
        fromWebOnly = false,
    ): Promise<string[]> {
        try {
            // 🪣 Step 1: Fetch from S3 (only if not forced to go web-only)
            let s3Images: string[] = [];
            if (!fromWebOnly) {
                s3Images = await this.getS3Images(query, limit);
            }

            // 🌐 Step 2: If web-only OR not enough S3 images, fetch from web
            let remainingImages: string[] = [];
            if (fromWebOnly || s3Images.length < limit) {
                const needed = limit - s3Images.length;
                remainingImages = await this.scrapeFromWeb(query, needed > 0 ? needed : limit);
            }

            // 🧩 Step 3: Combine and return (S3 first, then web)
            const allImages = fromWebOnly
                ? remainingImages
                : [...s3Images, ...remainingImages];

            if (allImages.length === 0) {
                throw new HttpException('No images found from S3 or web', HttpStatus.NOT_FOUND);
            }

            return allImages.slice(0, limit);
        } catch (err) {
            throw new HttpException(
                'Scraping failed: ' + err.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
