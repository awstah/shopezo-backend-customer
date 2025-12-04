import { MigrationInterface, QueryRunner } from "typeorm";

export class DriverInOrderTable1758042792672 implements MigrationInterface {
    name = 'DriverInOrderTable1758042792672'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" ADD "driver_id" uuid`);
        await queryRunner.query(`ALTER TYPE "public"."order_order_status_enum" RENAME TO "order_order_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."order_order_status_enum" AS ENUM('cancel', 'pending', 'in-progress', 'out-for-delivery', 'order-receive', 'complete', 'assigned')`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "order_status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "order_status" TYPE "public"."order_order_status_enum" USING "order_status"::"text"::"public"."order_order_status_enum"`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "order_status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."order_order_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_71e6299877e37f03f2a00527fff" FOREIGN KEY ("driver_id") REFERENCES "driver"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_71e6299877e37f03f2a00527fff"`);
        await queryRunner.query(`CREATE TYPE "public"."order_order_status_enum_old" AS ENUM('cancel', 'pending', 'in-progress', 'out-for-delivery', 'order-receive', 'complete')`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "order_status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "order_status" TYPE "public"."order_order_status_enum_old" USING "order_status"::"text"::"public"."order_order_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "order_status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."order_order_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."order_order_status_enum_old" RENAME TO "order_order_status_enum"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "driver_id"`);
    }

}
