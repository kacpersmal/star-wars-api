import * as Joi from 'joi';

const globalConfigurationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  // Database configuration
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().default('star_wars_user'),
  DB_PASSWORD: Joi.string().default('star_wars_password'),
  DB_DATABASE: Joi.string().default('star_wars_db'),

  // Redis configuration
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
});

export default globalConfigurationSchema;
