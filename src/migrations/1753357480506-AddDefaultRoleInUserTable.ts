import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDefaultRoleInUserTable1753357480506 implements MigrationInterface {
    name = 'AddDefaultRoleInUserTable1753357480506'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'CUSTOMER'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT`);
    }

}
