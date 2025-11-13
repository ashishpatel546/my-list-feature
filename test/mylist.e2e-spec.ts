import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { User } from '../src/entities/user.entity';
import { Movie } from '../src/entities/movie.entity';
import { TVShow } from '../src/entities/tvshow.entity';
import { MyListItem } from '../src/entities/mylist.entity';

describe('MyList API (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clear database before each test
    await dataSource.getRepository(MyListItem).clear();
    await dataSource.getRepository(User).clear();
    await dataSource.getRepository(Movie).clear();
    await dataSource.getRepository(TVShow).clear();

    // Seed test data
    await seedTestData(dataSource);
  });

  describe('POST /mylist (Add to My List)', () => {
    it('should add a movie to user list', () => {
      return request(app.getHttpServer())
        .post('/mylist')
        .send({
          userId: 'test-user-1',
          contentId: 'test-movie-1',
          contentType: 'movie',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.message).toBe('Item added to your list');
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.userId).toBe('test-user-1');
          expect(res.body.data.contentId).toBe('test-movie-1');
          expect(res.body.data.contentType).toBe('movie');
        });
    });

    it('should add a TV show to user list', () => {
      return request(app.getHttpServer())
        .post('/mylist')
        .send({
          userId: 'test-user-1',
          contentId: 'test-tvshow-1',
          contentType: 'tvshow',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.contentType).toBe('tvshow');
        });
    });

    it('should return 409 when adding duplicate item', async () => {
      await request(app.getHttpServer())
        .post('/mylist')
        .send({
          userId: 'test-user-1',
          contentId: 'test-movie-1',
          contentType: 'movie',
        })
        .expect(201);

      return request(app.getHttpServer())
        .post('/mylist')
        .send({
          userId: 'test-user-1',
          contentId: 'test-movie-1',
          contentType: 'movie',
        })
        .expect(409);
    });

    it('should return 404 when movie does not exist', () => {
      return request(app.getHttpServer())
        .post('/mylist')
        .send({
          userId: 'test-user-1',
          contentId: 'non-existent-movie',
          contentType: 'movie',
        })
        .expect(404);
    });

    it('should return 404 when TV show does not exist', () => {
      return request(app.getHttpServer())
        .post('/mylist')
        .send({
          userId: 'test-user-1',
          contentId: 'non-existent-tvshow',
          contentType: 'tvshow',
        })
        .expect(404);
    });

    it('should return 400 when request body is invalid', () => {
      return request(app.getHttpServer())
        .post('/mylist')
        .send({
          userId: 'test-user-1',
          // missing contentId and contentType
        })
        .expect(400);
    });

    it('should return 400 when contentType is invalid', () => {
      return request(app.getHttpServer())
        .post('/mylist')
        .send({
          userId: 'test-user-1',
          contentId: 'test-movie-1',
          contentType: 'invalid-type',
        })
        .expect(400);
    });
  });

  describe('DELETE /mylist (Remove from My List)', () => {
    beforeEach(async () => {
      await request(app.getHttpServer()).post('/mylist').send({
        userId: 'test-user-1',
        contentId: 'test-movie-1',
        contentType: 'movie',
      });
    });

    it('should remove an item from user list', () => {
      return request(app.getHttpServer())
        .delete('/mylist')
        .send({
          userId: 'test-user-1',
          contentId: 'test-movie-1',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.message).toBe('Item removed from your list');
        });
    });

    it('should return 404 when removing non-existent item', () => {
      return request(app.getHttpServer())
        .delete('/mylist')
        .send({
          userId: 'test-user-1',
          contentId: 'non-existent-content',
        })
        .expect(404);
    });

    it('should return 400 when request body is invalid', () => {
      return request(app.getHttpServer())
        .delete('/mylist')
        .send({
          userId: 'test-user-1',
          // missing contentId
        })
        .expect(400);
    });
  });

  describe('GET /mylist (List My Items)', () => {
    beforeEach(async () => {
      // Add multiple items
      for (let i = 1; i <= 5; i++) {
        await request(app.getHttpServer())
          .post('/mylist')
          .send({
            userId: 'test-user-1',
            contentId: `test-movie-${i}`,
            contentType: 'movie',
          });
      }
    });

    it('should list all items in user list with default pagination', () => {
      return request(app.getHttpServer())
        .get('/mylist')
        .query({ userId: 'test-user-1' })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('items');
          expect(res.body.data).toHaveProperty('pagination');
          expect(res.body.data.items).toHaveLength(5);
          expect(res.body.data.pagination.page).toBe(1);
          expect(res.body.data.pagination.total).toBe(5);
        });
    });

    it('should return paginated results', () => {
      return request(app.getHttpServer())
        .get('/mylist')
        .query({ userId: 'test-user-1', page: 1, limit: 2 })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.items).toHaveLength(2);
          expect(res.body.data.pagination.page).toBe(1);
          expect(res.body.data.pagination.limit).toBe(2);
          expect(res.body.data.pagination.total).toBe(5);
          expect(res.body.data.pagination.totalPages).toBe(3);
        });
    });

    it('should return second page of results', () => {
      return request(app.getHttpServer())
        .get('/mylist')
        .query({ userId: 'test-user-1', page: 2, limit: 2 })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.items).toHaveLength(2);
          expect(res.body.data.pagination.page).toBe(2);
        });
    });

    it('should return empty list for user with no items', () => {
      return request(app.getHttpServer())
        .get('/mylist')
        .query({ userId: 'test-user-2' })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.items).toHaveLength(0);
          expect(res.body.data.pagination.total).toBe(0);
        });
    });

    it('should include full content details in response', () => {
      return request(app.getHttpServer())
        .get('/mylist')
        .query({ userId: 'test-user-1' })
        .expect(200)
        .expect((res) => {
          const firstItem = res.body.data.items[0];
          expect(firstItem).toHaveProperty('content');
          expect(firstItem.content).toHaveProperty('title');
          expect(firstItem.content).toHaveProperty('description');
        });
    });

    it('should return 400 when userId is missing', () => {
      return request(app.getHttpServer()).get('/mylist').expect(400);
    });

    it('should validate pagination parameters', () => {
      return request(app.getHttpServer())
        .get('/mylist')
        .query({ userId: 'test-user-1', page: 0, limit: -1 })
        .expect(400);
    });
  });

  describe('Performance Test - List My Items', () => {
    beforeEach(async () => {
      // Add 50 items to test pagination and performance
      const promises = [];
      for (let i = 1; i <= 50; i++) {
        promises.push(
          request(app.getHttpServer())
            .post('/mylist')
            .send({
              userId: 'test-user-perf',
              contentId: `test-movie-${i}`,
              contentType: 'movie',
            }),
        );
      }
      await Promise.all(promises);
    });

    it('should respond in under 100ms (with cache)', async () => {
      // First call to populate cache
      await request(app.getHttpServer())
        .get('/mylist')
        .query({ userId: 'test-user-perf', page: 1, limit: 20 });

      // Second call should be fast (from cache)
      const startTime = Date.now();
      await request(app.getHttpServer())
        .get('/mylist')
        .query({ userId: 'test-user-perf', page: 1, limit: 20 })
        .expect(200);
      const endTime = Date.now();

      const responseTime = endTime - startTime;
      console.log(`Response time: ${responseTime}ms`);
      expect(responseTime).toBeLessThan(100);
    });
  });

  describe('Cache Invalidation', () => {
    it('should invalidate cache when adding new item', async () => {
      // First request - populate cache
      const res1 = await request(app.getHttpServer())
        .get('/mylist')
        .query({ userId: 'test-user-1' })
        .expect(200);

      const initialCount = res1.body.data.items.length;

      // Add new item
      await request(app.getHttpServer()).post('/mylist').send({
        userId: 'test-user-1',
        contentId: 'test-movie-1',
        contentType: 'movie',
      });

      // Second request - should get fresh data
      const res2 = await request(app.getHttpServer())
        .get('/mylist')
        .query({ userId: 'test-user-1' })
        .expect(200);

      expect(res2.body.data.items.length).toBe(initialCount + 1);
    });

    it('should invalidate cache when removing item', async () => {
      // Add item first
      await request(app.getHttpServer()).post('/mylist').send({
        userId: 'test-user-1',
        contentId: 'test-movie-1',
        contentType: 'movie',
      });

      // Get list - populate cache
      const res1 = await request(app.getHttpServer())
        .get('/mylist')
        .query({ userId: 'test-user-1' })
        .expect(200);

      const initialCount = res1.body.data.items.length;

      // Remove item
      await request(app.getHttpServer()).delete('/mylist').send({
        userId: 'test-user-1',
        contentId: 'test-movie-1',
      });

      // Get list again - should get fresh data
      const res2 = await request(app.getHttpServer())
        .get('/mylist')
        .query({ userId: 'test-user-1' })
        .expect(200);

      expect(res2.body.data.items.length).toBe(initialCount - 1);
    });
  });
});

