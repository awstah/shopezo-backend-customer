import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedIsPublishedColumnInTempProducts1762377109666 implements MigrationInterface {
    name = 'AddedIsPublishedColumnInTempProducts1762377109666'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "temp_products" ADD "is_published" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "temp_products" DROP COLUMN "is_published"`);
    }

}
