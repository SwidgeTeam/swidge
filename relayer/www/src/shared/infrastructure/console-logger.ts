import { ConsoleLogger as ConsoleLoggerNestJs } from '@nestjs/common';

export class ConsoleLogger extends ConsoleLoggerNestJs {
  error(message: any, ...optionalParams: any[]): any {
    super.error(message, ...optionalParams);
  }

  log(message: any, ...optionalParams: any[]): any {
    super.log(message, ...optionalParams);
  }

  warn(message: any, ...optionalParams: any[]): any {
    super.warn(message, ...optionalParams);
  }
}
