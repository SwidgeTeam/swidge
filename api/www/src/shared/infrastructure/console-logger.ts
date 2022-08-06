import { ConsoleLogger as NestConsoleLogger } from '@nestjs/common';
import { Logger } from '../domain/logger';

export class ConsoleLogger extends NestConsoleLogger implements Logger {
  error(message: any): any {
    super.error(message);
  }

  log(message: any): any {
    super.log(message);
  }

  warn(message: any): any {
    super.warn(message);
  }
}
