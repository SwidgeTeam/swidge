export class AddSushiPairCommand {
  constructor(readonly chainId: string, readonly token0: string, readonly token1: string) {}
}
