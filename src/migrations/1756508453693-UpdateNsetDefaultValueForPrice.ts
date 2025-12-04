import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateNsetDefaultValueForPrice1756508453693 implements MigrationInterface {
    name = 'UpdateNsetDefaultValueForPrice1756508453693'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "total_amount"`);
        await queryRunner.query(`ALTER TABLE "order" ADD "total_amount" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "order_item" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "order_item" ADD "price" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "shop_product" ALTER COLUMN "price" SET DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shop_product" ALTER COLUMN "price" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "order_item" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "order_item" ADD "price" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "total_amount"`);
        await queryRunner.query(`ALTER TABLE "order" ADD "total_amount" character varying NOT NULL`);
    }

}
