import { MigrationInterface, QueryRunner } from "typeorm";

export class VerifiedCoulmnInUser1755151750466 implements MigrationInterface {
    name = 'VerifiedCoulmnInUser1755151750466'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "is_verified" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "is_verified"`);
    }

}
