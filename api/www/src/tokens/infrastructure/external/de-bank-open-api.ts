import { WalletBalancesRepository } from '../../domain/wallet-balances-repository';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { IHttpClient } from '../../../shared/domain/http/IHttpClient';
import { WalletBalances } from '../../domain/wallet-balances';
import { NATIVE_TOKEN_ADDRESS } from '../../../shared/enums/Natives';
import {
  Arbitrum,
  Avalanche,
  Boba,
  BSC,
  Celo,
  Cronos,
  Fantom,
  Huobi,
  Mainnet,
  Moonriver,
  OKT,
  Optimism,
  Polygon,
  xDAI,
} from '../../../shared/enums/ChainIds';
import { ConfigService } from '../../../config/config.service';
import { Logger } from '../../../shared/domain/logger';

interface TokenData {
  chain: string;
  id: string;
  raw_amount_hex_str: string;
}

export class DeBankOpenApi implements WalletBalancesRepository {
  constructor(
    private readonly configService: ConfigService,
    @Inject(Class.HttpClient) private readonly httpClient: IHttpClient,
    @Inject(Class.Logger) private readonly logger: Logger,
  ) {}

  async getTokenList(wallet: string): Promise<WalletBalances> {
    let tokens;
    try {
      tokens = await this.httpClient.get<TokenData[]>(
        'https://pro-openapi.debank.com/v1/user/all_token_list',
        {
          params: {
            id: wallet,
          },
          headers: {
            Accept: 'application/json',
            AccessKey: this.configService.getDeBankApiKey(),
          },
        },
      );
    } catch (e) {
      this.logger.error(`DeBank fail: ${e}`);
      tokens = [];
    }

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
      case 'matic':
        return Polygon;
      case 'ftm':
        return Fantom;
      case 'avax':
        return Avalanche;
      case 'op':
        return Optimism;
      case 'xdai':
        return xDAI;
      case 'okt':
        return OKT;
      case 'heco':
        return Huobi;
      case 'arb':
        return Arbitrum;
      case 'celo':
        return Celo;
      case 'cro':
        return Cronos;
      case 'movr':
        return Moonriver;
      case 'boba':
        return Boba;
      default:
        return '';
    }
  }
}
