import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1772669241794 implements MigrationInterface {
    name = 'AutoMigration1772669241794'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."tournaments_status_enum" AS ENUM('UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "tournaments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "start_date" date NOT NULL, "end_date" date NOT NULL, "status" "public"."tournaments_status_enum" NOT NULL DEFAULT 'UPCOMING', "flyer" character varying, "price" numeric(10,2) NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6d5d129da7a80cf99e8ad4833a9" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "tournaments"`);
        await queryRunner.query(`DROP TYPE "public"."tournaments_status_enum"`);
    }

}
