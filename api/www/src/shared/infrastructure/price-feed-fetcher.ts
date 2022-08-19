import { ethers } from 'ethers';
import { RpcNode } from '../enums/RpcNode';
import { PriceFeeds } from '../PriceFeeds';
import { PriceFeed } from '../domain/price-feed';
import { BigInteger } from '../domain/big-integer';
import { IPriceFeedFetcher } from '../domain/price-feed-fetcher';

export class PriceFeedFetcher implements IPriceFeedFetcher {
  public async fetch(chainId: string): Promise<PriceFeed> {
    const provider = new ethers.providers.JsonRpcProvider(RpcNode[chainId]);
    const feedAddress = PriceFeeds[chainId];

    const priceFeed = new ethers.Contract(
      feedAddress,
      [
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
          inputs: [],
          name: 'description',
          outputs: [
            {
              internalType: 'string',
              name: '',
              type: 'string',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'uint80',
              name: '_roundId',
              type: 'uint80',
            },
          ],
          name: 'getRoundData',
          outputs: [
            {
              internalType: 'uint80',
              name: 'roundId',
              type: 'uint80',
            },
            {
              internalType: 'int256',
              name: 'answer',
              type: 'int256',
            },
            {
              internalType: 'uint256',
              name: 'startedAt',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'updatedAt',
              type: 'uint256',
            },
            {
              internalType: 'uint80',
              name: 'answeredInRound',
              type: 'uint80',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'latestRoundData',
          outputs: [
            {
              internalType: 'uint80',
              name: 'roundId',
              type: 'uint80',
            },
            {
              internalType: 'int256',
              name: 'answer',
              type: 'int256',
            },
            {
              internalType: 'uint256',
              name: 'startedAt',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'updatedAt',
              type: 'uint256',
            },
            {
              internalType: 'uint80',
              name: 'answeredInRound',
              type: 'uint80',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'version',
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
      ],
      provider,
    );

    const decimals = await priceFeed.decimals();
    const lastRound = await priceFeed.latestRoundData();
    const lastPrice = BigInteger.fromBigNumber(lastRound.answer);

    return new PriceFeed(lastPrice, decimals);
  }
}
