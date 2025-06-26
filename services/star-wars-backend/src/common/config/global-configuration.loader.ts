import GlobalConfiguration from 'src/common/config/global-configuration.interface';

const globalConfigurationLoader = (): GlobalConfiguration => ({
  port: (process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
});

export default globalConfigurationLoader;
