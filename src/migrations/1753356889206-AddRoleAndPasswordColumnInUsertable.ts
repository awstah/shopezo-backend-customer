import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoleAndPasswordColumnInUsertable1753356889206 implements MigrationInterface {
    name = 'AddRoleAndPasswordColumnInUsertable1753356889206'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "password" character varying(255) NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('CUSTOMER', 'ADMIN', 'MERCHANT', 'SHOPKEEPER', 'DRIVER')`);
        await queryRunner.query(`ALTER TABLE "user" ADD "role" "public"."user_role_enum" NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "password"`);
    }

}
