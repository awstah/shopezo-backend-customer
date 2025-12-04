import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUploadJobTable1759931710692 implements MigrationInterface {
    name = 'AddUploadJobTable1759931710692'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."upload_job_status_enum" AS ENUM('pending', 'completed', 'failed')`);
        await queryRunner.query(`CREATE TABLE "upload_job" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "file_name" character varying NOT NULL, "total_csv_records" integer NOT NULL DEFAULT '0', "total_inserted" integer NOT NULL DEFAULT '0', "status" "public"."upload_job_status_enum" NOT NULL DEFAULT 'pending', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "completed_at" TIMESTAMP, "merchant_id" uuid, CONSTRAINT "PK_5d9d3a63b057c2d0a5632e0645a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "upload_job" ADD CONSTRAINT "FK_a402764b9f63bff2bdc0fe10cf7" FOREIGN KEY ("merchant_id") REFERENCES "merchant"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "upload_job" DROP CONSTRAINT "FK_a402764b9f63bff2bdc0fe10cf7"`);
        await queryRunner.query(`DROP TABLE "upload_job"`);
        await queryRunner.query(`DROP TYPE "public"."upload_job_status_enum"`);
    }

}
