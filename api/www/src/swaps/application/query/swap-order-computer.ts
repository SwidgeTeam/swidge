import { Inject } from '@nestjs/common';
import { HttpClient } from '../../../shared/http/httpClient';
import { Class } from '../../../shared/Class';
import { SwapRequest } from '../../domain/SwapRequest';
import { SwapOrder } from '../../domain/SwapOrder';
import { Exchange } from '../../domain/exchange';
import { ExchangeProviders } from '../../domain/providers/exchange-providers';
import { ZeroEx } from '../../domain/providers/zero-ex';

export class SwapOrderComputer {
  private readonly zeroEx: ZeroEx;

  constructor(@Inject(Class.HttpClient) private readonly httpClient: HttpClient) {
    this.zeroEx = new ZeroEx(this.httpClient);
  }

  async execute(exchangeId: string, request: SwapRequest): Promise<SwapOrder> {
    let exchange: Exchange;
    switch (exchangeId) {
      case ExchangeProviders.ZeroEx:
        exchange = this.zeroEx;
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
    return enabled;
  }
}
