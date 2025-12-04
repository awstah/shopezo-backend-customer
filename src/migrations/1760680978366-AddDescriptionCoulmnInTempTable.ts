import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDescriptionCoulmnInTempTable1760680978366 implements MigrationInterface {
    name = 'AddDescriptionCoulmnInTempTable1760680978366'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "temp_products" ADD "description" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "temp_products" DROP COLUMN "description"`);
    }

}
