import { MigrationInterface, QueryRunner } from "typeorm";

export class AddShopkeeperDetailsTableWithUserRelation1753676935304 implements MigrationInterface {
    name = 'AddShopkeeperDetailsTableWithUserRelation1753676935304'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "shopkepper" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "address_1" character varying(255) NOT NULL, "address_2" character varying(255), "country" character varying(255) NOT NULL, "state" character varying(255) NOT NULL, "city" character varying(255) NOT NULL, "user_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_9e033a1f74192a5868dba9daac" UNIQUE ("user_id"), CONSTRAINT "PK_cbee67b1f3c5e72b132d0ae3217" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "shopkepper" ADD CONSTRAINT "FK_9e033a1f74192a5868dba9daac4" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shopkepper" DROP CONSTRAINT "FK_9e033a1f74192a5868dba9daac4"`);
        await queryRunner.query(`DROP TABLE "shopkepper"`);
    }

}
