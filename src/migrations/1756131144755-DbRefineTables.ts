import { MigrationInterface, QueryRunner } from "typeorm";

export class DbRefineTables1756131144755 implements MigrationInterface {
    name = 'DbRefineTables1756131144755'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "shop_product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "price" character varying NOT NULL, "stock" integer NOT NULL DEFAULT '0', "discount" character varying, "is_available" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "store_id" uuid, "product_id" uuid, CONSTRAINT "PK_996a8daa7de87ae4e68ef98c9f1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "category" ADD "slug" character varying`);
        await queryRunner.query(`ALTER TABLE "category" ADD CONSTRAINT "UQ_cb73208f151aa71cdd78f662d70" UNIQUE ("slug")`);
        await queryRunner.query(`ALTER TABLE "category" ADD "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`CREATE TYPE "public"."category_status_enum" AS ENUM('pending', 'approved', 'rejected', 'admin')`);
        await queryRunner.query(`ALTER TABLE "category" ADD "status" "public"."category_status_enum" NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "category" ADD "added_by" uuid`);
        await queryRunner.query(`ALTER TABLE "products" ADD "slug" character varying`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "UQ_464f927ae360106b783ed0b4106" UNIQUE ("slug")`);
        await queryRunner.query(`CREATE TYPE "public"."products_status_enum" AS ENUM('pending', 'approved', 'rejected', 'admin')`);
        await queryRunner.query(`ALTER TABLE "products" ADD "status" "public"."products_status_enum" NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "products" ADD "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "products" ADD "added_by" uuid`);
        await queryRunner.query(`ALTER TABLE "shop_product" ADD CONSTRAINT "FK_94fd5efba67eab8cce852c90a4c" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shop_product" ADD CONSTRAINT "FK_1bdb70cace4d977ff9b852cfcbf" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "category" ADD CONSTRAINT "FK_0e52894bd29bf2e61cef73ecca5" FOREIGN KEY ("added_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_103cec6966ad062a779ec25536e" FOREIGN KEY ("added_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_103cec6966ad062a779ec25536e"`);
        await queryRunner.query(`ALTER TABLE "category" DROP CONSTRAINT "FK_0e52894bd29bf2e61cef73ecca5"`);
        await queryRunner.query(`ALTER TABLE "shop_product" DROP CONSTRAINT "FK_1bdb70cace4d977ff9b852cfcbf"`);
        await queryRunner.query(`ALTER TABLE "shop_product" DROP CONSTRAINT "FK_94fd5efba67eab8cce852c90a4c"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "added_by"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."products_status_enum"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "UQ_464f927ae360106b783ed0b4106"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "slug"`);
        await queryRunner.query(`ALTER TABLE "category" DROP COLUMN "added_by"`);
        await queryRunner.query(`ALTER TABLE "category" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."category_status_enum"`);
        await queryRunner.query(`ALTER TABLE "category" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "category" DROP CONSTRAINT "UQ_cb73208f151aa71cdd78f662d70"`);
        await queryRunner.query(`ALTER TABLE "category" DROP COLUMN "slug"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "price" character varying`);
        await queryRunner.query(`DROP TABLE "shop_product"`);
    }

}
