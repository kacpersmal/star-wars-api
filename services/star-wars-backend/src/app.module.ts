import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import globalConfiguration from 'src/common/config/global-configuration.loader';
import globalConfigurationSchema from 'src/common/config/global-configuration.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [globalConfiguration],
      validationSchema: globalConfigurationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
