import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import ConfigureSwagger from './system/swagger/init-swagger';
import { ValidationPipe } from '@nestjs/common';

import helmet from 'helmet';
import { ConfigurationService } from './shared/config/configuration.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();

  app.useGlobalPipes(new ValidationPipe({}));

  app.enableCors();
  app.use(helmet());

  const configService = app.get(ConfigurationService);

  ConfigureSwagger(app);
  await app.listen(configService.port);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
