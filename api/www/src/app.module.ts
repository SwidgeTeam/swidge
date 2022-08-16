import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './health/health.module';
import { PathsModule } from './paths/paths.module';
import { SwapsModule } from './swaps/swaps.module';
import databaseConfiguration from './config/database.configuration';
import { AddressesModule } from './addresses/addresses.module';
import { TokensModule } from './tokens/tokens.module';
import { AggregatorsModule } from './aggregators/aggregators.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfiguration()),
    AddressesModule,
    HealthModule,
    PathsModule,
    SwapsModule,
    TokensModule,
    AggregatorsModule,
  ],
})
export class AppModule {}
