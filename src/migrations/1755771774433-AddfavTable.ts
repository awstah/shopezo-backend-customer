import { MigrationInterface, QueryRunner } from "typeorm";

export class AddfavTable1755771774433 implements MigrationInterface {
    name = 'AddfavTable1755771774433'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "favourites" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "is_fav" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, "product_id" uuid, "store_id" uuid, CONSTRAINT "PK_173e5d5cc35490bf1de2d2d3739" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "favourites" ADD CONSTRAINT "FK_ffb0866c42b7ff4d6e5131f3dcc" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favourites" ADD CONSTRAINT "FK_7cd439be4a0d7fe237eb2b78bff" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favourites" ADD CONSTRAINT "FK_9e03de29df3cde505db326df451" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "favourites" DROP CONSTRAINT "FK_9e03de29df3cde505db326df451"`);
        await queryRunner.query(`ALTER TABLE "favourites" DROP CONSTRAINT "FK_7cd439be4a0d7fe237eb2b78bff"`);
        await queryRunner.query(`ALTER TABLE "favourites" DROP CONSTRAINT "FK_ffb0866c42b7ff4d6e5131f3dcc"`);
        await queryRunner.query(`DROP TABLE "favourites"`);
    }

}
