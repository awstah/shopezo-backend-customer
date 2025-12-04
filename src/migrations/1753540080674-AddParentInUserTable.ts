import { MigrationInterface, QueryRunner } from "typeorm";

export class AddParentInUserTable1753540080674 implements MigrationInterface {
    name = 'AddParentInUserTable1753540080674'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "parent_user_id" uuid`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_bc6d7a9da372154fdd56686f03a" FOREIGN KEY ("parent_user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_bc6d7a9da372154fdd56686f03a"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "parent_user_id"`);
    }

}
