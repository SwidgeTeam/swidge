import { SwapOrder } from '../../swaps/domain/SwapOrder';
import { BridgingOrder } from '../../bridges/domain/bridging-order';
import { BigInteger } from './BigInteger';
import { ethers } from 'ethers';

export class RouterCallEncoder {
  public encode(
    amountIn: BigInteger,
    originSwap: SwapOrder,
    bridge: BridgingOrder,
    destinationSwap: SwapOrder,
  ): string {
    const abiInterface = new ethers.utils.Interface([
      {
        inputs: [
          {
            internalType: 'uint256',
            name: '_amount',
            type: 'uint256',
          },
          {
            components: [
              {
                internalType: 'uint8',
                name: 'providerCode',
                type: 'uint8',
              },
              {
                internalType: 'address',
                name: 'tokenIn',
                type: 'address',
              },
              {
                internalType: 'address',
                name: 'tokenOut',
                type: 'address',
              },
              {
                internalType: 'bytes',
                name: 'data',
                type: 'bytes',
              },
              {
                internalType: 'bool',
                name: 'required',
                type: 'bool',
              },
            ],
            internalType: 'struct Router.SwapStep',
            name: '_swapStep',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'address',
                name: 'tokenIn',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'toChainId',
                type: 'uint256',
              },
              {
                internalType: 'bytes',
                name: 'data',
                type: 'bytes',
              },
              {
                internalType: 'bool',
                name: 'required',
                type: 'bool',
              },
            ],
            internalType: 'struct Router.BridgeStep',
            name: '_bridgeStep',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'address',
                name: 'tokenIn',
                type: 'address',
              },
              {
                internalType: 'address',
                name: 'tokenOut',
                type: 'address',
              },
            ],
            internalType: 'struct Router.DestinationSwap',
            name: '_destinationSwap',
            type: 'tuple',
          },
        ],
        name: 'initSwidge',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
      },
    ]);
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
