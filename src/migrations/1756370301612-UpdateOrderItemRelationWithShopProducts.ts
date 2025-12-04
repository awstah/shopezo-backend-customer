import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateOrderItemRelationWithShopProducts1756370301612 implements MigrationInterface {
    name = 'UpdateOrderItemRelationWithShopProducts1756370301612'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_item" DROP CONSTRAINT "FK_5e17c017aa3f5164cb2da5b1c6b"`);
        await queryRunner.query(`ALTER TABLE "order_item" RENAME COLUMN "product_id" TO "shop_product_id"`);
        await queryRunner.query(`ALTER TABLE "order_item" ADD CONSTRAINT "FK_bc36f05ca940032df8b41cecb1e" FOREIGN KEY ("shop_product_id") REFERENCES "shop_product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_item" DROP CONSTRAINT "FK_bc36f05ca940032df8b41cecb1e"`);
        await queryRunner.query(`ALTER TABLE "order_item" RENAME COLUMN "shop_product_id" TO "product_id"`);
        await queryRunner.query(`ALTER TABLE "order_item" ADD CONSTRAINT "FK_5e17c017aa3f5164cb2da5b1c6b" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
