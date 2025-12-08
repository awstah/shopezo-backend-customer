import { MigrationInterface, QueryRunner } from "typeorm";

export class AddComplaintsTable1765201996008 implements MigrationInterface {
    name = 'AddComplaintsTable1765201996008'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."complaint_status_enum" AS ENUM('open', 'in_review', 'resolved', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "complaint" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "subject" character varying(150) NOT NULL, "description" text NOT NULL, "status" "public"."complaint_status_enum" NOT NULL DEFAULT 'open', "admin_note" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "customer_id" uuid, "user_id" uuid, "order_id" uuid, "merchant_id" uuid, CONSTRAINT "PK_a9c8dbc2ab4988edcc2ff0a7337" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "complaint" ADD CONSTRAINT "FK_fc082348156ff3fc4ae28e0209e" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "complaint" ADD CONSTRAINT "FK_1ab3e07eb3ce33129dfb6d6af83" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "complaint" ADD CONSTRAINT "FK_8e8d270d52e1beb2acdb117af20" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "complaint" ADD CONSTRAINT "FK_f3a97e173f145e8ad8bc019c8ff" FOREIGN KEY ("merchant_id") REFERENCES "merchant"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "complaint" DROP CONSTRAINT "FK_f3a97e173f145e8ad8bc019c8ff"`);
        await queryRunner.query(`ALTER TABLE "complaint" DROP CONSTRAINT "FK_8e8d270d52e1beb2acdb117af20"`);
        await queryRunner.query(`ALTER TABLE "complaint" DROP CONSTRAINT "FK_1ab3e07eb3ce33129dfb6d6af83"`);
        await queryRunner.query(`ALTER TABLE "complaint" DROP CONSTRAINT "FK_fc082348156ff3fc4ae28e0209e"`);
        await queryRunner.query(`DROP TABLE "complaint"`);
        await queryRunner.query(`DROP TYPE "public"."complaint_status_enum"`);
    }

}
