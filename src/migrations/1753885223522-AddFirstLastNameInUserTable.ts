import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFirstLastNameInUserTable1753885223522 implements MigrationInterface {
    name = 'AddFirstLastNameInUserTable1753885223522'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "first_name" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "user" ADD "last_name" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "last_name"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "first_name"`);
    }

}
