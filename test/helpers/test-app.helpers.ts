import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AppModule } from 'src/app.module';
import { User } from 'src/users/user.entity';

export interface TestAppContext {
  app: INestApplication;
  dataSource: DataSource;
  userRepository: Repository<User>;
}

export async function initTestApp(): Promise<TestAppContext> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  const dataSource = moduleFixture.get<DataSource>(DataSource);
  await dataSource.dropDatabase();
  await dataSource.synchronize();

  await app.init();

  const userRepository = dataSource.getRepository(User);

  return {
    app,
    dataSource,
    userRepository,
  };
}

export async function closeTestApp(context: TestAppContext): Promise<void> {
  const { app, dataSource, userRepository } = context;
  await userRepository.clear();
  await dataSource.destroy();
  await app.close();
}

export async function resetTestApp(context: TestAppContext): Promise<void> {
  const { dataSource, userRepository } = context;
  await userRepository.clear();
  await dataSource.synchronize();
}
