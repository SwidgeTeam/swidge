import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddTokensCommand } from './add-tokens-command';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { TokensRepository } from '../../domain/tokens.repository';
import { TokenListItem } from '../../domain/TokenListItem';
import { ContractAddress } from '../../../shared/types';

@CommandHandler(AddTokensCommand)
export class AddTokensHandler implements ICommandHandler<AddTokensCommand> {
  constructor(@Inject(Class.TokensRepository) private readonly repository: TokensRepository) {}

  /**
   * Entrypoint for the command of adding a list of tokens
   * @param command
   */
  async execute(command: AddTokensCommand): Promise<void> {
    for (const t of command.tokens) {
      const alreadyExists = await this.existsToken(t.chainId, t.address);
      if (alreadyExists) {
        continue;
      }
      const token = new TokenListItem(
        t.chainId,
        t.address,
        t.name,
        t.decimals,
        t.symbol,
        t.logo,
        t.externalId,
        0,
      );
      this.repository.save(token);
    }

    return;
  }

  /**
   * Checks if the given token exists on persistence layer
   * @param chainId
   * @param address
   * @private
   */
  private async existsToken(chainId: string, address: ContractAddress): Promise<boolean> {
    const token = await this.repository.find(chainId, address);
    return token !== null;
  }
}
