import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLocationInStores1760994057069 implements MigrationInterface {
    name = 'AddLocationInStores1760994057069'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stores" ADD "latitude" numeric(10,7)`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "longitude" numeric(10,7)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "longitude"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "latitude"`);
    }

}
