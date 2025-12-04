import { MigrationInterface, QueryRunner } from "typeorm";

export class Updatepackagefield1760991681378 implements MigrationInterface {
    name = 'Updatepackagefield1760991681378'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "temp_products" RENAME COLUMN "pakaging" TO "packaging"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "temp_products" RENAME COLUMN "packaging" TO "pakaging"`);
    }

}
