import type { Config } from 'drizzle-kit';

export default {
  schema: './src/database/schema/*',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'star_wars_user',
    password: process.env.DB_PASSWORD || 'star_wars_password',
    database: process.env.DB_DATABASE || 'star_wars_db',
  },
} satisfies Config;
