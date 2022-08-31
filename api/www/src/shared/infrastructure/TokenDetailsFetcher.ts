import { ContractAddress } from '../types';
import { Token } from '../domain/token';
import { ethers } from 'ethers';
import { RpcNode } from '../enums/RpcNode';
import { NATIVE_TOKEN_ADDRESS, Natives } from '../enums/Natives';

export class TokenDetailsFetcher {
  public async fetch(address: ContractAddress, chainId: string): Promise<Token> {
    if (address.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()) {
      const details = Natives[chainId];
      return new Token(chainId, details.name, address, details.decimals, details.symbol);
    }

    const provider = ethers.providers.getDefaultProvider(RpcNode[chainId]);
    const abiInterface = new ethers.utils.Interface([
      'function name() view returns (string)',
      'function symbol() public view returns (string)',
      'function decimals() public view returns (uint8)',
    ]);

    const token = new ethers.Contract(address, abiInterface, provider);

    const name = await token.functions.name();
    const decimals = await token.functions.decimals();
    const symbol = await token.functions.symbol();

    if (name.length == 0) {
      // TODO : check with web2 API
    }

    return new Token(chainId, name[0], address, decimals[0], symbol[0]);
  }
}
