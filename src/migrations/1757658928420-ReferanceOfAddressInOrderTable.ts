import { MigrationInterface, QueryRunner } from "typeorm";

export class ReferanceOfAddressInOrderTable1757658928420 implements MigrationInterface {
    name = 'ReferanceOfAddressInOrderTable1757658928420'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" ADD "customer_address_id" uuid`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_efb22de9bf649b1a224074a8cc6" FOREIGN KEY ("customer_address_id") REFERENCES "customer_address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_efb22de9bf649b1a224074a8cc6"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "customer_address_id"`);
    }

}
