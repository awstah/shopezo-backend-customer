import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImageColumnInComplaints1765227367656 implements MigrationInterface {
    name = 'AddImageColumnInComplaints1765227367656'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "complaint" ADD "image_url" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "complaint" DROP COLUMN "image_url"`);
    }

}
