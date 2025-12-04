import { MigrationInterface, QueryRunner } from "typeorm";

export class SetReferanceInStoreOfDriver1758208236467 implements MigrationInterface {
    name = 'SetReferanceInStoreOfDriver1758208236467'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."order_driver_assignment_status_enum" RENAME TO "order_driver_assignment_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."order_driver_assignment_status_enum" AS ENUM('accepted', 'assigned', 'rejected', 'picked')`);
        await queryRunner.query(`ALTER TABLE "order_driver_assignment" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "order_driver_assignment" ALTER COLUMN "status" TYPE "public"."order_driver_assignment_status_enum" USING "status"::"text"::"public"."order_driver_assignment_status_enum"`);
        await queryRunner.query(`ALTER TABLE "order_driver_assignment" ALTER COLUMN "status" SET DEFAULT 'assigned'`);
        await queryRunner.query(`DROP TYPE "public"."order_driver_assignment_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."order_driver_assignment_status_enum_old" AS ENUM('assigned', 'accepted', 'rejected', 'completed', 'shipped')`);
        await queryRunner.query(`ALTER TABLE "order_driver_assignment" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "order_driver_assignment" ALTER COLUMN "status" TYPE "public"."order_driver_assignment_status_enum_old" USING "status"::"text"::"public"."order_driver_assignment_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "order_driver_assignment" ALTER COLUMN "status" SET DEFAULT 'assigned'`);
        await queryRunner.query(`DROP TYPE "public"."order_driver_assignment_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."order_driver_assignment_status_enum_old" RENAME TO "order_driver_assignment_status_enum"`);
    }

}