async function seedTestData(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  const movieRepository = dataSource.getRepository(Movie);
  const tvShowRepository = dataSource.getRepository(TVShow);

  // Create test users
  const users = [
    {
      id: 'test-user-1',
      username: 'testuser1',
      preferences: {
        favoriteGenres: ['Action'],
        dislikedGenres: [],
      },
      watchHistory: [],
    },
    {
      id: 'test-user-2',
      username: 'testuser2',
      preferences: {
        favoriteGenres: ['Comedy'],
        dislikedGenres: [],
      },
      watchHistory: [],
    },
    {
      id: 'test-user-perf',
      username: 'perfuser',
      preferences: {
        favoriteGenres: [],
        dislikedGenres: [],
      },
      watchHistory: [],
    },
  ];
  await userRepository.save(users);

  // Create test movies
  const movies = [];
  for (let i = 1; i <= 50; i++) {
    movies.push({
      id: `test-movie-${i}`,
      title: `Test Movie ${i}`,
      description: `Description for test movie ${i}`,
      genres: ['Action'],
      releaseDate: new Date('2024-01-01'),
      director: 'Test Director',
      actors: ['Actor 1', 'Actor 2'],
    });
  }
  await movieRepository.save(movies);

  // Create test TV shows
  const tvShows = [
    {
      id: 'test-tvshow-1',
      title: 'Test TV Show 1',
      description: 'Description for test TV show 1',
      genres: ['Drama'],
      episodes: [
        {
          episodeNumber: 1,
          seasonNumber: 1,
          releaseDate: new Date('2024-01-01'),
          director: 'Test Director',
          actors: ['Actor 1', 'Actor 2'],
        },
      ],
    },
  ];
  await tvShowRepository.save(tvShows);
}
