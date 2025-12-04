import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateOrderStatus1760785194583 implements MigrationInterface {
    name = 'UpdateOrderStatus1760785194583'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."order_order_status_enum" RENAME TO "order_order_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."order_order_status_enum" AS ENUM('cancel', 'pending', 'in-progress', 'out-for-delivery', 'order-receive', 'complete', 'accepted', 'assigned')`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "order_status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "order_status" TYPE "public"."order_order_status_enum" USING "order_status"::"text"::"public"."order_order_status_enum"`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "order_status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."order_order_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."order_order_status_enum_old" AS ENUM('cancel', 'pending', 'in-progress', 'out-for-delivery', 'order-receive', 'complete')`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "order_status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "order_status" TYPE "public"."order_order_status_enum_old" USING "order_status"::"text"::"public"."order_order_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "order_status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."order_order_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."order_order_status_enum_old" RENAME TO "order_order_status_enum"`);
    }

}
