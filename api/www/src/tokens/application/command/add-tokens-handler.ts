import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddTokensCommand } from './add-tokens-command';

@CommandHandler(AddTokensCommand)
export class AddTokensHandler implements ICommandHandler<AddTokensCommand> {
  execute(command: AddTokensCommand): Promise<any> {
    return Promise.resolve(undefined);
  }
}
