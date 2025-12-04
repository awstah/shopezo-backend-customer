import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDriverDetailsTableWithUserRelation1753674279041 implements MigrationInterface {
    name = 'AddDriverDetailsTableWithUserRelation1753674279041'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_875b4896d9516ba6225ff27bd20"`);
        await queryRunner.query(`CREATE TYPE "public"."driver_current_status_enum" AS ENUM('active', 'inactive')`);
        await queryRunner.query(`CREATE TABLE "driver" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "address_1" character varying(255) NOT NULL, "address_2" character varying(255), "country" character varying(255) NOT NULL, "state" character varying(255) NOT NULL, "city" character varying(255) NOT NULL, "vehicle_type" character varying(255) NOT NULL, "license_number" character varying(255) NOT NULL, "current_status" "public"."driver_current_status_enum" NOT NULL DEFAULT 'inactive', "current_location" character varying(255), "user_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_732fa4b746b5fd36d24e72576e" UNIQUE ("user_id"), CONSTRAINT "PK_61de71a8d217d585ecd5ee3d065" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "parentUserId"`);
        await queryRunner.query(`ALTER TABLE "driver" ADD CONSTRAINT "FK_732fa4b746b5fd36d24e72576e7" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "driver" DROP CONSTRAINT "FK_732fa4b746b5fd36d24e72576e7"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "parentUserId" uuid`);
        await queryRunner.query(`DROP TABLE "driver"`);
        await queryRunner.query(`DROP TYPE "public"."driver_current_status_enum"`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_875b4896d9516ba6225ff27bd20" FOREIGN KEY ("parentUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
