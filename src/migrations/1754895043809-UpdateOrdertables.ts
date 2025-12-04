import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateOrdertables1754895043809 implements MigrationInterface {
    name = 'UpdateOrdertables1754895043809'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" RENAME COLUMN "is_deleted" TO "order_status"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "order_status"`);
        await queryRunner.query(`CREATE TYPE "public"."order_order_status_enum" AS ENUM('cancel', 'pending', 'in-progress', 'out-for-delivery', 'order-receive', 'complete')`);
        await queryRunner.query(`ALTER TABLE "order" ADD "order_status" "public"."order_order_status_enum" NOT NULL DEFAULT 'pending'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "order_status"`);
        await queryRunner.query(`DROP TYPE "public"."order_order_status_enum"`);
        await queryRunner.query(`ALTER TABLE "order" ADD "order_status" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "order" RENAME COLUMN "order_status" TO "is_deleted"`);
    }

}
