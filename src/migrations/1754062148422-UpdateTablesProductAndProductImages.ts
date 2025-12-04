import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTablesProductAndProductImages1754062148422 implements MigrationInterface {
    name = 'UpdateTablesProductAndProductImages1754062148422'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_images" ADD "is_deleted" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "product_images" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "product_images" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "products" ADD "is_deleted" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "is_deleted"`);
        await queryRunner.query(`ALTER TABLE "product_images" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "product_images" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "product_images" DROP COLUMN "is_deleted"`);
    }

}
