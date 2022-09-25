import { JSON } from "@polywrap/wasm-as";
import {
  Args_checker,
  CheckerResult,
  Ethereum_Module,
  GelatoArgs, JobResponse,
  Logger_Logger_LogLevel,
  Logger_Module,
  UserArgs
} from "./wrap";

export function checker(args: Args_checker): CheckerResult {
  let userArgs = UserArgs.fromBuffer(args.userArgsBuffer);
  let gelatoArgs = GelatoArgs.fromBuffer(args.gelatoArgsBuffer);

  let gasPrice = gelatoArgs.gasPrice;
  let timeStamp = gelatoArgs.timeStamp;

  const response = Ethereum_Module.callContractView({
    address: userArgs.queueAddress,
    method: '{"inputs":[],"name":"getPendingJobs","outputs":[{"components":[{"internalType":"bytes16","name":"id","type":"bytes16"},{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"receiver","type":"address"},{"internalType":"address","name":"inputAsset","type":"address"},{"internalType":"address","name":"dstAsset","type":"address"},{"internalType":"uint256","name":"srcChain","type":"uint256"},{"internalType":"uint256","name":"dstChain","type":"uint256"},{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"minAmountOut","type":"uint256"}],"internalType":"struct JobsQueue.ExecuteJob[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"}',
    args: null,
    connection: args.connection,
  }).unwrap();

  const jobs = <JSON.Arr>JSON.parse(response);
  const jobsCount = jobs._arr.length;

  if (jobsCount === 0) {
    return nothingToExecute();
  }

  const arr = JSON.Value.Array();
  const map = jobs._arr.map<JSON.Obj>((val: JSON.Value): JSON.Obj => {
    const obj = JSON.Value.Object();
    obj.set('jobId', (val as JSON.Obj).get('id'))
    const jobResponse = getCallData(val as JSON.Obj);
    obj.set('handler', jobResponse.handler);
    obj.set('data', jobResponse.data);
    return obj;
  });

  const argsSig: string[] = [];
  for (let i = 0; i < map.length; i++) {
    arr.push(map[i]);
    argsSig.push('tuple(bytes16 jobId,address handler,bytes data)')
  }

  const encoded = Ethereum_Module.encodeFunction({
    method: 'function executeJobs (tuple(' + argsSig.join(',') + '))',
    args: [arr.stringify()],
  });

  let execData = encoded.unwrap();

  return returnResult(true, execData);
}

function getCallData(job: JSON.Obj): JobResponse {
  return {
    handler: '0x2323412312312312312312312312312312312312',
    data: '0x',
  };
}

function returnResult(exec: boolean, data: string): CheckerResult {
  return { canExec: exec, execData: data };
}

function nothingToExecute(): CheckerResult {
  return returnResult(false, '');
}

