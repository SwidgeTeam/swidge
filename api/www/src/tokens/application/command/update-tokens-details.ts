import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { TokensRepository } from '../../domain/tokens.repository';
import { Avalanche, BSC, Fantom, Optimism, Polygon } from '../../../shared/enums/ChainIds';
import { Logger } from '../../../shared/domain/logger';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CoinGecko = require('coingecko-api');

export class UpdateTokensDetails {
  private client;

  constructor(
    @Inject(Class.TokensRepository) private readonly repository: TokensRepository,
    @Inject(Class.Logger) private readonly logger: Logger,
  ) {
    this.client = new CoinGecko();
  }

  /**
   * Entrypoint
   */
  async execute(): Promise<void> {
    const list = await this.client.coins.all();
    const tokens = await this.repository.getList();

    for (const coin of list.data) {
      await this.sleep(1); // for quota restrictions
      const coinId = coin.id;
      const coin_data = await this.fetchCoinData(coinId);
      if (!coin_data.asset_platform_id) {
        // means it's a native coin, will treat them manually
        continue;
      }
      for (const [platform, address] of Object.entries(coin_data.platforms)) {
        try {
          // convert chain id
          const chainId = this.getChainId(platform);
          // fetch token
          const token = tokens.find(chainId, address as string);
          if (!token) {
            // if it doesn't exist means we don't support the token yet
            continue;
          }
          // update details
          token
            .setExternalId(coinId)
            .setLogo(coin_data.image.small);
          // update token
          this.repository.save(token);
          this.logger.log(`updated ${coinId}`);
        } catch (e) {
          // Failed because we don't support the specific chain yet
          // nothing to do
        }
      }
    }
  }

  private async fetchCoinData(id: string) {
    const coin = await this.client.coins.fetch(id, {
      localization: false,
      community_data: false,
      developer_data: false,
      tickers: false,
    });
    return coin.data;
  }

  private async sleep(seconds: number) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }

  private getChainId(platform: string): string {
    switch (platform) {
      case 'polygon-pos':
        return Polygon;
      case 'binance-smart-chain':
        return BSC;
      case 'fantom':
        return Fantom;
      case 'optimistic-ethereum':
        return Optimism;
      case 'avalanche':
        return Avalanche;
      default:
        throw new Error('not supported');
    }
  }
}
