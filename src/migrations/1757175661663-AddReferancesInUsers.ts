import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReferancesInUsers1757175661663 implements MigrationInterface {
    name = 'AddReferancesInUsers1757175661663'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shop_product" ADD "added_by" uuid`);
        await queryRunner.query(`ALTER TABLE "driver" ADD "merchant_id" uuid`);
        await queryRunner.query(`ALTER TABLE "driver" ADD "store_id" uuid`);
        await queryRunner.query(`ALTER TABLE "shopkepper" ADD "merchant_id" uuid`);
        await queryRunner.query(`ALTER TABLE "shopkepper" ADD "store_id" uuid`);
        await queryRunner.query(`ALTER TABLE "shop_product" ADD CONSTRAINT "FK_1a4ac5793fadceeca264d8d6b23" FOREIGN KEY ("added_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "driver" ADD CONSTRAINT "FK_64dd16da27176fd1f761f268fc7" FOREIGN KEY ("merchant_id") REFERENCES "merchant"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "driver" ADD CONSTRAINT "FK_f36cc24b5242db34f5b2c0277dc" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shopkepper" ADD CONSTRAINT "FK_8849e4bcd4024713b2dc73e4ea6" FOREIGN KEY ("merchant_id") REFERENCES "merchant"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shopkepper" ADD CONSTRAINT "FK_1ce1cbd57acbf9614d4882f92de" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shopkepper" DROP CONSTRAINT "FK_1ce1cbd57acbf9614d4882f92de"`);
        await queryRunner.query(`ALTER TABLE "shopkepper" DROP CONSTRAINT "FK_8849e4bcd4024713b2dc73e4ea6"`);
        await queryRunner.query(`ALTER TABLE "driver" DROP CONSTRAINT "FK_f36cc24b5242db34f5b2c0277dc"`);
        await queryRunner.query(`ALTER TABLE "driver" DROP CONSTRAINT "FK_64dd16da27176fd1f761f268fc7"`);
        await queryRunner.query(`ALTER TABLE "shop_product" DROP CONSTRAINT "FK_1a4ac5793fadceeca264d8d6b23"`);
        await queryRunner.query(`ALTER TABLE "shopkepper" DROP COLUMN "store_id"`);
        await queryRunner.query(`ALTER TABLE "shopkepper" DROP COLUMN "merchant_id"`);
        await queryRunner.query(`ALTER TABLE "driver" DROP COLUMN "store_id"`);
        await queryRunner.query(`ALTER TABLE "driver" DROP COLUMN "merchant_id"`);
        await queryRunner.query(`ALTER TABLE "shop_product" DROP COLUMN "added_by"`);
    }

}
