import { ProviderDetails } from '../../../shared/domain/provider-details';

export enum ExchangeProviders {
  ZeroEx = '0',
  Sushi = '1',
}

export class ExchangeDetails {
  public static get(code: string): ProviderDetails {
    return new ProviderDetails(this.names[code], this.logos[code]);
  }

  private static names = {
    [ExchangeProviders.ZeroEx]: 'ZeroEx',
    [ExchangeProviders.Sushi]: 'Sushiswap',
  };

  private static logos = {
    [ExchangeProviders.ZeroEx]:
      'https://www.gitbook.com/cdn-cgi/image/width=40,height=40,fit=contain,dpr=1.0909090909090908,format=auto/https%3A%2F%2F1690203644-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FKX9pG8rH3DbKDOvV7di7%252Ficon%252F1nKfBhLbPxd2KuXchHET%252F0x%2520logo.png%3Falt%3Dmedia%26token%3D25a85a3e-7f72-47ea-a8b2-e28c0d24074b',
    [ExchangeProviders.Sushi]:
      'https://res.cloudinary.com/sushi-cdn/image/fetch/f_auto,c_limit,w_64,q_auto/https://app.sushi.com/images/logo.svg',
  };
}