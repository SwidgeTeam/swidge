import { Injectable } from '@nestjs/common';
import 'dotenv/config';

@Injectable()
export class ConfigService {
  public getAuthorizedToken(): string {
    return process.env.API_AUTH_TOKEN;
  }

  public getSocketApiKey(): string {
    return process.env.SOCKET_API_KEY;
  }

  public getRangoApiKey(): string {
    return process.env.RANGO_API_KEY;
  }

  public getViaApiKey(): string {
    return process.env.VIA_API_KEY;
  }

  private isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }
}
