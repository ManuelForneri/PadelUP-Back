import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1772114405562 implements MigrationInterface {
    name = 'AutoMigration1772114405562'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "last_name" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "last_name" SET NOT NULL`);
    }

}
