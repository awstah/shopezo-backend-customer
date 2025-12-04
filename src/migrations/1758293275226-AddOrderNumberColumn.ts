import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderNumberColumn1758293275226 implements MigrationInterface {
    name = 'AddOrderNumberColumn1758293275226'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" ADD "order_number" BIGSERIAL`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "UQ_f9180f384353c621e8d0c414c14" UNIQUE ("order_number")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "UQ_f9180f384353c621e8d0c414c14"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "order_number"`);
    }

}
