import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCreateUpdateCoulmnInCartCartItemTables1754478610909 implements MigrationInterface {
    name = 'AddCreateUpdateCoulmnInCartCartItemTables1754478610909'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cart_item" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "cart_item" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "cart" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "cart" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cart" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "cart" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "cart_item" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "cart_item" DROP COLUMN "created_at"`);
    }

}
