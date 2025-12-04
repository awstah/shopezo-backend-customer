import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateBannerTable1755504246786 implements MigrationInterface {
    name = 'UpdateBannerTable1755504246786'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "banners" ALTER COLUMN "title" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "banners" ALTER COLUMN "image" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "banners" ALTER COLUMN "image" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "banners" ALTER COLUMN "title" SET NOT NULL`);
    }

}
