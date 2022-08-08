import { ProviderDetails } from '../../../shared/domain/provider-details';

export enum BridgeProviders {
  Multichain = '0',
}

export class BridgeDetails {
  public static get(code: string): ProviderDetails {
    return new ProviderDetails(this.names[code], this.logos[code]);
  }

  private static names = {
    [BridgeProviders.Multichain]: 'Multichain',
  };

  private static logos = {
    [BridgeProviders.Multichain]:
      'https://www.gitbook.com/cdn-cgi/image/width=40,height=40,fit=contain,dpr=1.0909090909090908,format=auto/https%3A%2F%2F3757759239-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FUdcg2zIVro9DItOfrezt%252Ficon%252F5OTzC3fjscHIvkBqqmEC%252Fc-256-color%25403x.png%3Falt%3Dmedia%26token%3D55e6a89d-3754-49e9-b93d-27136ad43635',
  };
}
