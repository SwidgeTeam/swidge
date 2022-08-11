import { SwapRequest } from '../SwapRequest';
import { SwapOrder } from '../SwapOrder';
import { Avalanche, BSC, Fantom, Mainnet, Polygon, Optimism } from '../../../shared/enums/ChainIds';
import { ContractAddress } from '../../../shared/types';
import { InsufficientLiquidity } from '../InsufficientLiquidity';
import { AbiEncoder } from '../../../shared/domain/CallEncoder';
import { BigInteger } from '../../../shared/domain/BigInteger';
import { Exchange } from '../exchange';
import { HttpClient } from '../../../shared/infrastructure/http/httpClient';
import { ExchangeProviders } from './exchange-providers';

export class ZeroEx implements Exchange {
  private readonly enabledChains: string[];

  constructor(private readonly httpClient: HttpClient) {
    this.enabledChains = [Mainnet, Polygon, Fantom, BSC, Avalanche, Optimism];
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
      [Optimism]: 'https://optimism.api.0x.org',
    };

    const slippage = request.slippage / 100;

    const response = await this.httpClient
      .get<{
        to: ContractAddress;
        allowanceTarget: ContractAddress;
        data: string;
        buyAmount: string;
        guaranteedPrice: string;
        gas: string;
      }>(
        `${urls[request.chainId]}/swap/v1/quote` +
          `?sellToken=${request.tokenIn.address}` +
          `&buyToken=${request.tokenOut.address}` +
          `&sellAmount=${request.amountIn.toString()}` +
          `&slippagePercentage=${slippage.toString()}`,
      )
      .catch((error) => {
        // TODO : check error type
        throw new InsufficientLiquidity();
      });

    const expectedAmountOut = BigInteger.fromString(response.buyAmount);
    const estimatedGas = BigInteger.fromString(response.gas);

    const encodedAddress = AbiEncoder.encodeFunctionArguments(['address'], [response.to]);
    const encodedData = AbiEncoder.concatBytes([encodedAddress, response.data]);

    const minPrice = BigInteger.fromDecimal(response.guaranteedPrice, request.tokenIn.decimals);
    const minAmountOut = minPrice.times(request.amountIn);
    const worstCaseAmountOut = minPrice.times(request.minAmountIn);

    return new SwapOrder(
      ExchangeProviders.ZeroEx,
      request.tokenIn,
      request.tokenOut,
      encodedData,
      request.amountIn,
      expectedAmountOut,
      minAmountOut,
      worstCaseAmountOut,
      estimatedGas,
    );
  }
}
