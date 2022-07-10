import { BridgingRequest } from '../../domain/BridgingRequest';
import { BridgingOrder } from '../../domain/BridgingOrder';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { HttpClient } from '../../../shared/http/httpClient';
import { Multichain } from '../../domain/providers/multichain';
import { Bridge } from '../../domain/bridge';
import { BridgeProviders } from '../../domain/providers/bridge-providers';

export class BridgeOrderComputer {
  constructor(@Inject(Class.HttpClient) private readonly httpClient: HttpClient) {}

  public async execute(bridgeId: string, request: BridgingRequest): Promise<BridgingOrder> {
    let bridge: Bridge;
    switch (bridgeId) {
      case BridgeProviders.Multichain:
        bridge = new Multichain(this.httpClient);
        break;
      default:
        throw new Error('unrecognized bridge');
    }
    return await bridge.execute(request);
  }
}
