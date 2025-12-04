import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTypeOfLatLong1761049083254 implements MigrationInterface {
    name = 'UpdateTypeOfLatLong1761049083254'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "latitude"`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "latitude" double precision`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "longitude"`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "longitude" double precision`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "longitude"`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "longitude" numeric(10,7)`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "latitude"`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "latitude" numeric(10,7)`);
    }

}
