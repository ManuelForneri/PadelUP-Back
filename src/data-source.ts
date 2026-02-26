import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'padelup_db',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [
    __dirname + '/migrations/*{.ts,.js}',
    __dirname + '/seed-migrations/*{.ts,.js}',
  ],
  migrationsTableName: 'custom_migrations_table',
  synchronize: false,
});
