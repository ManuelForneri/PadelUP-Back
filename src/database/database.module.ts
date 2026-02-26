import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from '../data-source';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...AppDataSource.options,
      // Override synchronize to use environment variable
      synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
    }),
  ],
})
export class DatabaseModule {}
