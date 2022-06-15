import {
  Token,
  CurrencyAmount,
  ChainId,
  JSBI,
  Trade,
  Pair,
  Router,
  Percent, Route,
} from '@sushiswap/sdk';

async function main() {
  const WETH = new Token(
    1,
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    18,
    'WETH',
    'Wrapped Ether',
  );

  const USDC = new Token(
    ChainId.MAINNET,
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    6,
    'USDC',
    'USD//C',
  );

  const typedValueParsed = '100000000000000000000';
  const wethAmount = CurrencyAmount.fromRawAmount(
    WETH,
    JSBI.BigInt(typedValueParsed),
  );

  const usdcAmount = CurrencyAmount.fromRawAmount(
    USDC,
    JSBI.BigInt(typedValueParsed),
  );

  //const router = new AlphaRouter({ chainId: 1, provider: web3Provider });

  //Router.swapCallParameters()

  const pair = new Pair(wethAmount, usdcAmount);

  //console.log(pair.getInputAmount(wethAmount));
  console.log(pair.getOutputAmount(wethAmount));
  console.log('--');
  //console.log(pair.getInputAmount(usdcAmount));
  console.log(pair.getOutputAmount(usdcAmount));
  console.log('--');
  console.log(pair.reserve0);
  console.log(pair.reserve1);

  const route = new Route();

  const trade = Trade.bestTradeExactIn([pair], wethAmount, USDC);
  const trade2 = Trade.exactIn(route, wethAmount);

  const call = Router.swapCallParameters(trade[0], {
    ttl: 50,
    recipient: '0x0000000000000000000000000000000000000004',
    allowedSlippage: new Percent('1', '100'),
  });

  console.log(call);

  //const route = await router.route(wethAmount, USDC, TradeType.EXACT_INPUT, {
  //  recipient: myAddress,
  //  slippageTolerance: new Percent(5, 100),
  //  deadline: Math.floor(Date.now() / 1000 + 1800),
  //});
}

main();
