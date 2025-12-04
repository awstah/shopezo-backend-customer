import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAmountColumnsInOrderTables1757663339490 implements MigrationInterface {
    name = 'AddAmountColumnsInOrderTables1757663339490'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_item" ADD "total_amount" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "order_item" ADD "discounted_amount" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "order_item" ADD "payable_amount" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "order" ADD "total_discounted_amount" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "order" ADD "total_payable_amount" numeric(10,2) NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "total_payable_amount"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "total_discounted_amount"`);
        await queryRunner.query(`ALTER TABLE "order_item" DROP COLUMN "payable_amount"`);
        await queryRunner.query(`ALTER TABLE "order_item" DROP COLUMN "discounted_amount"`);
        await queryRunner.query(`ALTER TABLE "order_item" DROP COLUMN "total_amount"`);
    }

}
