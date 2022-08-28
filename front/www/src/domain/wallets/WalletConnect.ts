import { IWallet, Tx, WalletEvents } from '@/domain/wallets/IWallet'
import { ExternalProvider } from '@ethersproject/providers'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { Networks } from '@/domain/chains/Networks'
import { IRPCMap } from '@walletconnect/types'

export class WalletConnect implements IWallet {
    private readonly callbacks: WalletEvents
    private readonly provider: WalletConnectProvider

    constructor(callbacks: WalletEvents) {
        const rpc: IRPCMap = {}
        for (const network of Networks.live()) {
            rpc[Number(network.id)] = network.rpcUrl
        }
        this.provider = new WalletConnectProvider({
            rpc: rpc
        })
        this.callbacks = callbacks
    }

    public async isConnected() {
        return this.provider.isWalletConnect
    }

    public getConnectedAccounts(): Promise<string[]> {
        return this.provider.enable()
    }

    public async requestAccess() {
        await this.provider.enable()
    }

    public revokeAccess(): Promise<void> {
        return this.provider.disconnect()
    }

    public setListeners(): void {
        // Subscribe to accounts change
        this.provider.on('accountsChanged', (accounts: string[]) => {
            if (accounts.length === 0) {
                this.callbacks.onDisconnect()
            } else {
                this.callbacks.onConnect(accounts[0])
            }
        })

        // Subscribe to chainId change
        this.provider.on('chainChanged', (chainId: number) => {
            this.callbacks.onSwitchNetwork(chainId.toString())
        })

        // Subscribe to session disconnection
        this.provider.on('disconnect', (code: number, reason: string) => {
            this.callbacks.onDisconnect()
        })
    }

    public async switchNetwork(chainId: string): Promise<boolean> {
        if (this.provider.chainId.toString() === chainId) return true
        try {
            const hexChainId = '0x' + Number(chainId).toString(16)
            await this.provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: hexChainId }]
            })
            return true
        } catch {
            return false
        }
    }

    public async getCurrentChain(): Promise<string> {
        return this.provider.chainId.toString()
    }

    public async sendTransaction(tx: Tx): Promise<string> {
        const receipt = await this.provider.connector.sendTransaction({
            from: tx.from,
            to: tx.to,
            data: tx.data,
            value: tx.value,
            gasLimit: tx.gas,
            gasPrice: tx.gasPrice,
        })

        return receipt.transactionHash
    }

    getProvider(): ExternalProvider {
        return this.provider
    }
}
