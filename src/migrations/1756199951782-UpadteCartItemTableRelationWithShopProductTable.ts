import { MigrationInterface, QueryRunner } from "typeorm";

export class UpadteCartItemTableRelationWithShopProductTable1756199951782 implements MigrationInterface {
    name = 'UpadteCartItemTableRelationWithShopProductTable1756199951782'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cart_item" DROP CONSTRAINT "FK_67a2e8406e01ffa24ff9026944e"`);
        await queryRunner.query(`ALTER TABLE "cart_item" RENAME COLUMN "product_id" TO "shop_product_id"`);
        await queryRunner.query(`ALTER TABLE "cart_item" ADD CONSTRAINT "FK_adb25df42a8bc7fb21494d3a3d5" FOREIGN KEY ("shop_product_id") REFERENCES "shop_product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cart_item" DROP CONSTRAINT "FK_adb25df42a8bc7fb21494d3a3d5"`);
        await queryRunner.query(`ALTER TABLE "cart_item" RENAME COLUMN "shop_product_id" TO "product_id"`);
        await queryRunner.query(`ALTER TABLE "cart_item" ADD CONSTRAINT "FK_67a2e8406e01ffa24ff9026944e" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
