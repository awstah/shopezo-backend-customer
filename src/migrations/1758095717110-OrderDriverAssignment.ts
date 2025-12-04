import { MigrationInterface, QueryRunner } from "typeorm";

export class OrderDriverAssignment1758095717110 implements MigrationInterface {
    name = 'OrderDriverAssignment1758095717110'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."order_driver_assignment_status_enum" AS ENUM('assigned', 'accepted', 'rejected', 'completed', 'shipped')`);
        await queryRunner.query(`CREATE TABLE "order_driver_assignment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."order_driver_assignment_status_enum" NOT NULL DEFAULT 'assigned', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "order_id" uuid, "driver_id" uuid, "assigned_by" uuid, CONSTRAINT "PK_ba201bd8e4878b5dcafb8a219fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TYPE "public"."order_order_status_enum" RENAME TO "order_order_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."order_order_status_enum" AS ENUM('cancel', 'pending', 'in-progress', 'out-for-delivery', 'order-receive', 'complete')`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "order_status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "order_status" TYPE "public"."order_order_status_enum" USING "order_status"::"text"::"public"."order_order_status_enum"`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "order_status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."order_order_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "order_driver_assignment" ADD CONSTRAINT "FK_7aae84cf0c6aa1adb5780843059" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_driver_assignment" ADD CONSTRAINT "FK_460bb87b9142a59fe6cb37e0c9a" FOREIGN KEY ("driver_id") REFERENCES "driver"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_driver_assignment" ADD CONSTRAINT "FK_29ea14c396751126d5a3747c2c9" FOREIGN KEY ("assigned_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_driver_assignment" DROP CONSTRAINT "FK_29ea14c396751126d5a3747c2c9"`);
        await queryRunner.query(`ALTER TABLE "order_driver_assignment" DROP CONSTRAINT "FK_460bb87b9142a59fe6cb37e0c9a"`);
        await queryRunner.query(`ALTER TABLE "order_driver_assignment" DROP CONSTRAINT "FK_7aae84cf0c6aa1adb5780843059"`);
        await queryRunner.query(`CREATE TYPE "public"."order_order_status_enum_old" AS ENUM('cancel', 'pending', 'in-progress', 'out-for-delivery', 'order-receive', 'complete', 'assigned')`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "order_status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "order_status" TYPE "public"."order_order_status_enum_old" USING "order_status"::"text"::"public"."order_order_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "order_status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."order_order_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."order_order_status_enum_old" RENAME TO "order_order_status_enum"`);
        await queryRunner.query(`DROP TABLE "order_driver_assignment"`);
        await queryRunner.query(`DROP TYPE "public"."order_driver_assignment_status_enum"`);
    }

}
