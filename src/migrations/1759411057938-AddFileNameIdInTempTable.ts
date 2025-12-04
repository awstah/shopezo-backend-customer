import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFileNameIdInTempTable1759411057938 implements MigrationInterface {
    name = 'AddFileNameIdInTempTable1759411057938'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "temp_products" ADD "file_name" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "temp_products" DROP COLUMN "file_name"`);
    }

}
