import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDriverAvailabilityStatus1758457303812 implements MigrationInterface {
    name = 'AddDriverAvailabilityStatus1758457303812'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."driver_driver_status_enum" AS ENUM('busy', 'free')`);
        await queryRunner.query(`ALTER TABLE "driver" ADD "driver_status" "public"."driver_driver_status_enum" NOT NULL DEFAULT 'free'`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "order_number" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "order_number" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "driver" DROP COLUMN "driver_status"`);
        await queryRunner.query(`DROP TYPE "public"."driver_driver_status_enum"`);
    }

}
