import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCardTable1755598667350 implements MigrationInterface {
    name = 'UpdateCardTable1755598667350'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_payment_method" DROP CONSTRAINT "FK_00c9609864e185adce0a39ad5fd"`);
        await queryRunner.query(`ALTER TABLE "user_payment_method" RENAME COLUMN "userId" TO "user_id"`);
        await queryRunner.query(`ALTER TABLE "user_payment_method" ADD CONSTRAINT "FK_410a5c63b418406480c3fd3c7d6" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_payment_method" DROP CONSTRAINT "FK_410a5c63b418406480c3fd3c7d6"`);
        await queryRunner.query(`ALTER TABLE "user_payment_method" RENAME COLUMN "user_id" TO "userId"`);
        await queryRunner.query(`ALTER TABLE "user_payment_method" ADD CONSTRAINT "FK_00c9609864e185adce0a39ad5fd" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
