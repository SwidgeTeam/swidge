import { BigNumber, ethers } from 'ethers';
import { RpcNode } from '../enums/RpcNode';
import { PriceFeeds } from '../PriceFeeds';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const aggregatorV3InterfaceABI = require('../../shared/ABI/PriceFeed.json');

export class PriceFeedFetcher {
  public async fetch(chainId: string): Promise<BigNumber> {
    const provider = new ethers.providers.JsonRpcProvider(RpcNode[chainId]);
    const feedAddress = PriceFeeds[chainId];

    const priceFeed = new ethers.Contract(
      feedAddress,
      aggregatorV3InterfaceABI,
      provider,
    );

    const lastRound = await priceFeed.latestRoundData();

    return lastRound.answer;
  }
}
