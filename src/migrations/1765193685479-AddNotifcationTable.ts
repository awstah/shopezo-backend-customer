import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNotifcationTable1765193685479 implements MigrationInterface {
    name = 'AddNotifcationTable1765193685479'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_customer_stripe_customer_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_user_payment_method_stripe_payment_method_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_user_payment_method_stripe_customer_id"`);
        await queryRunner.query(`CREATE TYPE "public"."notification_type_enum" AS ENUM('ORDER_PLACED', 'DRIVER_ASSIGNED', 'ORDER_STATUS', 'DRIVER_STATUS')`);
        await queryRunner.query(`CREATE TABLE "notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."notification_type_enum" NOT NULL, "title" character varying(180) NOT NULL, "message" text NOT NULL, "is_read" boolean NOT NULL DEFAULT false, "metadata" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "order_id" uuid, CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "stripe_customer_id"`);
        await queryRunner.query(`ALTER TABLE "user_payment_method" DROP COLUMN "stripe_payment_method_id"`);
        await queryRunner.query(`ALTER TABLE "user_payment_method" DROP COLUMN "stripe_customer_id"`);
        await queryRunner.query(`ALTER TABLE "user_payment_method" DROP COLUMN "card_last4"`);
        await queryRunner.query(`ALTER TABLE "user_payment_method" ALTER COLUMN "card_number" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_payment_method" ALTER COLUMN "cvv" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_928b7aa1754e08e1ed7052cb9d8" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_3ea5cd8a1de9cbf90c86dd0582c" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_3ea5cd8a1de9cbf90c86dd0582c"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_928b7aa1754e08e1ed7052cb9d8"`);
        await queryRunner.query(`ALTER TABLE "user_payment_method" ALTER COLUMN "cvv" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_payment_method" ALTER COLUMN "card_number" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_payment_method" ADD "card_last4" character varying(4)`);
        await queryRunner.query(`ALTER TABLE "user_payment_method" ADD "stripe_customer_id" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "user_payment_method" ADD "stripe_payment_method_id" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "customer" ADD "stripe_customer_id" character varying(255)`);
        await queryRunner.query(`DROP TABLE "notification"`);
        await queryRunner.query(`DROP TYPE "public"."notification_type_enum"`);
        await queryRunner.query(`CREATE INDEX "IDX_user_payment_method_stripe_customer_id" ON "user_payment_method" ("stripe_customer_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_user_payment_method_stripe_payment_method_id" ON "user_payment_method" ("stripe_payment_method_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_customer_stripe_customer_id" ON "customer" ("stripe_customer_id") `);
    }

}
