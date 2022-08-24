import { CmcTokenDetails } from '../infrastructure/external/coinmarketcap-api';

export class ICoinmarketcapApi {
  fetch: (ids: string[]) => Promise<{ id: string; price: number }[]>;
  all: () => Promise<CmcTokenDetails[]>;
}
