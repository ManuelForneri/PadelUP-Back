import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import {
  initTestApp,
  closeTestApp,
  resetTestApp,
  TestAppContext,
} from './helpers/test-app.helpers';
import axios, { get } from 'axios';

describe('UserController (e2e)', () => {
  let testContext: TestAppContext;
  let app: INestApplication;
  let userRepository: Repository<User>;
  let axiosGetSpy: jest.SpyInstance;

  const mockPokemonData = [
    {
      id: 1,
      name: 'bulbasaur',
    },
    {
      id: 4,
      name: 'charmander',
    },
    {
      id: 7,
      name: 'squirtle',
    },
  ];
  const getPokemonFromUrl = (url: string): number | null => {
    for (const pokemon of mockPokemonData) {
      if (url.includes(`/pokemon/${pokemon.id}`)) {
        return pokemon.id;
      }
    }
    return null;
  };
  beforeAll(async () => {
    testContext = await initTestApp();
    app = testContext.app;
    userRepository = testContext.userRepository;

    const originalAxiosGet = (url: string) => axios.get(url);
    axiosGetSpy = jest.spyOn(axios, 'get').mockImplementation((url: string) => {
      const pokemonId = getPokemonFromUrl(url);
      if (pokemonId !== null) {
        const pokemon = mockPokemonData.find((p) => p.id === pokemonId);
        return Promise.resolve({ data: pokemon });
      }
      return originalAxiosGet(url);
    });
  });

  afterAll(async () => {
    axiosGetSpy.mockRestore();
    await closeTestApp(testContext);
  });

  beforeEach(async () => {
    await resetTestApp(testContext);
    axiosGetSpy.mockClear();
  });

  describe('GET /users', () => {
    it('should return empty array when no users exist', () => {
      return request(app.getHttpServer()).get('/users').expect(200).expect([]);
    });
    it('should return all users', async () => {
      const usersData = [
        {
          username: 'user1',
          email: 'user1@example.com',
          password: 'password1',
          pokemonsIds: [1, 4],
        },
        {
          username: 'user2',
          email: 'user2@example.com',
          password: 'password2',
          pokemonsIds: [7],
        },
      ];
      await userRepository.save(usersData);

      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      interface UserResponse {
        id: number;
        username: string;
        email: string;
        pokemonsIds: number[];
      }
      const responseBody = response.body as UserResponse[];
      expect(responseBody).toHaveLength(2);
      expect(responseBody[0]?.username).toBe('user1');
      expect(responseBody[1]?.username).toBe('user2');
    });
  });

  describe('GET /users/:id', () => {
    it('Should return a user with pokemons details', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        pokemonsIds: [1, 4],
      };

      const user = await userRepository.save(userData);

      const response = await request(app.getHttpServer())
        .get(`/users/${user.id}`)
        .expect(200);

      interface UserWithPokemonResponse {
        id: number;
        username: string;
        email: string;
        pokemonsIds: number[];
        pokemons: Array<{ id: number; name: string }>;
      }
      const responseBody = response.body as UserWithPokemonResponse;
      expect(responseBody.id).toBe(user.id);
      expect(responseBody.username).toBe('testuser');
      expect(responseBody.email).toBe('test@example.com');
      // pokemonsIds is hidden in response (@ApiHideProperty), so we don't test it
      expect(responseBody.pokemons).toHaveLength(2);
      expect(responseBody.pokemons[0].name).toBe('bulbasaur');
      expect(responseBody.pokemons[1].name).toBe('charmander');

      const urls = axiosGetSpy.mock.calls.map((call: string[]) => call[0]);
      expect(urls.some((url) => url.includes('/pokemon/1'))).toBe(true);
      expect(urls.some((url) => url.includes('/pokemon/4'))).toBe(true);
    });

    it('should return 404 if user does not exist', () => {
      return request(app.getHttpServer()).get('/users/9999').expect(404);
    });
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'newpassword123',
        pokemonsIds: [7],
      };
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(userData)
        .expect(201);

      const responseBody = response.body as User;
      expect(responseBody.id).toBeDefined();
      expect(responseBody.username).toBe('newuser');
      expect(responseBody.email).toBe('newuser@example.com');
      expect(responseBody.pokemonsIds).toEqual([7]);

      const savedUser = await userRepository.findOneBy({
        id: responseBody.id,
      });
      expect(savedUser).not.toBeNull();
      expect(savedUser?.username).toBe('newuser');
    });
  });
  describe('PUT /users/:id', () => {
    it('should update a user', async () => {
      const userData = {
        username: 'updatedname',
        email: 'updated@example.com',
        password: 'updatedpassword123',
        pokemonsIds: [1],
      };

      const user = await userRepository.save(userData);
      const updateData = {
        username: 'updatedname',
        pokemonsIds: [1, 4],
      };

      const response = await request(app.getHttpServer())
        .put(`/users/${user.id}`)
        .send(updateData)
        .expect(200);

      const responseBody = response.body as User;
      expect(responseBody.id).toBe(user.id);
      expect(responseBody.username).toBe('updatedname');
      expect(responseBody.email).toBe('updated@example.com');
      expect(responseBody.pokemonsIds).toEqual([1, 4]);
    });
    it('should return 404 if user does not exist', () => {
      return request(app.getHttpServer())
        .put('/users/9999')
        .send({ username: 'nonexistent' })
        .expect(404);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user', async () => {
      const userData = {
        username: 'deleteuser',
        email: 'delete@example.com',
        password: 'deletepassword123',
        pokemonsIds: [],
      };
      const user = await userRepository.save(userData);

      await request(app.getHttpServer())
        .delete(`/users/${user.id}`)
        .expect(200);

      const deletedUser = await userRepository.findOneBy({
        id: user.id,
      });
      expect(deletedUser).toBeNull();
    });
    it('should return 200 even if user does not exist', () => {
      return request(app.getHttpServer()).delete('/users/9999').expect(200);
    });
  });
});
