import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';

const ConfigureSwagger = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('Star Wars API')
    .setDescription('Wild times\\n So easy to find in such a wild world')
    .setVersion('1.0')
    .build();

  const theme = new SwaggerTheme();

  const options = {
    explorer: true,
    customCss: theme.getBuffer(SwaggerThemeNameEnum.DARK),
    customSiteTitle: 'Star Wars API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
    },
  };

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, options);
};

export default ConfigureSwagger;
