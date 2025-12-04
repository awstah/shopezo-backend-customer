import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateAddressTable1757597066704 implements MigrationInterface {
    name = 'UpdateAddressTable1757597066704'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer_address" ADD "is_active" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "customer_address" ADD "is_deleted" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer_address" DROP COLUMN "is_deleted"`);
        await queryRunner.query(`ALTER TABLE "customer_address" DROP COLUMN "is_active"`);
    }

}
