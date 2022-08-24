import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { TokensRepository } from '../../domain/tokens.repository';
import { Avalanche, BSC, Fantom, Mainnet, Optimism, Polygon } from '../../../shared/enums/ChainIds';
import { Logger } from '../../../shared/domain/logger';
import { IHttpClient } from '../../../shared/domain/http/IHttpClient';

interface TokenDetails {
  id: number;
  name: string;
  symbol: string;
  platform: {
    token_address: string;
    symbol: string;
  };
}

export class UpdateTokensDetailsCmc {
  private readonly apiUrl;
  private client: IHttpClient;

  constructor(
    @Inject(Class.TokensRepository) private readonly repository: TokensRepository,
    @Inject(Class.HttpClient) private readonly httpClient: IHttpClient,
    @Inject(Class.Logger) private readonly logger: Logger,
  ) {
    this.client = httpClient;
    this.apiUrl = 'https://pro-api.coinmarketcap.com';
  }

  /**
   * Entrypoint
   */
  async execute(): Promise<void> {
    try {
      const response = await this.client.get<{
        data: TokenDetails[];
      }>(`${this.apiUrl}/v1/cryptocurrency/map`, {
        headers: {
          'X-CMC_PRO_API_KEY': '6dad25d6-49ec-4979-8172-83f794348643',
        },
      });

      if (response.data.length === 0) {
        return;
      }

      for (const token of response.data) {
        await this.processToken(token);
      }
      console.log(response.data.length);

    } catch (e) {
      console.log(e);
      // log e
    }
  }

  private async processToken(token: TokenDetails) {
    if (token.platform) {
      try {
        const chainId = this.getChainId(token.platform.symbol);
        console.log(chainId, token.platform.token_address);
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

  private getUniqueChains(tokens: TokenDetails[]) {
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
