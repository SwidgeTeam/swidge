import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { TokensRepository } from '../../domain/tokens.repository';
import { Avalanche, BSC, Fantom, Mainnet, Optimism, Polygon } from '../../../shared/enums/ChainIds';
import { Logger } from '../../../shared/domain/logger';
import { ICoinmarketcapApi } from '../../domain/coinmarketcap-api';
import { CmcTokenDetails } from '../../infrastructure/external/coinmarketcap-api';

export class UpdateTokensDetailsCmc {
  constructor(
    @Inject(Class.TokensRepository) private readonly repository: TokensRepository,
    @Inject(Class.CoinmarketcapApi) private readonly coinmarketcapApi: ICoinmarketcapApi,
    @Inject(Class.Logger) private readonly logger: Logger,
  ) {}

  /**
   * Entrypoint
   */
  async execute(): Promise<void> {
    try {
      const tokens = await this.coinmarketcapApi.all();

      for (const token of tokens) {
        await this.processToken(token);
      }
    } catch (e) {
      console.log(e);
      // log e
    }
  }

  private async processToken(token: CmcTokenDetails) {
    if (token.platform) {
      try {
        const chainId = this.getChainId(token.platform.symbol);
        const tokenItem = await this.repository.find(
          chainId,
          token.platform.token_address.toLowerCase(),
        );
        if (tokenItem) {
          tokenItem.setCoinmarketcapId(token.id.toString());
          await this.repository.save(tokenItem);
          this.logger.log(`updated ${token.symbol}`);
        }
      } catch (e) {
        // nothing to do
      }
    }
  }

  private getChainId(symbol: string): string {
    switch (symbol) {
      case 'ETH':
        return Mainnet;
      case 'BNB':
        return BSC;
      case 'MATIC':
        return Polygon;
      case 'OP':
        return Optimism;
      case 'FTM':
        return Fantom;
      case 'AVAX':
        return Avalanche;
      default:
        throw new Error('not supported');
    }
  }

  private getUniqueChains(tokens: CmcTokenDetails[]) {
    const chains = [];
    for (const token of tokens) {
      if (token.platform) {
        if (!chains.includes(token.platform.symbol)) {
          chains.push(token.platform.symbol);
        }
      }
    }
    return chains;
  }

  private async sleep(seconds: number) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }
}
