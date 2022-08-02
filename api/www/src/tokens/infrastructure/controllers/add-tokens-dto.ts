import { ValidateNested } from 'class-validator';
import { TokenDto } from './token-dto';
import { Type } from 'class-transformer';

export class AddTokensDto {
  @Type(() => TokenDto)
  @ValidateNested()
  list: TokenDto[];
}
