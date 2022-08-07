import { Aggregator } from '../aggregator';
import { AggregatorOrder } from '../aggregator-order';
import { AggregatorRequest } from '../aggregator-request';
import LIFI from '@lifi/sdk';
import { Fantom, Polygon } from '../../../shared/enums/ChainIds';
import { BigInteger } from '../../../shared/domain/BigInteger';

export class LiFi implements Aggregator {
  private enabledChains: string[];
  private client: LIFI;

  static create() {
    return new LiFi();
  }

  constructor() {
    this.enabledChains = [Polygon, Fantom];
    this.client = new LIFI();
  }

  isEnabledOn(fromChainId: string, toChainId: string): boolean {
    return this.enabledChains.includes(fromChainId) && this.enabledChains.includes(toChainId);
  }

  async execute(request: AggregatorRequest): Promise<AggregatorOrder> {
    const response = await this.client.getQuote({
      fromChain: request.fromChain,
      fromToken: request.fromToken.address,
      toChain: request.toChain,
      toToken: request.toToken.address,
      fromAmount: request.amountIn.toString(),
      fromAddress: '0x0000000000000000000000000000000000000000',
    });

    return new AggregatorOrder(
      response.transactionRequest.to,
      response.transactionRequest.data.toString(),
      BigInteger.fromString(response.transactionRequest.value.toString()),
      BigInteger.fromString(response.transactionRequest.gasLimit.toString()),
      BigInteger.fromString(response.transactionRequest.gasPrice.toString()),
    );
  }
}
