import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GlobalConfiguration } from './global-configuration.interface';

@Injectable()
export class ConfigurationService {
  constructor(private configService: ConfigService<GlobalConfiguration>) {}

  get port(): number {
    return this.configService.get<number>('port', { infer: true })! as number;
  }

  get nodeEnv(): string {
    return this.configService.get<string>('nodeEnv', { infer: true })!;
  }

  get database() {
    return this.configService.get('database', { infer: true })!;
  }

  get redis() {
    return this.configService.get('redis', { infer: true })!;
  }
}
