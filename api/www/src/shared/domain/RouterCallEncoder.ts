import { SwapOrder } from '../../swaps/domain/SwapOrder';
import { BridgingOrder } from '../../bridges/domain/bridging-order';
import { BigInteger } from './BigInteger';
import { ethers } from 'ethers';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const abi = require('../ABI/router.json');

export class RouterCallEncoder {
  public encode(
    amountIn: BigInteger,
    originSwap: SwapOrder,
    bridge: BridgingOrder,
    destinationSwap: SwapOrder,
  ): string {
    const abiInterface = new ethers.utils.Interface(abi);
    const encodedSelector = abiInterface.getSighash('initSwidge');

    const encodedArguments = ethers.utils.defaultAbiCoder.encode(
      [
        'uint256',
        'tuple(uint8,address,address,bytes,bool)',
        'tuple(address,uint256,bytes,bool)',
        'tuple(address,address)',
      ],
      [
        amountIn.toString(),
        [
          originSwap.providerCode,
          originSwap.tokenIn.address,
          originSwap.tokenOut.address,
          originSwap.data,
          originSwap.required,
        ],
        [bridge.tokenIn.address, bridge.toChainId, bridge.data, bridge.required],
        [destinationSwap.tokenIn.address, destinationSwap.tokenOut.address],
      ],
    );

    return ethers.utils.hexConcat([encodedSelector, encodedArguments]);
  }
}
