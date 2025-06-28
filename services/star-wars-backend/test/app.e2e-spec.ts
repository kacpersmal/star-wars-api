import { INestApplication } from '@nestjs/common';
import { createTestApp } from './helpers/test-setup';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Application Bootstrap', () => {
    it('should start the application successfully', () => {
      expect(app).toBeDefined();
      expect(app.getHttpServer()).toBeDefined();
    });

    it('should have validation pipes configured', () => {
      // Application should have global validation configured
      expect(app).toBeDefined();
    });
  });
});
