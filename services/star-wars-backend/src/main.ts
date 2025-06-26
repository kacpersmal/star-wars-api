import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import ConfigureSwagger from 'src/common/swagger/init-swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  ConfigureSwagger(app);
  await app.listen(process.env.PORT ?? 3000);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
