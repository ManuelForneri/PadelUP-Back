import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1772030893995 implements MigrationInterface {
    name = 'AutoMigration1772030893995'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_court_side_enum" AS ENUM('DRIVE', 'BACKHAND')`);
        await queryRunner.query(`CREATE TYPE "public"."users_dominant_hand_enum" AS ENUM('RIGHT', 'LEFT')`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('PLAYER', 'ADMIN')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" character varying NOT NULL, "email" character varying NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "category_id" uuid, "court_side" "public"."users_court_side_enum", "dominant_hand" "public"."users_dominant_hand_enum", "role" "public"."users_role_enum" NOT NULL DEFAULT 'PLAYER', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_dominant_hand_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_court_side_enum"`);
    }

}
