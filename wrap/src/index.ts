import { JSON } from "@polywrap/wasm-as";
import {
  Args_checker,
  CheckerResult,
  Ethereum_Module,
  Http_Module,
  JobResponse,
  Logger_Logger_LogLevel,
  Logger_Module,
  UserArgs
} from "./wrap";

const getPendingJobsAbi = '{"inputs":[],"name":"getPendingJobs","outputs":[{"components":[{"internalType":"bytes16","name":"id","type":"bytes16"},{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"receiver","type":"address"},{"internalType":"address","name":"inputAsset","type":"address"},{"internalType":"address","name":"dstAsset","type":"address"},{"internalType":"uint256","name":"srcChain","type":"uint256"},{"internalType":"uint256","name":"dstChain","type":"uint256"},{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"minAmountOut","type":"uint256"}],"internalType":"struct JobsQueue.ExecuteJob[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"}';

export function checker(args: Args_checker): CheckerResult {
  let userArgs = UserArgs.fromBuffer(args.userArgsBuffer);

  const response = Ethereum_Module.callContractView({
    address: userArgs.queueAddress,
    method: getPendingJobsAbi,
    args: null,
    connection: args.connection,
  }).unwrap();

  const pendingJobs = <JSON.Arr>JSON.parse(response);
  const pendingJobsLength = pendingJobs._arr.length;

  if (pendingJobsLength === 0) {
    return nothingToExecute();
  }

  const jobs = pendingJobs._arr.map<JSON.Obj>((item: JSON.Value): JSON.Obj => {
    const pendingJob = item as JSON.Obj;
    const jobResponse = getCallData(pendingJob);
    const job = JSON.Value.Object();
    job.set('jobId', pendingJob.get('id'));
    job.set('providerInfo', pendingJob.get('providerInfo'));
    job.set('handler', jobResponse.handler);
    job.set('data', jobResponse.data);
    return job;
  });

  const jobsArr = JSON.Value.Array();
  const argsSignature: string[] = [];
  // doing this extra loop because can't push element
  // into an Array inside a map iterator : Not implemented error (¿?)
  // but we need an Array to be able to stringify the elements
  for (let i = 0; i < jobs.length; i++) {
    jobsArr.push(jobs[i]);
    argsSignature.push('tuple(bytes16 jobId,address handler,bytes data)')
  }

  const encoded = Ethereum_Module.encodeFunction({
    method: `function executeJobs (tuple(${argsSignature.join(',')}))`,
    args: [jobsArr.stringify()],
  });

  let execData = encoded.unwrap();

  return returnResult(true, execData);
}

function getCallData(job: JSON.Obj): JobResponse {
  let jobResponse = Http_Module.get({
    request: null,
    url: `https://api.swidge.xyz/quote?` +
      `srcChain=${job.get('srcChain')}` +
      `&dstChain=${job.get('dstChain')}` +
      `&srcAsset=${job.get('inputAsset')}` +
      `&dstAsset=${job.get('dstAsset')}` +
      `&sender=${job.get('sender')}` +
      `&receiver=${job.get('receiver')}` +
      `&amountIn=${job.get('amountIn')}` +
      `&minAmountOut=${job.get('minAmountOut')}`,
  }).unwrap();

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

