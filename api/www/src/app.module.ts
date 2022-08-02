import { Module } from '@nestjs/common';
import { BridgesModule } from './bridges/bridges.module';
import { ChainsModule } from './chains/chains.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './health/health.module';
import { PathsModule } from './paths/paths.module';
import { SwapsModule } from './swaps/swaps.module';
import databaseConfiguration from './config/database.configuration';
import { AddressesModule } from './addresses/addresses.module';
import { TokensModule } from './tokens/tokens.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfiguration()),
    AddressesModule,
    BridgesModule,
    ChainsModule,
    HealthModule,
    PathsModule,
    SwapsModule,
    TokensModule,
  ],
})
export class AppModule {}
