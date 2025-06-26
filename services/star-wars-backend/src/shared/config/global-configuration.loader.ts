import GlobalConfiguration from './global-configuration.interface';

const globalConfigurationLoader = (): GlobalConfiguration => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'star_wars_user',
    password: process.env.DB_PASSWORD || 'star_wars_password',
    database: process.env.DB_DATABASE || 'star_wars_db',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },
});

export default globalConfigurationLoader;
