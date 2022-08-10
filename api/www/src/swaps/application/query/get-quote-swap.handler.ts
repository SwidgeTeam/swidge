import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetQuoteSwapQuery } from './get-quote-swap.query';
import { SwapRequest } from '../../domain/SwapRequest';
import { BigInteger } from '../../../shared/domain/BigInteger';
import { SwapOrder } from '../../domain/SwapOrder';
import { Inject } from '@nestjs/common';
import { TokenDetailsFetcher } from '../../../shared/infrastructure/TokenDetailsFetcher';
import { Class } from '../../../shared/Class';
import { ZeroEx } from '../../domain/providers/zero-ex';
import { HttpClient } from '../../../shared/infrastructure/http/httpClient';

@QueryHandler(GetQuoteSwapQuery)
export class GetQuoteSwapHandler implements IQueryHandler<GetQuoteSwapQuery> {
  constructor(
    @Inject(Class.HttpClient) private readonly httpClient: HttpClient,
    @Inject(Class.TokenDetailsFetcher) private readonly tokenDetailsFetcher: TokenDetailsFetcher,
  ) {}

  async execute(query: GetQuoteSwapQuery): Promise<SwapOrder> {
    const srcToken = await this.tokenDetailsFetcher.fetch(query.srcToken, query.chainId);
    const dstToken = await this.tokenDetailsFetcher.fetch(query.dstToken, query.chainId);
    const request = new SwapRequest(
      query.chainId,
      srcToken,
      dstToken,
      BigInteger.fromString(query.amount),
      query.slippage,
    );

    const exchange = new ZeroEx(this.httpClient);

    return await exchange.execute(request);
  }
}
