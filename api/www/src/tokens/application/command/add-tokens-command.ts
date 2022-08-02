import { TokenDto } from '../../infrastructure/controllers/token-dto';

export class AddTokensCommand {
  constructor(public tokens: TokenDto[]) {}
}
