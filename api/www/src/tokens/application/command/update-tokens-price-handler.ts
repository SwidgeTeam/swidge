import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { TokensRepository } from '../../domain/tokens.repository';
import { UpdateTokensPriceCommand } from './update-tokens-price-command';
import { TokenListItem } from '../../domain/TokenListItem';
import { AllChains, Polygon } from '../../../shared/enums/ChainIds';
import { TokenList } from '../../domain/TokenItem';
import { CoinPriceFetcher } from '../../domain/coin-price-fetcher';
import { TokensPriceFetcher } from '../../domain/tokens-price-fetcher';

@CommandHandler(UpdateTokensPriceCommand)
export class UpdateTokensPriceHandler implements ICommandHandler<UpdateTokensPriceCommand> {
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
        try {
          await this.updateTokens(chainTokens, chain);
        } catch (e) {
          // log
        }
      }
    }

    // update coins
    const natives = tokens.getNatives();
    for (const token of natives.items<TokenListItem[]>()) {
      try {
        const price = await this.coinPriceFetcher.fetch(token.externalId);
        token.setPrice(price);
        this.repository.save(token);
      } catch (e) {
        // log
      }
    }

    // special cases
    const matic = natives.ofChain(Polygon).items()[0];
    await this.updateMatic(matic);
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

  /**
   * MATIC token has a specific address, thus it has to be quotes as
   * a token instead of a coin, as ugly as it is, didn't have an easy option
   * @param token
   */
  async updateMatic(token: TokenListItem) {
    const prices = await this.tokensPriceFetcher.fetch(
      ['0x0000000000000000000000000000000000001010'],
      Polygon,
    );
    token.setPrice(prices[0].price);
    this.repository.save(token);
  }
}
