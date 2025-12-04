import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveAddressColumnFromCustomerDetailsTable1757616621470 implements MigrationInterface {
    name = 'RemoveAddressColumnFromCustomerDetailsTable1757616621470'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "address_1"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "address_2"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "country"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "state"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "city"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer" ADD "city" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "customer" ADD "state" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "customer" ADD "country" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "customer" ADD "address_2" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "customer" ADD "address_1" character varying(255) NOT NULL`);
    }

}
