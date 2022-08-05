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
import { CoinPriceFetcher } from '../../domain/coin-price-fetcher';
import { TokensPriceFetcher } from '../../domain/tokens-price-fetcher';

@CommandHandler(UpdateTokensPriceCommand)
export class UpdateTokensPriceHandler implements ICommandHandler<UpdateTokensPriceCommand> {
  private client;

  constructor(
    @Inject(Class.TokensRepository) private readonly repository: TokensRepository,
    @Inject(Class.CoinPriceFetcher) private readonly coinPriceFetcher: CoinPriceFetcher,
    @Inject(Class.TokensPriceFetcher) private readonly tokensPriceFetcher: TokensPriceFetcher,
  ) {}

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
      const price = await this.coinPriceFetcher.fetch(token.externalId);
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
    const addresses = tokens.map<string[]>((token: TokenListItem) => {
      return token.address;
    });

    const prices = this.tokensPriceFetcher.fetch(addresses, chainId);

    for (const [address, price] of Object.entries(prices)) {
      tokens.updateTokenPrice(chainId, address, price);
    }

    for (const token of tokens.items<TokenListItem[]>()) {
      this.repository.save(token);
    }
  }
}
