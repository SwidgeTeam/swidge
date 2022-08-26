export interface IWallet {
    connect: (request: boolean) => Promise<void>
    switchNetwork: (chainId: string) => Promise<boolean>
    getCurrentChain: () => Promise<string>
    getNativeBalance: (account: string) => Promise<string>
    getTokenBalance: (account: string, address: string) => Promise<string>
}

export interface WalletEvents {
    onConnect: (account: string) => void
    onDisconnect: () => void
    onSwitchNetwork: (chainId: string) => void
}

export enum Wallet {
    Metamask,
}
