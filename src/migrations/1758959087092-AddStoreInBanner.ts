import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStoreInBanner1758959087092 implements MigrationInterface {
    name = 'AddStoreInBanner1758959087092'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "banners" ADD "store_id" uuid`);
        await queryRunner.query(`ALTER TABLE "banners" ADD CONSTRAINT "FK_43a2ec64f37cdeb44a1b7f345e1" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "banners" DROP CONSTRAINT "FK_43a2ec64f37cdeb44a1b7f345e1"`);
        await queryRunner.query(`ALTER TABLE "banners" DROP COLUMN "store_id"`);
    }

}
