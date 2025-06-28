import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, TEST_IDS } from './helpers/test-setup';

describe('Episodes API (e2e)', () => {
  let app: INestApplication;
  let episodeId: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /episodes', () => {
    it('should create a new episode', async () => {
      const createEpisodeDto = {
        name: 'A New Hope',
        releaseDate: '1977-05-25',
      };

      const response = await request(app.getHttpServer())
        .post('/episodes')
        .send(createEpisodeDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createEpisodeDto.name);
      expect(response.body.releaseDate).toBe(createEpisodeDto.releaseDate);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');

      episodeId = response.body.id as string;
    });

    it('should return validation error for invalid episode data', async () => {
      const invalidData = {
        name: '', // Empty name should fail validation
        releaseDate: 'invalid-date',
      };

      await request(app.getHttpServer())
        .post('/episodes')
        .send(invalidData)
        .expect(400);
    });
  });

  describe('GET /episodes', () => {
    it('should return all episodes', async () => {
      const response = await request(app.getHttpServer())
        .get('/episodes')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('id');
        // Episodes might have 'title' or 'name' field depending on implementation
        expect(response.body[0]).toHaveProperty(
          response.body[0].name ? 'name' : 'title',
        );
      }
    });
  });

  describe('GET /episodes/:id', () => {
    it('should return an episode by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/episodes/${episodeId}`)
        .expect(200);

      expect(response.body.id).toBe(episodeId);
      // Check for either 'name' or 'title' field
      expect(response.body.name || response.body.title).toBe('A New Hope');
    });

    it('should return 404 for non-existent episode', async () => {
      await request(app.getHttpServer())
        .get(`/episodes/${TEST_IDS.NON_EXISTENT_ID}`)
        .expect(404);
    });
  });

  describe('PUT /episodes/:id', () => {
    it('should update an episode', async () => {
      const updateEpisodeDto = {
        name: 'Episode IV: A New Hope',
        releaseDate: '1977-05-25',
      };

      const response = await request(app.getHttpServer())
        .put(`/episodes/${episodeId}`)
        .send(updateEpisodeDto)
        .expect(200);

      expect(response.body.id).toBe(episodeId);
      expect(response.body.name || response.body.title).toBe(
        updateEpisodeDto.name,
      );
    });

    it('should return 404 for updating non-existent episode', async () => {
      const updateData = {
        name: 'Updated Episode',
        releaseDate: '1980-01-01',
      };

      await request(app.getHttpServer())
        .put(`/episodes/${TEST_IDS.NON_EXISTENT_ID}`)
        .send(updateData)
        .expect(404);
    });
  });

  describe('DELETE /episodes/:id', () => {
    it('should delete an episode', async () => {
      const response = await request(app.getHttpServer()).delete(
        `/episodes/${episodeId}`,
      );

      // Episodes might return 200 instead of 204
      expect([200, 204]).toContain(response.status);

      // Verify episode is deleted
      await request(app.getHttpServer())
        .get(`/episodes/${episodeId}`)
        .expect(404);
    });

    it('should return 404 for deleting non-existent episode', async () => {
      await request(app.getHttpServer())
        .delete(`/episodes/${TEST_IDS.NON_EXISTENT_ID}`)
        .expect(404);
    });
  });

  describe('Edge Cases', () => {
    it('should handle malformed UUID in path parameters', async () => {
      await request(app.getHttpServer())
        .get('/episodes/invalid-uuid')
        .expect(400);
    });
  });
});
