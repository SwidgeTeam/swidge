import { WalletBalancesRepository } from '../../domain/wallet-balances-repository';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { IHttpClient } from '../../../shared/domain/http/IHttpClient';
import { WalletBalances } from '../../domain/wallet-balances';
import { NATIVE_TOKEN_ADDRESS } from '../../../shared/enums/Natives';
import { BSC, Mainnet } from '../../../shared/enums/ChainIds';

interface TokenData {
  chain: string;
  id: string;
  raw_amount_hex_str: string;
}

export class DeBankOpenApi implements WalletBalancesRepository {
  constructor(@Inject(Class.HttpClient) private readonly httpClient: IHttpClient) {}

  async getTokenList(wallet: string): Promise<WalletBalances> {
    const tokens = await this.httpClient.get<TokenData[]>(
      'https://openapi.debank.com/v1/user/token_list',
      {
        params: {
          id: wallet,
        },
      },
    );

    return Promise.resolve({
      tokens: tokens.map((token) => {
        return {
          chainId: this.getChainId(token.chain),
          address: this.getAddress(token),
          hex_amount: token.raw_amount_hex_str,
        };
      }),
    });
  }

  private getAddress(token: TokenData): string {
    return token.id === token.chain ? NATIVE_TOKEN_ADDRESS : token.id;
  }

  private getChainId(chain: string): string {
    switch (chain) {
      case 'eth':
        return Mainnet;
      case 'bsc':
        return BSC;
      default:
        return '';
    }
  }
}
