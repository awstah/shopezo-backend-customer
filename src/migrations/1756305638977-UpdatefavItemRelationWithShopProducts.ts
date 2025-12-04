import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatefavItemRelationWithShopProducts1756305638977 implements MigrationInterface {
    name = 'UpdatefavItemRelationWithShopProducts1756305638977'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "favourites" DROP CONSTRAINT "FK_7cd439be4a0d7fe237eb2b78bff"`);
        await queryRunner.query(`ALTER TABLE "favourites" RENAME COLUMN "product_id" TO "shop_product_id"`);
        await queryRunner.query(`ALTER TABLE "favourites" ADD CONSTRAINT "FK_f0193e5b279019dab35619a708d" FOREIGN KEY ("shop_product_id") REFERENCES "shop_product"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "favourites" DROP CONSTRAINT "FK_f0193e5b279019dab35619a708d"`);
        await queryRunner.query(`ALTER TABLE "favourites" RENAME COLUMN "shop_product_id" TO "product_id"`);
        await queryRunner.query(`ALTER TABLE "favourites" ADD CONSTRAINT "FK_7cd439be4a0d7fe237eb2b78bff" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
