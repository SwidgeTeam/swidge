import { Injectable } from '@nestjs/common';
import 'dotenv/config';

@Injectable()
export class ConfigService {
  public getAuthorizedToken(): string {
    return process.env.API_AUTH_TOKEN;
  }

  private isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }
}
