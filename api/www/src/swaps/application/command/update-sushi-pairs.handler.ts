import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateSushiPairsCommand } from './update-sushi-pairs.command';
import { SushiPairsRepository } from '../../domain/sushi-pairs-repository';
import { SushiPair } from '../../domain/sushi-pair';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { Fantom, Polygon } from '../../../shared/enums/ChainIds';
import { SushiPoolsTheGraph } from '../../infrastructure/theGraph/sushi-pools-the-graph';

@CommandHandler(UpdateSushiPairsCommand)
export class UpdateSushiPairsHandler implements ICommandHandler<UpdateSushiPairsCommand> {
  constructor(
    @Inject(Class.SushiPairsRepository) private readonly repository: SushiPairsRepository,
    @Inject(Class.SushiPairsTheGraph) private readonly theGraph: SushiPoolsTheGraph,
  ) {}

  /**
   * Entrypoint
   */
  async execute(): Promise<void> {
    // Update first the top volume pairs
    await this.updateTopVolumePairs();
    // Look then for outdated pairs
    await this.updateOutdatedPairs();
  }

  /**
   * Fetches and updates the top volume pairs on all chains
   * @private
   */
  private async updateTopVolumePairs() {
    const chains = [Polygon, Fantom];
    for (const chain of chains) {
      const pairs = await this.theGraph.fetchTopVolumePairs(chain);
      pairs.forEach((pair) => {
        this.repository.save(pair);
      });
    }
  }

  /**
   * Updates the existing pairs
   * @private
   */
  private async updateOutdatedPairs(): Promise<void> {
    const pairs = await this.repository.getOutdatedPairs();

    for (const pair of pairs.items<SushiPair[]>()) {
      await this.updateReserves(pair);
    }
  }

  /**
   * Updates details of a specific pair
   * @param pair
   * @private
   */
  private async updateReserves(pair: SushiPair) {
    const updatedPair = await this.theGraph.fetchUpdatedPair(pair);
    this.repository.save(updatedPair);
  }
}
