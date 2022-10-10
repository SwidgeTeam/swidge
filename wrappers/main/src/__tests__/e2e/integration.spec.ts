import { PolywrapClient } from "@polywrap/client-js";
import {
  initTestEnvironment,
  stopTestEnvironment,
} from "@polywrap/test-env-js";
import { Swidge_Module } from "../types/wrap";
import path from "path";
import { encode } from "@msgpack/msgpack";
import { createJob, deployQueue, getConfig } from "../utils";
import { ethers } from 'ethers';

jest.setTimeout(60000);

describe("Template Wrapper End to End Tests", () => {

  const client: PolywrapClient = new PolywrapClient(getConfig());
  let wrapperUri: string;

  beforeAll(async () => {
    const dirname: string = path.resolve(__dirname);
    const wrapperPath: string = path.join(dirname, "..", "..", "..");
    wrapperUri = `fs/${wrapperPath}/build`;

    await initTestEnvironment();
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

});
