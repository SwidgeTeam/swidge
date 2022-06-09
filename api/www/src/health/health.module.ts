import { Module } from '@nestjs/common';
import { HealthCheckController } from './infrastructure/controllers/health-check.controller';

@Module({
  controllers: [HealthCheckController],
})
export class HealthModule {}
