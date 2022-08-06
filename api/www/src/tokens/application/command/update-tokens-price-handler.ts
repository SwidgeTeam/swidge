import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { TokensRepository } from '../../domain/tokens.repository';
import { UpdateTokensPriceCommand } from './update-tokens-price-command';
import { TokenListItem } from '../../domain/TokenListItem';
import { AllChains } from '../../../shared/enums/ChainIds';
import { TokenList } from '../../domain/TokenItem';
import { CoinsPriceFetcher } from '../../domain/coins-price-fetcher';
import { TokensPriceFetcher } from '../../domain/tokens-price-fetcher';

@CommandHandler(UpdateTokensPriceCommand)
export class UpdateTokensPriceHandler implements ICommandHandler<UpdateTokensPriceCommand> {
  constructor(
    @Inject(Class.TokensRepository) private readonly repository: TokensRepository,
    @Inject(Class.CoinsPriceFetcher) private readonly coinsPriceFetcher: CoinsPriceFetcher,
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
    const ids = this.getNativesIds(natives);
    try {
      const prices = await this.coinsPriceFetcher.fetch(ids);
      for (const row of prices) {
        const coin = natives.findByExternalId(row.id);
        coin.setPrice(row.price);
        this.repository.save(coin);
      }
    } catch (e) {
      // log
    }
  }

  /**
   * Create array with the native coins IDS to be fetched
   * @param natives
   * @private
   */
  private getNativesIds(natives: TokenList): string[] {
    return natives
      .map<string[]>((token: TokenListItem) => {
        return token.externalId;
      })
      .filter((id) => id);
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

    const prices = await this.tokensPriceFetcher.fetch(addresses, chainId);

    for (const row of prices) {
      tokens.updateTokenPrice(chainId, row.address, row.price);
    }

    for (const token of tokens.items<TokenListItem[]>()) {
      this.repository.save(token);
    }
  }
}