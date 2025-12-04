import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFileNameInDuplicates1761734882304 implements MigrationInterface {
    name = 'AddFileNameInDuplicates1761734882304'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_duplicates" ADD "file_name" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_duplicates" DROP COLUMN "file_name"`);
    }

}
