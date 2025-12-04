import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImageAndLocationInOrder1760714509707 implements MigrationInterface {
    name = 'AddImageAndLocationInOrder1760714509707'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" ADD "delivery_image" character varying`);
        await queryRunner.query(`ALTER TABLE "order" ADD "geo_location" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "geo_location"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "delivery_image"`);
    }

}
