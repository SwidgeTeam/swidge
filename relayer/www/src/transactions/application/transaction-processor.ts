import { RouterCaller, FinalizeCrossParams } from './router-caller';
import { Inject, Injectable } from '@nestjs/common';
import { Class } from '../../shared/Class';
import { RpcNode } from '../../shared/RpcNode';
import {
  SwapRequest,
  TransactionsRepository,
} from '../domain/TransactionsRepository';
import { TransactionJob } from '../domain/TransactionJob';
import { CustomLogger } from '../../logger/CustomLogger';
import { ethers } from 'ethers';
import { PriceFeeds } from '../../shared/PriceFeeds';
import { NativeToken } from '../../shared/Tokens';
import aggregatorV3InterfaceABI from '../../shared/ABI/PriceFeed.json';
import IERC20ABI from '../../shared/ABI/IERC20.json';

@Injectable()
export class TransactionProcessor {
  constructor(
    private readonly logger: CustomLogger,
    private readonly routerCaller: RouterCaller,
    @Inject(Class.TransactionsRepository)
    private readonly transactionRepository: TransactionsRepository,
  ) {}

  async execute(job: TransactionJob) {
    this.logger.log('Received job ', job);

    let swapDetails;
    if (job.srcToken === job.dstToken) {
      // If final token is same than the received, no swap required
      swapDetails = await this.getNoSwapDetails(job);
    } else {
      swapDetails = await this.getSwapDetails(job);
    }

    const rpc = RpcNode[job.toChainId];
    const provider = new ethers.providers.JsonRpcProvider(rpc);

    // Compute cost of TX in Wei
    const feeData = await provider.getFeeData();
    const feeInWei = feeData.gasPrice.mul(swapDetails.estimatedGas);

    // Get decimals of token to subtract fee
    const token = new ethers.Contract(job.srcToken, IERC20ABI, provider);
    const feeTokenDecimals = await token.decimals();

    // Get price of native token
    const feedAddress = PriceFeeds[job.toChainId][NativeToken][job.srcToken];
    const priceFeed = new ethers.Contract(
      feedAddress,
      aggregatorV3InterfaceABI,
      provider,
    );
    const price = await priceFeed.latestRoundData().answer;
    const quotedTokenDecimals = await priceFeed.decimals();

    // Convert native Wei to the token received by the contract
    const wholeUnit = ethers.utils.parseEther('1');
    const timesToWholeUnit = wholeUnit.div(feeInWei);
    const feeInUSD = price.div(timesToWholeUnit);

    const receivedTokenWeiAmount =
      feeInUSD.toNumber() / 10 ** (quotedTokenDecimals - feeTokenDecimals);

    const fee = Math.round(receivedTokenWeiAmount);

    // Execute transaction
    const params: FinalizeCrossParams = {
      rpcNode: rpc,
      routerAddress: job.router,
      receiverAddress: job.walletAddress,
      txHash: job.txHash,
      fee: fee.toString(),
      swap: swapDetails,
    };

    this.logger.log('Calling contract w/ ', params);

    await this.routerCaller.call(params);

    this.logger.log('Tx executed');
  }

  /**
   * Compute swap details for contract call when no swap required
   * @param job
   * @private
   */
  private async getNoSwapDetails(job: TransactionJob) {
    const estimatedGas = this.getFunctionEstimateGas();
    return {
      providerCode: null,
      amountIn: job.bridgeAmountOut,
      tokenIn: job.srcToken,
      tokenOut: job.dstToken,
      estimatedGas: estimatedGas,
      data: '0x',
      required: false,
    };
  }

  /**
   * Computes the swap details given the job
   * @param job
   * @private
   */
  private async getSwapDetails(job: TransactionJob) {
    const swapOrder = await this.transactionRepository.quoteSwap(<SwapRequest>{
      chainId: job.toChainId,
      tokenIn: job.srcToken,
      tokenOut: job.dstToken,
      amountIn: job.bridgeAmountOut,
    });

    const fixGas = this.getFunctionEstimateGas();
    const estimatedGas = fixGas + swapOrder.estimatedGas;

    return {
      providerCode: swapOrder.providerCode,
      amountIn: job.bridgeAmountOut,
      tokenIn: swapOrder.tokenIn,
      tokenOut: swapOrder.tokenOut,
      estimatedGas: estimatedGas,
      data: swapOrder.data,
      required: swapOrder.required,
    };
  }

  private getFunctionEstimateGas() {
    return 500000;
  }
}
