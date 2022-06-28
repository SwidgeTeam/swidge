import { ethers } from 'ethers';
import { Inject } from '@nestjs/common';
import { Class } from '../../shared/Class';
import { ContractAddress } from '../../shared/types';
import { RpcNode } from '../../shared/RpcNode';
import {
  TransactionsRepository,
  UpdateTransactionPayload,
} from '../../transactions/domain/TransactionsRepository';
import { CustomLogger } from '../../logger/CustomLogger';
import { ConfigService } from '../../config/config.service';
import { hexZeroPad } from 'ethers/lib/utils';

export class MultichainListener {
  private routerAddress: ContractAddress;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: CustomLogger,
    @Inject(Class.TransactionsRepository)
    private readonly transactionsRepository: TransactionsRepository,
  ) {
  }

  public async execute() {
    this.routerAddress = await this.transactionsRepository.getRouterAddress();
    const multichainRouters =
      await this.transactionsRepository.getMultichainRouters();

    if (!this.routerAddress) {
      this.logger.error('No router address');
      throw new Error('No router address');
    }

    multichainRouters.forEach((contract) => {
      const rpcUrl = RpcNode[contract.chainId];
      if (rpcUrl) {
        this.setListener(rpcUrl, contract.address);
      }
    });
  }

  private setListener(rpcUrl: string, contractAddress: ContractAddress) {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    this.logger.log('listening ' + contractAddress + ' through ' + rpcUrl);

    /**
     * event LogAnySwapIn(
     *   bytes32 indexed txhash,
     *   address indexed token,
     *   address indexed to,
     *   uint256 amount,
     *   uint256 fromChainID,
     *   uint256 toChainID,
     * )
     */

    const filter = {
      address: contractAddress,
      topics: [
        ethers.utils.id(
          'LogAnySwapIn(bytes32,address,address,uint256,uint256,uint256)',
        ),
        null,
        null,
        hexZeroPad(this.routerAddress, 32),
      ],
    };

    provider.on(filter, async (event) => {
      const [amount] = ethers.utils.defaultAbiCoder.decode(
        ['uint256'],
        event.data,
      );
      const originTxHash = event.topics[1];
      await this.updateTransaction({
        txHash: originTxHash,
        bridged: new Date(),
        bridgeAmountOut: amount.toString(),
      }).catch((error) => {
        this.logger.log('Error updating tx', error);
      });
    });
  }

  private updateTransaction(payload: UpdateTransactionPayload): Promise<void> {
    this.logger.log('Update transaction', payload);
    return this.transactionsRepository.update(payload);
  }
}
