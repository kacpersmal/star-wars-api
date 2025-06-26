import * as Joi from 'joi';

const globalConfigurationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
});

export default globalConfigurationSchema;
