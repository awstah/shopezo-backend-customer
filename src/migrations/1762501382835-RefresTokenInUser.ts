import { MigrationInterface, QueryRunner } from "typeorm";

export class RefresTokenInUser1762501382835 implements MigrationInterface {
    name = 'RefresTokenInUser1762501382835'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "temp_products" DROP COLUMN "is_published"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "hashed_refresh_token" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "hashed_refresh_token"`);
        await queryRunner.query(`ALTER TABLE "temp_products" ADD "is_published" boolean NOT NULL DEFAULT false`);
    }

}
