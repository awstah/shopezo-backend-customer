import { MigrationInterface, QueryRunner } from "typeorm";

export class SkuAndBarcode1757677275963 implements MigrationInterface {
    name = 'SkuAndBarcode1757677275963'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "barcode" character varying`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "UQ_adfc522baf9d9b19cd7d9461b7e" UNIQUE ("barcode")`);
        await queryRunner.query(`ALTER TABLE "shop_product" ADD "sku" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shop_product" DROP COLUMN "sku"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "UQ_adfc522baf9d9b19cd7d9461b7e"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "barcode"`);
    }

}
