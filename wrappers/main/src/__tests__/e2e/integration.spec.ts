import { PolywrapClient } from "@polywrap/client-js";
import {
  initTestEnvironment,
  stopTestEnvironment,
} from "@polywrap/test-env-js";
import { Swidge_Module } from "../types/wrap";
import path from "path";
import { encode } from "@msgpack/msgpack";
import { createJob, deployQueue, getConfig, mockEndpoint } from "../utils";
import { ethers } from 'ethers';

jest.setTimeout(60000);

describe("Template Wrapper End to End Tests", () => {
  let client: PolywrapClient;
  let wrapperUri: string;

  beforeAll(async () => {
    const dirname: string = path.resolve(__dirname);
    const wrapperPath: string = path.join(dirname, "..", "..", "..");
    wrapperUri = `fs/${wrapperPath}/build`;

    await initTestEnvironment();

    client = new PolywrapClient(getConfig());
  })

  afterAll(async () => {
    await stopTestEnvironment();
  });

  it("should not exec when no jobs", async () => {
    const queueAddress = await deployQueue();

    const gelatoArgs = {
      gasPrice: ethers.utils.parseUnits("100", "gwei").toString(),
      timeStamp: Math.floor(Date.now() / 1000).toString(),
    };

    const { data, error } = await Swidge_Module.checker({
      userArgsBuffer: encode({
        queueAddress: queueAddress
      }),
      gelatoArgsBuffer: encode(gelatoArgs),
    }, client, wrapperUri)

    expect(error).toBeFalsy();
    expect(data?.canExec).toBeFalsy();
    expect(data?.execData).toEqual('');
  });

  it("should exec with right data", async () => {
    const queueAddress = await deployQueue();

    await createJob(queueAddress, [
      '0xfc3838689ce844438ff358bd41f403f8',
      '0x2323412312312312312312312312312312312312',
      '0x9798798798798798779798797987987987979799',
      '0x0101020202010102030101020201010220010120',
      1,
      100,
      90,
    ]);

    mockEndpoint(
      "https://api.swidge.xyz",
      "/quote" +
      "?srcChain=1" +
      "&dstChain=1" +
      "&srcAsset=0x9798798798798798779798797987987987979799" +
      "&dstAsset=0x0101020202010102030101020201010220010120" +
      "&sender=0x2612Af3A521c2df9EAF28422Ca335b04AdF3ac66" +
      "&receiver=0x2323412312312312312312312312312312312312" +
      "&amountIn=100" +
      "&minAmountOut=90",
      '{' +
      '"providerDetails": "0x041532108bb8db43e9afe1593d1003640d",' +
      '"handler": "0x2323412312312312312312312312312312312312",' +
      '"data": "0x"' +
      '}'
    );

    const gelatoArgs = {
      gasPrice: ethers.utils.parseUnits("100", "gwei").toString(),
      timeStamp: Math.floor(Date.now() / 1000).toString(),
    };

    const { data, error } = await Swidge_Module.checker({
      userArgsBuffer: encode({
        queueAddress: queueAddress
      }),
      gelatoArgsBuffer: encode(gelatoArgs),
    }, client, wrapperUri)

    expect(error).toBeFalsy();
    expect(data!.canExec).toBeTruthy();
    expect(data!.execData).toEqual(
      '0x' +
      '46d5a0e8' +
      '0000000000000000000000000000000000000000000000000000000000000020' +
      '0000000000000000000000000000000000000000000000000000000000000020' +
      'fc3838689ce844438ff358bd41f403f800000000000000000000000000000000' +
      '041532108bb8db43e9afe1593d1003640d000000000000000000000000000000' +
      '0000000000000000000000002323412312312312312312312312312312312312' +
      '0000000000000000000000000000000000000000000000000000000000000080' +
      '0000000000000000000000000000000000000000000000000000000000000000'
    );
  });
});
