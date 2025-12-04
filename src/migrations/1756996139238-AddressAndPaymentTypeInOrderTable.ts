import { MigrationInterface, QueryRunner } from "typeorm";

export class AddressAndPaymentTypeInOrderTable1756996139238 implements MigrationInterface {
    name = 'AddressAndPaymentTypeInOrderTable1756996139238'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" ADD "address" character varying`);
        await queryRunner.query(`CREATE TYPE "public"."order_payment_type_enum" AS ENUM('online', 'cash-on-delivery', 'stripe')`);
        await queryRunner.query(`ALTER TABLE "order" ADD "payment_type" "public"."order_payment_type_enum" DEFAULT 'cash-on-delivery'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "payment_type"`);
        await queryRunner.query(`DROP TYPE "public"."order_payment_type_enum"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "address"`);
    }

}
