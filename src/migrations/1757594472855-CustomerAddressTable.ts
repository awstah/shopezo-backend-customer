import { MigrationInterface, QueryRunner } from "typeorm";

export class CustomerAddressTable1757594472855 implements MigrationInterface {
    name = 'CustomerAddressTable1757594472855'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "customer_address" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "address_line" character varying(255) NOT NULL, "city" character varying(255) NOT NULL, "state" character varying(255) NOT NULL, "country" character varying(255) NOT NULL, "postal_code" character varying(20), "latitude" numeric(10,7), "longitude" numeric(10,7), "label" character varying(50), "is_primary" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "customer_id" uuid, CONSTRAINT "PK_23810fb397050d8ac37dae44ff6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "customer_address" ADD CONSTRAINT "FK_1f5ed21a5f3390cdbafb6f22452" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer_address" DROP CONSTRAINT "FK_1f5ed21a5f3390cdbafb6f22452"`);
        await queryRunner.query(`DROP TABLE "customer_address"`);
    }

}
