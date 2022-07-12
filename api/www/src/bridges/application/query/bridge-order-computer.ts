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
  private readonly multichain: Multichain;

  constructor(
    @Inject(Class.HttpClient) private readonly httpClient: HttpClient,
    @Inject(Class.CachedHttpClient) private readonly cachedHttpClient: CachedHttpClient,
  ) {
    this.multichain = Multichain.create(this.cachedHttpClient);
  }

  public async execute(bridgeId: string, request: BridgingRequest): Promise<BridgingOrder> {
    let bridge: Bridge;
    switch (bridgeId) {
      case BridgeProviders.Multichain:
        bridge = this.multichain;
        break;
      default:
        throw new Error('unrecognized bridge');
    }
    return await bridge.execute(request);
  }

  public getEnabledBridges(fromChain: string, toChain: string): string[] {
    const enabled = [];
    if (this.multichain.isEnabledOn(fromChain, toChain)) {
      enabled.push(BridgeProviders.Multichain);
    }
    return enabled;
  }
}
