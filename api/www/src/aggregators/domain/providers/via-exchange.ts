import { AggregatorRequest } from '../aggregator-request';
import { IHttpClient } from '../../../shared/domain/http/IHttpClient';
import { Via } from '@viaprotocol/router-sdk';
import { ethers } from 'ethers';

export class ViaExchange {
  private enabledChains: string[];
  private client: Via;

  constructor() {
    this.enabledChains = [];
    const DEFAULT_API_KEY = 'e3db93a3-ae1c-41e5-8229-b8c1ecef5583';
    this.client = new Via({
      apiKey: DEFAULT_API_KEY,
      url: 'https://router-api.via.exchange',
      timeout: 30000,
    });
  }

  isEnabledOn(fromChainId: string, toChainId: string): boolean {
    return this.enabledChains.includes(fromChainId) && this.enabledChains.includes(toChainId);
  }

  /**
   * Entrypoint to quote a Route from Socket.tech
   * @param request
   */
  async execute(request: AggregatorRequest) {
    const baseParams = {
      fromChainId: Number(request.fromChain),
      fromTokenAddress: request.fromToken.address,
      fromAmount: Math.pow(10, 18),
      toChainId: Number(request.toChain),
      toTokenAddress: request.toToken.address,
      fromAddress: '0xc99F374E96Fb1c2eEAFe92596bEd04aa1397971c', // might be null
      toAddress: '0xc99F374E96Fb1c2eEAFe92596bEd04aa1397971c', // might be null
      multiTx: false, // whether to return routes with multiple user transactions
      offset: 0,
      limit: 1,
    };

    //const response = await this.client.getRoutes(baseParams);
    //console.log(response.routes[0].actions[0].steps);

    try {
      //console.log(response.routes[0].routeId);

      const txApproval = await this.client.buildApprovalTx({
        routeId: 'e805a720-6b84-4883-b597-c92fb91763ef',
        owner: '0xa640E24a40adD20eF5605dA21C860EAC098a29Cc',
        numAction: 0,
      });

      console.log(txApproval);

      const tx = await this.client.buildTx({
        routeId: 'e805a720-6b84-4883-b597-c92fb91763ef',
        fromAddress: '0xa640E24a40adD20eF5605dA21C860EAC098a29Cc',
        receiveAddress: '0xa640E24a40adD20eF5605dA21C860EAC098a29Cc',
        numAction: 0,
      });
      console.log(tx);
    } catch (e) {
      console.log(e);
    }
  }
}
