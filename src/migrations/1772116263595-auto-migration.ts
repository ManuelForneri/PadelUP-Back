import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1772116263595 implements MigrationInterface {
    name = 'AutoMigration1772116263595'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."users_category_enum" RENAME TO "users_category_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."users_category_enum" AS ENUM('PRIMERA', 'SEGUNDA', 'TERCERA', 'CUARTA', 'QUINTA', 'SEXTA', 'SEPTIMA', 'OCTAVA')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "category" TYPE "public"."users_category_enum" USING "category"::"text"::"public"."users_category_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_category_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_category_enum_old" AS ENUM('PRIMERA', 'SEGUNDA', 'TERCERA')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "category" TYPE "public"."users_category_enum_old" USING "category"::"text"::"public"."users_category_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."users_category_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."users_category_enum_old" RENAME TO "users_category_enum"`);
    }

}
