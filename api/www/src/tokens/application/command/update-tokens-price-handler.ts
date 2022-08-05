import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { TokensRepository } from '../../domain/tokens.repository';
import { UpdateTokensPriceCommand } from './update-tokens-price-command';
import { TokenListItem } from '../../domain/TokenListItem';
import { TokenDollarValueFetcher } from '../../domain/token-dollar-value-fetcher';

@CommandHandler(UpdateTokensPriceCommand)
export class UpdateTokensPriceHandler implements ICommandHandler<UpdateTokensPriceCommand> {
  private OLDER_THAN = 10; // minutes
  private BATCH_SIZE = 50; // tokens

  constructor(
    @Inject(Class.TokensRepository) private readonly repository: TokensRepository,
    @Inject(Class.TokenDollarValueFetcher) private readonly pricesFetcher: TokenDollarValueFetcher,
  ) {}

  /**
   * Entrypoint for the command of updating tokens price
   */
  async execute(): Promise<void> {
    const tokens = await this.repository.getOutdatedTokens(this.OLDER_THAN, this.BATCH_SIZE);

    for (const token of tokens.items<TokenListItem[]>()) {
      await this.updateTokenPrice(token);
    }
  }

  /**
   * Updates the price of a token
   * @param token
   * @private
   */
  private async updateTokenPrice(token: TokenListItem) {
    const price = await this.pricesFetcher.fetch(token.externalId);
    token.setPrice(price);
    await this.repository.save(token);
  }
}
