import { Inject } from '@nestjs/common';
import { HttpClient } from '../../../shared/http/httpClient';
import { Class } from '../../../shared/Class';
import { SwapRequest } from '../../domain/SwapRequest';
import { SwapOrder } from '../../domain/SwapOrder';
import { Exchange } from '../../domain/exchange';
import { ExchangeProviders } from '../../domain/providers/exchange-providers';
import { ZeroEx } from '../../domain/providers/zero-ex';
import { Sushiswap } from '../../domain/providers/sushiswap';
import { CachedHttpClient } from '../../../shared/http/cachedHttpClient';
import { SushiPairsRepository } from '../../domain/sushi-pairs-repository';

export class SwapOrderComputer {
  private readonly zeroEx: ZeroEx;
  private readonly sushi: Sushiswap;

  constructor(
    @Inject(Class.HttpClient) private readonly httpClient: HttpClient,
    @Inject(Class.CachedHttpClient) private readonly cachedHttpClient: CachedHttpClient,
    @Inject(Class.SushiPairsRepository) private readonly sushiPairsRepository: SushiPairsRepository,
  ) {
    this.zeroEx = ZeroEx.create(this.httpClient);
    this.sushi = Sushiswap.create(this.cachedHttpClient, sushiPairsRepository);
  }

  async execute(exchangeId: string, request: SwapRequest): Promise<SwapOrder> {
    let exchange: Exchange;
    switch (exchangeId) {
      case ExchangeProviders.ZeroEx:
        exchange = this.zeroEx;
        break;
      case ExchangeProviders.Sushi:
        exchange = this.sushi;
        break;
      default:
        throw new Error('unrecognized exchange');
    }
    return await exchange.execute(request);
  }

  getEnabledExchanged(chainId: string) {
    const enabled = [];
    if (this.zeroEx.isEnabledOn(chainId)) {
      enabled.push(ExchangeProviders.ZeroEx);
    }
    if (this.sushi.isEnabledOn(chainId)) {
      enabled.push(ExchangeProviders.Sushi);
    }
    return enabled;
  }
}
