import { MigrationInterface, QueryRunner } from "typeorm";

export class SetStart100000ForOrderNumber1758294043885 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER SEQUENCE "order_order_number_seq" RESTART WITH 100000
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER SEQUENCE "order_order_number_seq" RESTART WITH 1
        `);
    }

}
