import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthCheckController {
  @Get('/health')
  public healthCheck() {
    return 'OK';
  }
}
