import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReviewsColumnInShopProduct1757115014523 implements MigrationInterface {
    name = 'AddReviewsColumnInShopProduct1757115014523'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shop_product" ADD "reviews" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shop_product" DROP COLUMN "reviews"`);
    }

}
