import { Contract, ethers } from 'ethers';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sushiFactoryAbi = require('./factoryAbi.json');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sushiPairAbi = require('./pairAbi.json');


async function main() {
  const provider = ethers.providers.getDefaultProvider(
    'https://eth-mainnet.gateway.pokt.network/v1/5f3453978e354ab992c4da79',
  );

  const sushiFactoryAddress = '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac';

  const sushiPairFactory = new Contract(
    sushiFactoryAddress,
    sushiFactoryAbi,
    provider,
  );

  const allPairsLength = await sushiPairFactory.functions.allPairsLength();
  const allPairs = await sushiPairFactory.functions.allPairs('0x00');

  console.log(allPairs);

  const sushiPair = new Contract(
      allPairs,
      sushiPairAbi,
      provider,
  );

  const token0 = await sushiPair.functions.token0();

  console.log(token0);

}

main();
