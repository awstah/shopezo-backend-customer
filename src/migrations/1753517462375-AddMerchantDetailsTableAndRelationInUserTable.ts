import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMerchantDetailsTableAndRelationInUserTable1753517462375 implements MigrationInterface {
    name = 'AddMerchantDetailsTableAndRelationInUserTable1753517462375'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "merchant" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "address_1" character varying(255) NOT NULL, "address_2" character varying(255), "country" character varying(255) NOT NULL, "state" character varying(255) NOT NULL, "city" character varying(255) NOT NULL, "businessname" character varying(255) NOT NULL, "user_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_8f6d566c4af17752c436870dc7" UNIQUE ("user_id"), CONSTRAINT "PK_9a3850e0537d869734fc9bff5d6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "merchant" ADD CONSTRAINT "FK_8f6d566c4af17752c436870dc7f" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "merchant" DROP CONSTRAINT "FK_8f6d566c4af17752c436870dc7f"`);
        await queryRunner.query(`DROP TABLE "merchant"`);
    }

}
