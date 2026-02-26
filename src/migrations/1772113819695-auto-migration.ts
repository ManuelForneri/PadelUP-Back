import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutoMigration1772113819695 implements MigrationInterface {
  name = 'AutoMigration1772113819695';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Limpiamos usuarios del schema anterior (template Pokémon) que no tienen google_id
    await queryRunner.query(`TRUNCATE TABLE "users" RESTART IDENTITY CASCADE`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "category_id"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_active"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "photo" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "google_id" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_0bd5012aeb82628e07f6a1be53b" UNIQUE ("google_id")`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_status_enum" AS ENUM('PENDING', 'ACTIVE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "status" "public"."users_status_enum" NOT NULL DEFAULT 'PENDING'`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_category_enum" AS ENUM('PRIMERA', 'SEGUNDA', 'TERCERA')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "category" "public"."users_category_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "birth_date" date`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "phone" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "points" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "profile_completed" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."users_court_side_enum" RENAME TO "users_court_side_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_court_side_enum" AS ENUM('DRIVE', 'REVES', 'AMBOS')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "court_side" TYPE "public"."users_court_side_enum" USING "court_side"::"text"::"public"."users_court_side_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."users_court_side_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "public"."users_dominant_hand_enum" RENAME TO "users_dominant_hand_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_dominant_hand_enum" AS ENUM('DERECHA', 'IZQUIERDA')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "dominant_hand" TYPE "public"."users_dominant_hand_enum" USING "dominant_hand"::"text"::"public"."users_dominant_hand_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."users_dominant_hand_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_dominant_hand_enum_old" AS ENUM('RIGHT', 'LEFT')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "dominant_hand" TYPE "public"."users_dominant_hand_enum_old" USING "dominant_hand"::"text"::"public"."users_dominant_hand_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."users_dominant_hand_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."users_dominant_hand_enum_old" RENAME TO "users_dominant_hand_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_court_side_enum_old" AS ENUM('DRIVE', 'BACKHAND')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "court_side" TYPE "public"."users_court_side_enum_old" USING "court_side"::"text"::"public"."users_court_side_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."users_court_side_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."users_court_side_enum_old" RENAME TO "users_court_side_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "id" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "profile_completed"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "points"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "birth_date"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "category"`);
    await queryRunner.query(`DROP TYPE "public"."users_category_enum"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_0bd5012aeb82628e07f6a1be53b"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "google_id"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "photo"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "is_active" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "category_id" uuid`);
  }
}
