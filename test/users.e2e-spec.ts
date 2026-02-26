import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource, Repository } from 'typeorm';
import { User, UserRole, UserStatus } from 'src/users/user.entity';
import {
  initTestApp,
  closeTestApp,
  resetTestApp,
  TestAppContext,
} from './helpers/test-app.helpers';

describe('UserController (e2e)', () => {
  let testContext: TestAppContext;
  let app: INestApplication;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    testContext = await initTestApp();
    app = testContext.app;
    userRepository = testContext.userRepository;
  });

  afterAll(async () => {
    await closeTestApp(testContext);
  });

  beforeEach(async () => {
    await resetTestApp(testContext);
  });

  // NOTE: Los endpoints de GET/PUT/DELETE /users están protegidos con JwtAuthGuard + RolesGuard (ADMIN).
  // Los tests e2e completos de autenticación se implementarán en auth.e2e-spec.ts.
  // Este archivo actúa como placeholder para mantener la suite compatible.

  describe('GET /auth/me (protected route)', () => {
    it('should return 401 when no token is provided', () => {
      return request(app.getHttpServer()).get('/auth/me').expect(401);
    });
  });

  describe('GET /users (admin only)', () => {
    it('should return 401 when no token is provided', () => {
      return request(app.getHttpServer()).get('/users').expect(401);
    });
  });

  describe('PATCH /users/me/profile (authenticated)', () => {
    it('should return 401 when no token is provided', () => {
      return request(app.getHttpServer())
        .patch('/users/me/profile')
        .send({
          court_side: 'DRIVE',
          dominant_hand: 'DERECHA',
          birth_date: '1995-08-15',
        })
        .expect(401);
    });
  });
});
