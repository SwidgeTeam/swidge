import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SushiPairsRepository } from '../../domain/sushi-pairs-repository';
import { SushiPair } from '../../domain/sushi-pair';
import { BigInteger } from '../../../shared/domain/BigInteger';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { HttpClient } from '../../../shared/http/httpClient';
import { GraphPair, theGraphEndpoints } from '../../domain/providers/sushiswap';
import { Token } from '../../../shared/domain/Token';
import { ethers } from 'ethers';
import { AddSushiPairCommand } from './add-sushi-pair.command';
import { randomUUID } from 'crypto';

@CommandHandler(AddSushiPairCommand)
export class AddSushiPairHandler implements ICommandHandler<AddSushiPairCommand> {
  constructor(
    @Inject(Class.SushiPairsRepository) private readonly repository: SushiPairsRepository,
    @Inject(Class.HttpClient) private readonly httpClient: HttpClient,
  ) {}

  async execute(command: AddSushiPairCommand): Promise<void> {
    const pair = await this.fetchPair(command.chainId, command.token0, command.token1);
    this.repository.save(pair);
  }

  private async fetchPair(chainId: string, token0: string, token1: string) {
    const result = await this.httpClient.post<{
      data: {
        pairs: GraphPair[];
      };
    }>(theGraphEndpoints[chainId], {
      query: `
        {
          pairs(
            where: {
              token0: "${token0}"
              token1: "${token1}"
            }
          ) {
            name
            token0 {
              id
              name
              decimals
              symbol
            }
            token1 {
              id
              name
              decimals
              symbol
            }
            reserve0
            reserve1
          }
        }`,
    });

    const row = result.data.pairs[0];

    const t0 = new Token(
      row.token0.name,
      ethers.utils.getAddress(row.token0.id),
      Number(row.token0.decimals),
      row.token0.symbol,
    );
    const t1 = new Token(
      row.token1.name,
      ethers.utils.getAddress(row.token1.id),
      Number(row.token1.decimals),
      row.token1.symbol,
    );

    const reserve0 = BigInteger.fromDecimal(row.reserve0, t0.decimals);
    const reserve1 = BigInteger.fromDecimal(row.reserve1, t1.decimals);

    return new SushiPair(randomUUID(), chainId, t0, t1, reserve0, reserve1);
  }
}
