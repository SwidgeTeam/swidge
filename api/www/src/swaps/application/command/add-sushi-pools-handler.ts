import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SushiPairsRepository } from '../../domain/sushi-pairs-repository';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { AddSushiPoolsCommand } from './add-sushi-pools-command';
import { SushiPoolsTheGraph } from '../../infrastructure/theGraph/sushi-pools-the-graph';

@CommandHandler(AddSushiPoolsCommand)
export class AddSushiPoolsHandler implements ICommandHandler<AddSushiPoolsCommand> {
  constructor(
    @Inject(Class.SushiPairsRepository) private readonly repository: SushiPairsRepository,
    @Inject(Class.SushiPairsTheGraph) private readonly theGraph: SushiPoolsTheGraph,
  ) {}

  async execute(command: AddSushiPoolsCommand): Promise<void> {
    const pairs = await this.theGraph.fetchTopVolumePairs(command.chainId);
    pairs.forEach((pair) => {
      this.repository.save(pair);
    });
  }
}
