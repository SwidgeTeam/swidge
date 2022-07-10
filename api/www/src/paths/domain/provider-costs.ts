import { BigInteger } from '../../shared/domain/BigInteger';

export class ProviderCosts {
  private paths;

  constructor() {
    this.paths = new Map<string, BigInteger>();
  }

  public addStep(providerId: string, asset: string, fee: BigInteger) {
    const key = this.createKey(providerId, asset);
    this.paths.set(key, fee);
  }

  private createKey(providerId: string, asset: string): string {
    return providerId + '-' + asset;
  }

  public forEach(callback: (providerId: string, asset: string, fee: BigInteger) => void) {
    return this.paths.forEach((key: string, fee: BigInteger) => {
      callback('', '', fee);
    });
  }
}
