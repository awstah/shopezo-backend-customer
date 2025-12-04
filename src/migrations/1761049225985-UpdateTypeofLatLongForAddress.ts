import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTypeofLatLongForAddress1761049225985 implements MigrationInterface {
    name = 'UpdateTypeofLatLongForAddress1761049225985'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer_address" DROP COLUMN "latitude"`);
        await queryRunner.query(`ALTER TABLE "customer_address" ADD "latitude" double precision`);
        await queryRunner.query(`ALTER TABLE "customer_address" DROP COLUMN "longitude"`);
        await queryRunner.query(`ALTER TABLE "customer_address" ADD "longitude" double precision`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer_address" DROP COLUMN "longitude"`);
        await queryRunner.query(`ALTER TABLE "customer_address" ADD "longitude" numeric(10,7)`);
        await queryRunner.query(`ALTER TABLE "customer_address" DROP COLUMN "latitude"`);
        await queryRunner.query(`ALTER TABLE "customer_address" ADD "latitude" numeric(10,7)`);
    }

}
