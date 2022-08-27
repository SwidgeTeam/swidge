export interface IWallet {
    connect: (request: boolean) => Promise<void>
    switchNetwork: (chainId: string) => Promise<boolean>
    getCurrentChain: () => Promise<string>
    getNativeBalance: (account: string) => Promise<string>
    getTokenBalance: (account: string, address: string) => Promise<string>
    sendTransaction: (tx: Tx) => Promise<TxHash>
}

export interface WalletEvents {
    onConnect: (account: string) => void
    onDisconnect: () => void
    onSwitchNetwork: (chainId: string) => void
}

export enum Wallet {
    Metamask,
}

export interface Tx {
    from: string, // Required
    to: string, // Required (for non contract deployments)
    data: string, // Required
    value: string, // Optional
    gas: string, // Optional
    nonce: string, // Optional
    gasPrice: string, // Optional
}

export interface TxDetails {
    to: string,
    data: string,
    gasLimit: string,
    value?: string,
}

export type TxHash = string
