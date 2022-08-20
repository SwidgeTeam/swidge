import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { TokensRepository } from '../../domain/tokens.repository';
import { AddImportedTokenCommand } from './add-imported-token-command';

@CommandHandler(AddImportedTokenCommand)
export class AddImportedTokenHandler implements ICommandHandler<AddImportedTokenCommand> {
  constructor(@Inject(Class.TokensRepository) private readonly repository: TokensRepository) {}

  /**
   * Entrypoint
   * @param command
   */
  async execute(command: AddImportedTokenCommand): Promise<void> {
    return this.repository.addImported(command.chainId, command.address, command.wallet)
  }
}
