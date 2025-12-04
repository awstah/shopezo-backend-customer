import { MigrationInterface, QueryRunner } from "typeorm";

export class SetUserRelationInStores1753792896714 implements MigrationInterface {
    name = 'SetUserRelationInStores1753792896714'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stores" DROP CONSTRAINT "FK_3b5114b6a41f09542b155e02c8e"`);
        await queryRunner.query(`ALTER TABLE "stores" RENAME COLUMN "merchantId" TO "user_id"`);
        await queryRunner.query(`ALTER TABLE "stores" ADD CONSTRAINT "FK_29f39971656b4bf7832b7476d10" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stores" DROP CONSTRAINT "FK_29f39971656b4bf7832b7476d10"`);
        await queryRunner.query(`ALTER TABLE "stores" RENAME COLUMN "user_id" TO "merchantId"`);
        await queryRunner.query(`ALTER TABLE "stores" ADD CONSTRAINT "FK_3b5114b6a41f09542b155e02c8e" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
