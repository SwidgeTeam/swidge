import axios from 'axios';
import { AnyswapTransaction } from '../domain/AnyswapTransaction';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MultichainTransactionFetcher {
  public async execute(txHash: string): Promise<AnyswapTransaction> {
    const response = await axios
      .get(
        `https://bridgeapi.anyswap.exchange/v2/history/details?params=${txHash}`,
      )
      .then((response) => response.data);

    const data = response.info;

    if (!data) {
      return null;
    }

    return new AnyswapTransaction(
      data._id,
      data.from,
      data.txto,
      data.fromChainID,
      data.toChainID,
      data.value,
      data.swapvalue,
      data.txid,
      data.swaptx,
      data.status,
    );
  }
}
