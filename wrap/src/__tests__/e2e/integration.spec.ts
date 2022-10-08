import { PolywrapClient } from "@polywrap/client-js";
import {
  initTestEnvironment,
  stopTestEnvironment,
} from "@polywrap/test-env-js";
import path from "path";
import { encode } from "@msgpack/msgpack";
import { ethers } from 'ethers';
import { createJob, deployQueue, getConfig } from '../utils';
import { CheckerResult } from '../../wrap';
import { getClientConfig } from '../../../workflows/client-config';

jest.setTimeout(60000);

describe("Checker", () => {

  let client: PolywrapClient = new PolywrapClient();
  let wrapperUri: string;

  beforeAll(async () => {
    const dirname: string = path.resolve(__dirname);
    const wrapperPath: string = path.join(dirname, "..", "..", "..");
    wrapperUri = `fs/${wrapperPath}/build`;

    await initTestEnvironment();

    client = new PolywrapClient(await getClientConfig(getConfig()));
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

    const { data, error } = await client.invoke<CheckerResult>({
      uri: wrapperUri,
      method: "checker",
      args: {
        userArgsBuffer: encode({
          queueAddress: queueAddress
        }),
        gelatoArgsBuffer: encode(gelatoArgs)
      }
    });

    expect(error).toBeFalsy();
    expect(data?.canExec).toBeFalsy();
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

    const gelatoArgs = {
      gasPrice: ethers.utils.parseUnits("100", "gwei").toString(),
      timeStamp: Math.floor(Date.now() / 1000).toString(),
    };

    const { data, error } = await client.invoke<CheckerResult>({
      uri: wrapperUri,
      method: "checker",
      args: {
        userArgsBuffer: encode({
          queueAddress: queueAddress
        }),
        gelatoArgsBuffer: encode(gelatoArgs)
      }
    });

    expect(error).toBeFalsy();
    expect(data!.canExec).toBeTruthy();
    expect(data!.execData).toEqual(
      '0x' +
      '2e77489b' +
      '0000000000000000000000000000000000000000000000000000000000000020' +
      '0000000000000000000000000000000000000000000000000000000000000020' +
      'fc3838689ce844438ff358bd41f403f800000000000000000000000000000000' +
      '0000000000000000000000002323412312312312312312312312312312312312' +
      '0000000000000000000000000000000000000000000000000000000000000060' +
      '0000000000000000000000000000000000000000000000000000000000000000'
    );
  });
});