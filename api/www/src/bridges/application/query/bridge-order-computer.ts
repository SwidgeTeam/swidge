import { BridgingRequest } from '../../domain/bridging-request';
import { BridgingOrder } from '../../domain/bridging-order';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { HttpClient } from '../../../shared/http/httpClient';
import { Multichain } from '../../domain/providers/multichain';
import { Bridge } from '../../domain/bridge';
import { BridgeProviders } from '../../domain/providers/bridge-providers';
import { CachedHttpClient } from '../../../shared/http/cachedHttpClient';

export class BridgeOrderComputer {
  constructor(
    @Inject(Class.HttpClient) private readonly httpClient: HttpClient,
    @Inject(Class.CachedHttpClient) private readonly cachedHttpClient: CachedHttpClient,
  ) {}

  public async execute(bridgeId: string, request: BridgingRequest): Promise<BridgingOrder> {
    let bridge: Bridge;
    switch (bridgeId) {
      case BridgeProviders.Multichain:
        bridge = new Multichain(this.cachedHttpClient);
        break;
      default:
        throw new Error('unrecognized bridge');
    }
    return await bridge.execute(request);
  }
}
