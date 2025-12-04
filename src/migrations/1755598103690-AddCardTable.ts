import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCardTable1755598103690 implements MigrationInterface {
    name = 'AddCardTable1755598103690'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_9a5f6868c96e0069e699f33e124"`);
        await queryRunner.query(`CREATE TABLE "user_payment_method" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "card_holder_name" character varying NOT NULL, "card_number" character varying NOT NULL, "card_brand" character varying NOT NULL, "expiry_month" character varying NOT NULL, "expiry_year" character varying NOT NULL, "cvv" character varying NOT NULL, "is_deleted" boolean NOT NULL DEFAULT false, "is_default" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_7bc6324e8d41c2f3bd69c1d905f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_9a5f6868c96e0069e699f33e124" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_payment_method" ADD CONSTRAINT "FK_00c9609864e185adce0a39ad5fd" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_payment_method" DROP CONSTRAINT "FK_00c9609864e185adce0a39ad5fd"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_9a5f6868c96e0069e699f33e124"`);
        await queryRunner.query(`DROP TABLE "user_payment_method"`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_9a5f6868c96e0069e699f33e124" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
