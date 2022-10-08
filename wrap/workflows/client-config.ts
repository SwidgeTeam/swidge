import {
  PolywrapClientConfig,
} from "@polywrap/client-js";

import nock from "nock";

export async function getClientConfig(
  defaultConfigs: Partial<PolywrapClientConfig>
): Promise<Partial<PolywrapClientConfig>> {
  for (const request of requests) {
    nock("https://api.swidge.xyz")
      .get(request.url)
      .reply(200, request.reply);
  }

  return defaultConfigs;
}

export const requests = [
  {
    name: "quote",
    url: "/quote" +
      "?srcChain=1" +
      "&dstChain=1" +
      "&srcAsset=0x9798798798798798779798797987987987979799" +
      "&dstAsset=0x0101020202010102030101020201010220010120" +
      "&sender=0x2612Af3A521c2df9EAF28422Ca335b04AdF3ac66" +
      "&receiver=0x2323412312312312312312312312312312312312" +
      "&amountIn=100" +
      "&minAmountOut=90",
    reply: '{"handler": "0x2323412312312312312312312312312312312312", "data": "0x"}',
  }
];
