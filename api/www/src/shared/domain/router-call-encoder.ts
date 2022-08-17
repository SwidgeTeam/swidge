import { SwapOrder } from '../../swaps/domain/swap-order';
import { BridgingOrder } from '../../bridges/domain/bridging-order';
import { BigInteger } from './big-integer';
import { ethers } from 'ethers';

export class RouterCallEncoder {
  /**
   * Encode execution of origin function
   * @param amountIn
   * @param originSwap
   * @param bridge
   * @param destinationSwap
   * @param receiverAddress
   */
  public encodeInitSwidge(
    amountIn: BigInteger,
    originSwap: SwapOrder,
    bridge: BridgingOrder,
    destinationSwap: SwapOrder,
    receiverAddress: string,
  ): string {
    const abiInterface = new ethers.utils.Interface(this.abiInitSwidge());
    const encodedSelector = abiInterface.getSighash('initSwidge');
    const minAmountOut = destinationSwap.required
      ? destinationSwap.worstCaseAmountOut
      : BigInteger.zero();

    const encodedArguments = ethers.utils.defaultAbiCoder.encode(
      [
        'uint256',
        'tuple(uint8,address,address,bytes,bool)',
        'tuple(address,uint256,bytes,bool)',
        'tuple(address,address,address,uint256)',
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
        [
          destinationSwap.tokenIn.address,
          destinationSwap.tokenOut.address,
          receiverAddress,
          minAmountOut.toString(),
        ],
      ],
    );

    return ethers.utils.hexConcat([encodedSelector, encodedArguments]);
  }

  /**
   * Encode execution of destination function
   * @param amountIn
   * @param receiver
   * @param originHash
   * @param destinationSwap
   */
  public encodeFinalizeSwidge(
    amountIn: BigInteger,
    receiver: string,
    originHash: string,
    destinationSwap: SwapOrder,
  ): string {
    const abiInterface = new ethers.utils.Interface(this.abiFinalizeSwidge());
    const encodedSelector = abiInterface.getSighash('finalizeSwidge');

    const encodedArguments = ethers.utils.defaultAbiCoder.encode(
      ['uint256', 'address', 'bytes32', 'tuple(uint8,address,address,bytes,bool)'],
      [
        amountIn.toString(),
        receiver,
        originHash,
        [
          destinationSwap.providerCode,
          destinationSwap.tokenIn.address,
          destinationSwap.tokenOut.address,
          destinationSwap.data,
          destinationSwap.required,
        ],
      ],
    );

    return ethers.utils.hexConcat([encodedSelector, encodedArguments]);
  }

  /**
   * Encode token approval
   * @param spender
   * @param amount
   */
  public encodeApproval(spender: string, amount: BigInteger) {
    const abiInterface = new ethers.utils.Interface(this.abiErc20());
    const encodedSelector = abiInterface.getSighash('approve');

    const encodedArguments = ethers.utils.defaultAbiCoder.encode(
      ['address', 'uint256'],
      [spender, amount.toString()],
    );

    return ethers.utils.hexConcat([encodedSelector, encodedArguments]);
  }

  /**
   * ABI of router's `initSwidge` function
   * @private
   */
  private abiInitSwidge() {
    return [
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
            internalType: 'struct RouterFacet.SwapStep',
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
            internalType: 'struct RouterFacet.BridgeStep',
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
              {
                internalType: 'address',
                name: 'receiver',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'minAmountOut',
                type: 'uint256',
              },
            ],
            internalType: 'struct RouterFacet.CrossPayload',
            name: '_crossPayload',
            type: 'tuple',
          },
        ],
        name: 'initSwidge',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
      },
    ];
  }

  /**
   * ABI of router's `finalizeSwidge` function
   * @private
   */
  private abiFinalizeSwidge() {
    return [
      {
        inputs: [
          {
            internalType: 'uint256',
            name: '_amount',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: '_receiver',
            type: 'address',
          },
          {
            internalType: 'bytes32',
            name: '_originHash',
            type: 'bytes32',
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
            internalType: 'struct RouterFacet.SwapStep',
            name: '_swapStep',
            type: 'tuple',
          },
        ],
        name: 'finalizeSwidge',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
      },
    ];
  }

  /**
   * ABI of IERC20
   * @private
   */
  private abiErc20() {
    return [
      {
        inputs: [],
        name: 'decimals',
        outputs: [
          {
            internalType: 'uint8',
            name: '',
            type: 'uint8',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: 'spender',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
        ],
        outputs: [
          {
            internalType: 'bool',
            name: '',
            type: 'bool',
          },
        ],
        name: 'approve',
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: 'account',
            type: 'address',
          },
        ],
        name: 'balanceOf',
        outputs: [
          {
            internalType: 'uint256',
            name: '',
            type: 'uint256',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: 'owner',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'spender',
            type: 'address',
          },
        ],
        name: 'allowance',
        outputs: [
          {
            internalType: 'uint256',
            name: '',
            type: 'uint256',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
    ];
  }
}
