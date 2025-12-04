import { MigrationInterface, QueryRunner } from "typeorm";

export class AddParentUserInUserTable1753539223061 implements MigrationInterface {
    name = 'AddParentUserInUserTable1753539223061'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "parentUserId" uuid`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_875b4896d9516ba6225ff27bd20" FOREIGN KEY ("parentUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_875b4896d9516ba6225ff27bd20"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "parentUserId"`);
    }

}
