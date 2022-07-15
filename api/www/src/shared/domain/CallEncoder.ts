import { ethers } from 'ethers';
import { Fragment, JsonFragment } from '@ethersproject/abi/src.ts/fragments';

export class AbiEncoder {
  public static encodeFunctionSelector(
    ABI: string | ReadonlyArray<Fragment | JsonFragment | string>,
    functionSignature: string,
  ): string {
    const abiInterface = new ethers.utils.Interface(ABI);
    return abiInterface.getSighash(functionSignature);
  }

  public static encodeFunctionArguments(types: string[], values: string[]): string {
    return ethers.utils.defaultAbiCoder.encode(types, values);
  }

  public static encodeFunctionBoth(
    ABI: string | ReadonlyArray<Fragment | JsonFragment | string>,
    functionSignature: string,
    types: string[],
    values: string[],
  ): string {
    const encodedSelector = this.encodeFunctionSelector(ABI, functionSignature);
    const encodedArguments = this.encodeFunctionArguments(types, values);
    return ethers.utils.hexConcat([encodedSelector, encodedArguments]);
  }

  public static concatBytes(bytesList: string[]): string {
    return ethers.utils.hexConcat(bytesList);
  }
}
