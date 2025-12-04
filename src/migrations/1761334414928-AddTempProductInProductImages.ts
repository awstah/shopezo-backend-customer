import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTempProductInProductImages1761334414928 implements MigrationInterface {
    name = 'AddTempProductInProductImages1761334414928'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_images" ADD "temp_product_id" uuid`);
        await queryRunner.query(`ALTER TABLE "product_images" ADD CONSTRAINT "FK_a08afa3614eefe87b3727fd0bcb" FOREIGN KEY ("temp_product_id") REFERENCES "temp_products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_images" DROP CONSTRAINT "FK_a08afa3614eefe87b3727fd0bcb"`);
        await queryRunner.query(`ALTER TABLE "product_images" DROP COLUMN "temp_product_id"`);
    }

}
