import { Injectable } from '@nestjs/common';
import { ConfigService as NestJSConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private configService: NestJSConfigService) {}

  public sqsQueueUrl() {
    return this.value('sqs_queue_url');
  }

  public region() {
    return this.value('region');
  }

  public accessKey() {
    return this.value('access_key');
  }

  public secret() {
    return this.value('secret');
  }

  private isProduction(): boolean {
    return this.value('environment') === 'production';
  }

  private value(key: string): string {
    return this.configService.get<string>(key) || '';
  }
}
