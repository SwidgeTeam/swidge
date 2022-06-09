import { Inject } from '@nestjs/common';
import { HttpClient } from '../../../shared/http/httpClient';
import { Class } from '../../../shared/Class';
import { SwapRequest } from '../../domain/SwapRequest';
import { SwapOrder } from '../../domain/SwapOrder';
import { BigInteger } from '../../../shared/domain/BigInteger';
import { Fantom, Polygon } from '../../../shared/enums/ChainIds';
import { ContractAddress } from '../../../shared/types';
import { InsufficientLiquidity } from '../../domain/InsufficientLiquidity';
import { AbiEncoder } from '../../../shared/domain/CallEncoder';

export class GetSwapOrder {
  constructor(
    @Inject(Class.HttpClient) private readonly httpClient: HttpClient,
  ) {}

  async execute(request: SwapRequest): Promise<SwapOrder> {
    const urls = {
      [Polygon]: 'https://polygon.api.0x.org',
      [Fantom]: 'https://fantom.api.0x.org',
    };

    const response = await this.httpClient
      .get<{
        to: ContractAddress;
        allowanceTarget: ContractAddress;
        data: string;
        buyAmount: string;
      }>(
        `${urls[request.chainId]}/swap/v1/quote` +
          `?sellToken=${request.tokenIn.address}` +
          `&buyToken=${request.tokenOut.address}` +
          `&sellAmount=${request.amountIn.toString()}`,
      )
      .catch((error) => {
        // TODO : check error type
        throw new InsufficientLiquidity();
      });

    const encodedAddress = AbiEncoder.encodeFunctionArguments(
      ['address'],
      [response.to],
    );

    const encodedData = AbiEncoder.concatBytes([encodedAddress, response.data]);

    return new SwapOrder(
      0,
      request.tokenIn,
      request.tokenOut,
      response.allowanceTarget,
      encodedData,
      BigInteger.fromBigNumber(response.buyAmount),
      true,
    );
  }
}
