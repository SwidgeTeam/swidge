import { HttpClient } from '../../../shared/infrastructure/http/httpClient';
import { ICoinmarketcapApi } from '../../domain/coinmarketcap-api';
import { ConfigService } from '../../../config/config.service';
import { Injectable } from '@nestjs/common';

export interface CmcTokenDetails {
  id: number;
  name: string;
  symbol: string;
  platform: {
    token_address: string;
    symbol: string;
  };
}

@Injectable()
export class CoinmarketcapApi implements ICoinmarketcapApi {
  private client: HttpClient;
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.client = new HttpClient();
    this.apiUrl = 'https://pro-api.coinmarketcap.com';
    this.apiKey = configService.getCoinmarketcapApiKey();
  }

  async fetch(ids: string[]): Promise<{ id: string; price: number }[]> {
    const results = [];
    try {
      const response = await this.client.get<{
        data: Record<any, any>[];
      }>(`${this.apiUrl}/v2/cryptocurrency/quotes/latest`, {
        headers: {
          'X-CMC_PRO_API_KEY': this.apiKey,
        },
        params: {
          id: ids.join(','),
        },
      });

      for (const [id, data] of Object.entries(response.data)) {
        results.push({
          id: id,
          price: data.quote.USD.price,
        });
      }
    } catch (e) {
      // log e
    }
    return results;
  }

  async all(): Promise<CmcTokenDetails[]> {
    try {
      const response = await this.client.get<{
        data: CmcTokenDetails[];
      }>(`${this.apiUrl}/v1/cryptocurrency/map`, {
        headers: {
          'X-CMC_PRO_API_KEY': this.apiKey,
        },
      });

      return response.data;
    } catch (e) {
      console.log(e);
      // log e
    }
  }
}
