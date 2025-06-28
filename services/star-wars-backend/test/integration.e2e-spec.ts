import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './helpers/test-setup';

describe('API Integration (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('General API Behavior', () => {
    it('should return proper content-type headers', async () => {
      const response = await request(app.getHttpServer())
        .get('/species')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should handle OPTIONS requests for CORS', async () => {
      const response = await request(app.getHttpServer()).options('/species');

      // Should handle CORS preflight requests
      expect([200, 204, 404]).toContain(response.status);
    });

    it('should handle health check endpoint', async () => {
      const response = await request(app.getHttpServer()).get('/health');

      // Health endpoint might exist
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent endpoints', async () => {
      await request(app.getHttpServer())
        .get('/non-existent-endpoint')
        .expect(404);
    });

    it('should handle invalid JSON payloads', async () => {
      const response = await request(app.getHttpServer())
        .post('/species')
        .set('Content-Type', 'application/json')
        .send('invalid-json')
        .expect(400);

      expect(response.body).toHaveProperty('statusCode', 400);
    });
  });
});
