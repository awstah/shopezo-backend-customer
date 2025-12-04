import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMerchantIdInTempTable1759407978027 implements MigrationInterface {
    name = 'AddMerchantIdInTempTable1759407978027'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "temp_products" RENAME COLUMN "added_for" TO "merchant_id"`);
        await queryRunner.query(`ALTER TABLE "temp_products" DROP COLUMN "merchant_id"`);
        await queryRunner.query(`ALTER TABLE "temp_products" ADD "merchant_id" uuid`);
        await queryRunner.query(`ALTER TABLE "temp_products" ADD CONSTRAINT "FK_7835b2f34cf07e95f9ba0f0b87e" FOREIGN KEY ("merchant_id") REFERENCES "merchant"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "temp_products" DROP CONSTRAINT "FK_7835b2f34cf07e95f9ba0f0b87e"`);
        await queryRunner.query(`ALTER TABLE "temp_products" DROP COLUMN "merchant_id"`);
        await queryRunner.query(`ALTER TABLE "temp_products" ADD "merchant_id" character varying`);
        await queryRunner.query(`ALTER TABLE "temp_products" RENAME COLUMN "merchant_id" TO "added_for"`);
    }

}
