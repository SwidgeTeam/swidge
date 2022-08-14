import { SwapRequest } from '../swap-request';
import { SwapOrder } from '../swap-order';
import { Avalanche, BSC, Fantom, Mainnet, Polygon, Optimism } from '../../../shared/enums/ChainIds';
import { ContractAddress } from '../../../shared/types';
import { InsufficientLiquidity } from '../insufficient-liquidity';
import { AbiEncoder } from '../../../shared/domain/call-encoder';
import { BigInteger } from '../../../shared/domain/big-integer';
import { Exchange } from '../exchange';
import { ExchangeProviders } from './exchange-providers';
import { IHttpClient } from '../../../shared/domain/http/IHttpClient';

export class ZeroEx implements Exchange {
  private readonly enabledChains: string[];

  constructor(private readonly httpClient: IHttpClient) {
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
      }>(`${urls[request.chainId]}/swap/v1/quote`, {
        params: {
          sellToken: request.tokenIn.address,
          buyToken: request.tokenOut.address,
          sellAmount: request.amountIn.toString(),
          slippagePercentage: slippage.toString(),
        },
      })
      .catch((error) => {
        // TODO : check error type
        throw new InsufficientLiquidity();
      });

    const expectedAmountOut = BigInteger.fromString(response.buyAmount);
    const estimatedGas = BigInteger.fromString(response.gas);

    const encodedAddress = AbiEncoder.encodeFunctionArguments(['address'], [response.to]);
    const encodedData = AbiEncoder.concatBytes([encodedAddress, response.data]);

    const minPrice = BigInteger.fromDecimal(
      Number(response.guaranteedPrice).toFixed(request.tokenIn.decimals),
      request.tokenIn.decimals,
    );

    const minAmountOut = this.operateOutputAmount(
      request.amountIn,
      minPrice,
      request.tokenIn.decimals,
      request.tokenOut.decimals,
    );

    const worstCaseAmountOut = this.operateOutputAmount(
      request.minAmountIn,
      minPrice,
      request.tokenIn.decimals,
      request.tokenOut.decimals,
    );

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

  /**
   * Operates an amount and the price to obtain the output amount
   * @param inputAmount
   * @param price
   * @param decimalsIn
   * @param decimalsOut
   * @private
   */
  private operateOutputAmount(
    inputAmount: BigInteger,
    price: BigInteger,
    decimalsIn: number,
    decimalsOut: number,
  ): BigInteger {
    const units = BigInteger.fromDecimal('1', decimalsIn);
    return inputAmount.times(price).div(units).convertDecimalsFromTo(decimalsIn, decimalsOut);
  }
}
