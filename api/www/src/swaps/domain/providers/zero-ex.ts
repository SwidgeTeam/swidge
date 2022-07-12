import { SwapRequest } from '../SwapRequest';
import { SwapOrder } from '../SwapOrder';
import { Avalanche, BSC, Fantom, Mainnet, Polygon } from '../../../shared/enums/ChainIds';
import { ContractAddress } from '../../../shared/types';
import { InsufficientLiquidity } from '../InsufficientLiquidity';
import { AbiEncoder } from '../../../shared/domain/CallEncoder';
import { BigInteger } from '../../../shared/domain/BigInteger';
import { BigNumber } from 'ethers';
import { Exchange } from '../exchange';
import { HttpClient } from '../../../shared/http/httpClient';
import { ExchangeProviders } from './exchange-providers';

export class ZeroEx implements Exchange {
  private readonly enabledChains: string[];

  public static create(httpClient: HttpClient) {
    return new ZeroEx(httpClient);
  }

  constructor(private readonly httpClient: HttpClient) {
    this.enabledChains = [Mainnet, Polygon, Fantom, BSC, Avalanche];
  }

  public isEnabledOn(chainId: string): boolean {
    return this.enabledChains.includes(chainId);
  }

  async execute(request: SwapRequest): Promise<SwapOrder> {
    const urls = {
      [Polygon]: 'https://polygon.api.0x.org',
      [Fantom]: 'https://fantom.api.0x.org',
      [BSC]: 'https://bsc.api.0x.org',
      [Avalanche]: 'https://avalanche.api.0x.org',
    };

    const response = await this.httpClient
      .get<{
        to: ContractAddress;
        allowanceTarget: ContractAddress;
        data: string;
        buyAmount: string;
        gas: string;
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

    const encodedAddress = AbiEncoder.encodeFunctionArguments(['address'], [response.to]);

    const encodedData = AbiEncoder.concatBytes([encodedAddress, response.data]);

    return new SwapOrder(
      ExchangeProviders.ZeroEx,
      request.tokenIn,
      request.tokenOut,
      response.allowanceTarget,
      encodedData,
      BigInteger.fromBigNumber(response.buyAmount),
      BigNumber.from(response.gas),
      true,
    );
  }
}
