import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSupabaseUserIdInUserTable1753527483196 implements MigrationInterface {
    name = 'AddSupabaseUserIdInUserTable1753527483196'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "supabase_user_id" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "supabase_user_id"`);
    }

}
