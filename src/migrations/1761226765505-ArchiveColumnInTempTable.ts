import { MigrationInterface, QueryRunner } from "typeorm";

export class ArchiveColumnInTempTable1761226765505 implements MigrationInterface {
    name = 'ArchiveColumnInTempTable1761226765505'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "temp_products" ADD "is_archive" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "temp_products" DROP COLUMN "is_archive"`);
    }

}
