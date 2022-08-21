import { HttpClient } from '../../shared/http/httpClient';
import { ConfigService } from '../../config/config.service';
import { Inject } from '@nestjs/common';
import { Class } from '../../shared/Class';
import { Contract } from '../../shared/domain/Contract';
import { AddressesRepository } from '../domain/addresses-repository';

export class AddressesRepositoryImpl implements AddressesRepository {
  constructor(
    private readonly configService: ConfigService,
    @Inject(Class.HttpClient) private readonly httpClient: HttpClient,
  ) {}

  /**
   * Fetch the current router address
   */
  public async getRouterAddress(): Promise<string> {
    const response = await this.httpClient.get<{
      address: string;
    }>(`${this.configService.apiUrl}/address/router`);

    return response.address;
  }

  /**
   * Fetch the contracts of Multichain
   */
  public async getMultichainRouters(): Promise<Contract[]> {
    const response = await this.httpClient.get<{
      addresses: [
        {
          chainId: string;
          address: string;
        },
      ];
    }>(`${this.configService.apiUrl}/address/bridge?type=multichain`);

    return response.addresses.map((row) => {
      return new Contract(row.chainId, row.address);
    });
  }
}
