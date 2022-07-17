import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateSushiPairsCommand } from './update-sushi-pairs.command';
import { SushiPairsRepository } from '../../domain/sushi-pairs-repository';
import { SushiPair } from '../../domain/sushi-pair';
import { BigInteger } from '../../../shared/domain/BigInteger';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { HttpClient } from '../../../shared/http/httpClient';
import { GraphPair, theGraphEndpoints } from '../../domain/providers/sushiswap';

@CommandHandler(UpdateSushiPairsCommand)
export class UpdateSushiPairsHandler implements ICommandHandler<UpdateSushiPairsCommand> {
  constructor(
    @Inject(Class.SushiPairsRepository) private readonly repository: SushiPairsRepository,
    @Inject(Class.HttpClient) private readonly httpClient: HttpClient,
  ) {}

  async execute(): Promise<void> {
    const pairs = await this.repository.getAllPairs();

    for (const pair of pairs.items<SushiPair[]>()) {
      await this.updateReserves(pair);
    }
  }

  private async updateReserves(pair: SushiPair) {
    const updatedPair = await this.fetchUpdatedPair(pair);
    this.repository.update(updatedPair);
  }

  private async fetchUpdatedPair(pair: SushiPair) {
    const result = await this.httpClient.post<{
      data: {
        pairs: GraphPair[];
      };
    }>(theGraphEndpoints[pair.chainId], {
      query: `
        {
          pairs(
            where: {
              token0: "${pair.token0.address.toLowerCase()}"
              token1: "${pair.token1.address.toLowerCase()}"
            }
          ) {
            reserve0
            reserve1
          }
        }`,
    });

    const data = result.data.pairs[0];

    const reserve0 = BigInteger.fromDecimal(data.reserve0, pair.token0.decimals);
    const reserve1 = BigInteger.fromDecimal(data.reserve1, pair.token1.decimals);

    pair.updateReserve0(reserve0);
    pair.updateReserve1(reserve1);

    return pair;
  }
}
