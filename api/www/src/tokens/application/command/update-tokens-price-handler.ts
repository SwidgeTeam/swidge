import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { TokensRepository } from '../../domain/tokens.repository';
import { UpdateTokensPriceCommand } from './update-tokens-price-command';
import { TokenListItem } from '../../domain/TokenListItem';
import {
  AllChains,
  Avalanche,
  BSC,
  Fantom,
  Optimism,
  Polygon,
} from '../../../shared/enums/ChainIds';
import { TokenList } from '../../domain/TokenItem';
import { TokenDollarValueFetcher } from '../../domain/token-dollar-value-fetcher';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CoinGecko = require('coingecko-api');

@CommandHandler(UpdateTokensPriceCommand)
export class UpdateTokensPriceHandler implements ICommandHandler<UpdateTokensPriceCommand> {
  private client;

  constructor(
    @Inject(Class.TokensRepository) private readonly repository: TokensRepository,
    @Inject(Class.TokenDollarValueFetcher) private readonly priceFetcher: TokenDollarValueFetcher,
  ) {
    this.client = new CoinGecko();
  }

  /**
   * Entrypoint for the command of updating tokens price
   */
  async execute(): Promise<void> {
    const tokens = await this.repository.getList();

    // update tokens
    for (const chain of AllChains) {
      const chainTokens = tokens.ofChain(chain);
      if (chainTokens.count() > 0) {
        await this.updateTokens(chainTokens, chain);
      }
    }

    // update coins
    for (const token of tokens.getNatives().items<TokenListItem[]>()) {
      const price = await this.priceFetcher.fetch(token.externalId);
      token.setPrice(price);
      this.repository.save(token);
    }
  }

  /**
   * Updates the price of a token
   * @private
   * @param tokens
   * @param chainId
   */
  private async updateTokens(tokens: TokenList, chainId: string) {
    const addresses = [];
    tokens.forEach((token: TokenListItem) => {
      addresses.push(token.address.toLowerCase());
    });
    const prices = await this.client.simple.fetchTokenPrice(
      {
        contract_addresses: addresses,
        vs_currencies: 'usd',
      },
      this.getPlatform(chainId),
    );

    for (const [address, price] of Object.entries(prices.data)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      tokens.updateTokenPrice(chainId, address, price.usd);
    }

    for (const token of tokens.items<TokenListItem[]>()) {
      this.repository.save(token);
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
}
