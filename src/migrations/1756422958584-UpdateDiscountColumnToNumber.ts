import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDiscountColumnToNumber1756422958584 implements MigrationInterface {
    name = 'UpdateDiscountColumnToNumber1756422958584'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."products_search_idx"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "search_tsv"`);
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`, ["GENERATED_COLUMN","search_tsv","postgres","public","products"]);
        await queryRunner.query(`ALTER TABLE "shop_product" DROP COLUMN "discount"`);
        await queryRunner.query(`ALTER TABLE "shop_product" ADD "discount" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shop_product" DROP COLUMN "discount"`);
        await queryRunner.query(`ALTER TABLE "shop_product" ADD "discount" character varying`);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`, ["postgres","public","products","GENERATED_COLUMN","search_tsv",""]);
        await queryRunner.query(`ALTER TABLE "products" ADD "search_tsv" tsvector`);
        await queryRunner.query(`CREATE INDEX "products_search_idx" ON "products" ("search_tsv") `);
    }

}
