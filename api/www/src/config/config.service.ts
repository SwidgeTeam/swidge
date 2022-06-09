import { Injectable } from '@nestjs/common';
import { ConfigService as NestJSConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private configService: NestJSConfigService) {}

  private isProduction(): boolean {
    return this.value('environment') === 'production';
  }

  private value(key: string): string {
    return this.configService.get<string>(key) || '';
  }
}
