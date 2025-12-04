import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTempTable1757796595181 implements MigrationInterface {
    name = 'AddTempTable1757796595181'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temp_products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "barcode" character varying, "title" character varying, "category" character varying, "unit" character varying, "pakaging" character varying, "inventory_type" character varying, "added_for" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c3a4f80c99a4722660716a0750e" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "temp_products"`);
    }

}
