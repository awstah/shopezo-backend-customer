import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Store } from "express-rate-limit";
import { Repository } from "typeorm";
import { Stores } from "../entities/stores.entity";
import { Merchant } from "../entities/merchantDetails.entity";
import { Shopkepper } from "../entities/shopkeeperDetails.entity";

@Injectable()
export class EntityValidatorService {
    constructor(
        @InjectRepository(Stores)
        private readonly storeRepo: Repository<Stores>,
        @InjectRepository(Merchant)
        private readonly merchantRepo: Repository<Merchant>,
        @InjectRepository(Shopkepper)
        private readonly shopkeeperRepo: Repository<Shopkepper>,
    ) { }

    async validateEntities(checks: { name: string; query: Promise<any> }[]) {
        const results = await Promise.all(checks.map(c => c.query));
        const missing = checks
            .map((c, i) => (!results[i] ? c.name : null))
            .filter(Boolean);

        if (missing.length > 0) {
            throw new BadRequestException(`Invalid or missing: ${missing.join(', ')}`);
        }
    }

    getStoreCheck(store_id: string, merchant_id: string) {
        return {
            name: 'store_id',
            query: this.storeRepo.findOne({
                where: { id: store_id, is_deleted: false, merchant: {id: merchant_id} },
                select: ['id'],
            }),
        };
    }

    getMerchantCheck(merchant_id: string, parent_user_id: string) {
        return {
            name: 'merchant_id',
            query: this.merchantRepo.findOne({
                where: { id: merchant_id, user_id: parent_user_id },
                select: ['id'],
            }),
        };
    }

    getShopkeeperCheck(shopkeeper_id: string, merchant_id: string, store_id: string) {
        return {
            name: 'shopkeeper_id',
            query: this.shopkeeperRepo.findOne({
                where: {
                    id: shopkeeper_id,
                    merchant: { id: merchant_id },
                    store: { id: store_id, is_deleted: false },
                },
                select: ['id'],
            }),
        };
    }
}
