import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { TokensRepository } from '../../domain/tokens.repository';
import { Avalanche, BSC, Fantom, Optimism, Polygon } from '../../../shared/enums/ChainIds';
import { Logger } from '../../../shared/domain/logger';
import { TokenList } from '../../domain/TokenItem';
import { TokenListItem } from '../../domain/TokenListItem';
import { NATIVE_TOKEN_ADDRESS } from '../../../shared/enums/Natives';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CoinGecko = require('coingecko-api');

export class UpdateTokensDetailsCoingecko {
  private client;
  private tokens: TokenList;
  private DELAY_SECONDS = 1;

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
    this.tokens = await this.repository.getList();

    for (const token of this.tokens.items<TokenListItem[]>()) {
      if (token.address === NATIVE_TOKEN_ADDRESS) {
        // do not quote native coins, managed manually
        continue;
      }

      await this.sleep(this.DELAY_SECONDS); // quota restrictions

      try {
        // fetch data
        const platform = this.getPlatform(token.chainId);
        const contract = await this.client.coins.fetchCoinContractInfo(
          token.address.toLowerCase(),
          platform,
        );

        // update token
        token.setLogo(contract.data.image.small);
        this.repository.save(token);

        this.logger.log(`updated ${token.symbol}`);
      } catch (e) {
        this.logger.log(`NOT FOUND -- ${token.symbol}`);
      }
    }
  }

  private getPlatform(chainId: string): string {
    switch (chainId) {
      case Polygon:
        return 'polygon-pos';
      case BSC:
        return 'binance-smart-chain';
      case Fantom:
        return 'fantom';
      case Optimism:
        return 'optimistic-ethereum';
      case Avalanche:
        return 'avalanche';
      default:
        throw new Error('not supported');
    }
  }

  private async sleep(seconds: number) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }
}
