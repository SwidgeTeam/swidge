import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { TokensRepository } from '../../domain/tokens.repository';

export class UpdateTokensDetails {
  constructor(
    @Inject(Class.TokensRepository) private readonly repository: TokensRepository,
  ) {}

  /**
   * Entrypoint
   */
  async execute(): Promise<void> {
    // TODO
  }
}
