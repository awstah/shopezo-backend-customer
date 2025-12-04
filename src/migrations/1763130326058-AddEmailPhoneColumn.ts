import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmailPhoneColumn1763130326058 implements MigrationInterface {
    name = 'AddEmailPhoneColumn1763130326058'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "is_email_verified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "user" ADD "is_phone_verified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "temp_products" ALTER COLUMN "is_published" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "temp_products" ALTER COLUMN "is_published" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "is_phone_verified"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "is_email_verified"`);
    }

}
