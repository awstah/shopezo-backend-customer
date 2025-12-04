import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReferanceInDriverAndStore1757321151186 implements MigrationInterface {
    name = 'AddReferanceInDriverAndStore1757321151186'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "driver" ADD "shopkeeper_id" uuid`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "merchant_id" uuid`);
        await queryRunner.query(`ALTER TABLE "driver" ADD CONSTRAINT "FK_0253b5e3050d6941f7e20fca180" FOREIGN KEY ("shopkeeper_id") REFERENCES "shopkepper"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stores" ADD CONSTRAINT "FK_882687fd3a8a29fa5bf13858a5b" FOREIGN KEY ("merchant_id") REFERENCES "merchant"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stores" DROP CONSTRAINT "FK_882687fd3a8a29fa5bf13858a5b"`);
        await queryRunner.query(`ALTER TABLE "driver" DROP CONSTRAINT "FK_0253b5e3050d6941f7e20fca180"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "merchant_id"`);
        await queryRunner.query(`ALTER TABLE "driver" DROP COLUMN "shopkeeper_id"`);
    }

}
