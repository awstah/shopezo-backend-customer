import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDuplicateTable1759577192830 implements MigrationInterface {
    name = 'AddDuplicateTable1759577192830'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product_duplicates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "temp_product_id" uuid, "product_id" uuid, CONSTRAINT "PK_cd18961534c6646cbe8cb4a7ab1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "temp_products" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "temp_products" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "temp_products" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "temp_products" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "temp_products" ADD "product_id" uuid`);
        await queryRunner.query(`ALTER TABLE "temp_products" ADD CONSTRAINT "FK_2c0e6a374f8fc10ec7350c50451" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_duplicates" ADD CONSTRAINT "FK_7e4eb8d37af2e945660939fd4b3" FOREIGN KEY ("temp_product_id") REFERENCES "temp_products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_duplicates" ADD CONSTRAINT "FK_c841c801aba938c5fad0741c9ca" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_duplicates" DROP CONSTRAINT "FK_c841c801aba938c5fad0741c9ca"`);
        await queryRunner.query(`ALTER TABLE "product_duplicates" DROP CONSTRAINT "FK_7e4eb8d37af2e945660939fd4b3"`);
        await queryRunner.query(`ALTER TABLE "temp_products" DROP CONSTRAINT "FK_2c0e6a374f8fc10ec7350c50451"`);
        await queryRunner.query(`ALTER TABLE "temp_products" DROP COLUMN "product_id"`);
        await queryRunner.query(`ALTER TABLE "temp_products" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "temp_products" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "temp_products" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "temp_products" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`DROP TABLE "product_duplicates"`);
    }

}
