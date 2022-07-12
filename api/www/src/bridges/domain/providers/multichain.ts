import { BridgingRequest } from '../bridging-request';
import { BridgingOrder } from '../bridging-order';
import { Token } from '../../../shared/domain/Token';
import { BridgingFees } from '../BridgingFees';
import { BigInteger } from '../../../shared/domain/BigInteger';
import { BridgingLimits } from '../BridgingLimits';
import { AmountTooBig } from '../AmountTooBig';
import { AmountTooSmall } from '../AmountTooSmall';
import { AbiEncoder } from '../../../shared/domain/CallEncoder';
import { Bridge } from '../bridge';
import { CachedHttpClient } from '../../../shared/http/cachedHttpClient';
import { Avalanche, BSC, Fantom, Mainnet, Polygon } from '../../../shared/enums/ChainIds';

interface DestToken {
  SwapFeeRatePerMillion: number;
  BigValueThreshold: string;
  MaximumSwapFee: string;
  MinimumSwapFee: string;
  MinimumSwap: string;
  MaximumSwap: string;
  underlying: {
    address: string;
    name: string;
    decimals: number;
  };
}

interface TokenDetails {
  anyToken: {
    address: string;
  };
  destChains: DestToken[];
}

export class Multichain implements Bridge {
  private enabledChains;

  static create(cachedHttpClient: CachedHttpClient) {
    return new Multichain(cachedHttpClient);
  }

  constructor(private readonly httpClient: CachedHttpClient) {
    this.enabledChains = [Mainnet, Polygon, Fantom, BSC, Avalanche];
  }

  public isEnabledOn(fromChainId: string, toChainId: string): boolean {
    return this.enabledChains.includes(fromChainId) && this.enabledChains.includes(toChainId);
  }

  public async execute(request: BridgingRequest): Promise<BridgingOrder> {
    // Query and filter the details of the bridging token pair
    const tokenIn = request.tokenIn;
    const tokenInDetails = await this.getTokenDetails(request.fromChainId, tokenIn);
    const tokenOutDetails = tokenInDetails.destChains[request.toChainId];

    // Construct destination receiving Token
    const tokenOut = new Token(
      tokenOutDetails.underlying.name,
      tokenOutDetails.underlying.address,
      tokenOutDetails.underlying.decimals,
    );

    // Construct the object holding fees of the bridging process
    const fees = new BridgingFees(
      Number(tokenOutDetails.SwapFeeRatePerMillion),
      BigInteger.fromDecimal(tokenOutDetails.MaximumSwapFee, tokenOut.decimals),
      BigInteger.fromDecimal(tokenOutDetails.MinimumSwapFee, tokenOut.decimals),
      tokenOut.decimals,
    );

    // Construct the object holding the limits of the bridge
    const limits = new BridgingLimits(
      BigInteger.fromDecimal(tokenOutDetails.MinimumSwap, tokenOut.decimals),
      BigInteger.fromDecimal(tokenOutDetails.MaximumSwap, tokenOut.decimals),
      BigInteger.fromDecimal(tokenOutDetails.BigValueThreshold, tokenOut.decimals),
      tokenOut.decimals,
    );

    // Check if the amount reaching the bridge is in the limits
    if (
      request.amount
        .convertDecimalsFromTo(tokenIn.decimals, tokenOut.decimals)
        .greaterThan(limits.maximumAmount)
    ) {
      throw new AmountTooBig();
    }
    if (
      request.amount
        .convertDecimalsFromTo(tokenIn.decimals, tokenOut.decimals)
        .lessThan(limits.minimumAmount)
    ) {
      throw new AmountTooSmall();
    }

    // Encode the specific data needed by the bridge
    // Anyswap needs the address of their own anyToken representation
    const anyTokenAddress = tokenInDetails.anyToken.address;
    const encodedData = AbiEncoder.encodeFunctionArguments(['address'], [anyTokenAddress]);

    // Construct the order
    return new BridgingOrder(
      request.amount,
      tokenIn,
      tokenOut,
      request.toChainId,
      encodedData,
      fees,
      limits,
      true,
    );
  }

  private async getTokenDetails(fromChainId: string, sourceToken: Token): Promise<TokenDetails> {
    // Obtain full list of tokens available to swap on this chain
    const tokenList = await this.httpClient.get(
      `https://bridgeapi.anyswap.exchange/v3/serverinfoV3?chainId=${fromChainId}&version=STABLEV3`,
    );
    // Return details of `sourceToken` in `toChainId`
    return tokenList[sourceToken.address.toLowerCase()];
  }
}
