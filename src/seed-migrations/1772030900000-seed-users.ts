import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedUsers1772030900000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "users" ("id", "email", "first_name", "last_name", "role", "is_active")
      VALUES
        ('user-seed-1', 'john.doe@example.com', 'John', 'Doe', 'PLAYER', true),
        ('user-seed-2', 'jane.smith@example.com', 'Jane', 'Smith', 'PLAYER', true),
        ('user-seed-3', 'admin@padelup.com', 'Admin', 'User', 'ADMIN', true)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "users"
      WHERE "email" IN (
        'john.doe@example.com',
        'jane.smith@example.com',
        'admin@padelup.com'
      )
    `);
  }
}
