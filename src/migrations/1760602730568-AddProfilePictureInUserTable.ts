import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProfilePictureInUserTable1760602730568 implements MigrationInterface {
    name = 'AddProfilePictureInUserTable1760602730568'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "profile_picture_url" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "profile_picture_url"`);
    }

}
