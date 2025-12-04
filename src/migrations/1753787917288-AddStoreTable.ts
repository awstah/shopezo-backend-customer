import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStoreTable1753787917288 implements MigrationInterface {
    name = 'AddStoreTable1753787917288'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "stores" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "store_name" character varying NOT NULL, "store_address" character varying NOT NULL, "store_logo" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "merchantId" uuid, CONSTRAINT "PK_7aa6e7d71fa7acdd7ca43d7c9cb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "stores" ADD CONSTRAINT "FK_3b5114b6a41f09542b155e02c8e" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stores" DROP CONSTRAINT "FK_3b5114b6a41f09542b155e02c8e"`);
        await queryRunner.query(`DROP TABLE "stores"`);
    }

}
