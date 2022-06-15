import { Injectable } from '@nestjs/common';
import { ConfigService as NestJSConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private configService: NestJSConfigService) {}

  get privateKey(): string {
    return this.configService.get<string>('private_key');
  }

  get apiUrl(): string {
    return this.configService.get<string>('api_url');
  }

  get sqsQueueUrl() {
    return this.value('sqs_queue_url');
  }

  get region() {
    return this.value('region');
  }

  get accessKey() {
    return this.value('access_key');
  }

  get secret() {
    return this.value('secret');
  }

  get isProduction(): boolean {
    return this.value('environment') === 'production';
  }

  private value(key: string): string {
    return this.configService.get<string>(key) || '';
  }
}
