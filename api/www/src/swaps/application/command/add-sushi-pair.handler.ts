import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SushiPairsRepository } from '../../domain/sushi-pairs-repository';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { AddSushiPairCommand } from './add-sushi-pair.command';
import { SushiPoolsTheGraph } from '../../infrastructure/theGraph/sushi-pools-the-graph';

@CommandHandler(AddSushiPairCommand)
export class AddSushiPairHandler implements ICommandHandler<AddSushiPairCommand> {
  constructor(
    @Inject(Class.SushiPairsRepository) private readonly repository: SushiPairsRepository,
    @Inject(Class.SushiPairsTheGraph) private readonly theGraph: SushiPoolsTheGraph,
  ) {}

  async execute(command: AddSushiPairCommand): Promise<void> {
    const pair = await this.theGraph.fetchPair(command.chainId, command.token0, command.token1);
    this.repository.save(pair);
  }
}
