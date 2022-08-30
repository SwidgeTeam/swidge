import { ethers, Signer } from 'ethers'
import { IWallet, Tx, WalletEvents } from '@/domain/wallets/IWallet'
import { ExternalProvider } from '@ethersproject/providers'

export class Metamask implements IWallet {
    private readonly callbacks: WalletEvents
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly connector: any

    constructor(callbacks: WalletEvents) {
        if (!window.ethereum) {
            throw new Error('Metamask not installed')
        }
        this.connector = window.ethereum
        this.callbacks = callbacks
    }

    public async isConnected() {
        const accounts = await this.getConnectedAccounts()
        return accounts.length !== 0
    }

    public getConnectedAccounts(): Promise<string[]> {
        return this.connector.request({ method: 'eth_accounts' })
    }

    public async requestAccess() {
        await this.connector.request({ method: 'eth_requestAccounts' })
    }

    public async revokeAccess(): Promise<void> {
        return this.callbacks.onDisconnect()
    }

    public setListeners(): void {
        this.connector.on('accountsChanged', async (account: string[]) => {
            if (account.length === 0) {
                this.callbacks.onDisconnect()
            } else {
                this.callbacks.onConnect(account[0])
            }
        })
        this.connector.on('chainChanged', async (chainId: string) => {
            this.callbacks.onSwitchNetwork(chainId)
        })
        this.connector.on('disconnect', async () => {
            this.callbacks.onDisconnect()
        })
    }
    public async switchNetwork(chainId: string): Promise<boolean> {
        try {
            const hexChainId = '0x' + Number(chainId).toString(16)
            await this.connector.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: hexChainId }]
            })
            return true
        } catch {
            return false
        }
    }

    public async getCurrentChain(): Promise<string> {
        const hexChainId = await this.connector.request({ method: 'eth_chainId' })
        return parseInt(hexChainId, 16).toString()
    }

    public async sendTransaction(tx: Tx): Promise<string> {
        const provider = new ethers.providers.Web3Provider(this.connector)
        const signer: Signer = provider.getSigner()

        const receipt = await (
            await signer.sendTransaction({
                from: tx.from,
                to: tx.to,
                data: tx.data,
                value: tx.value,
                gasLimit: tx.gas,
                gasPrice: tx.gasPrice,
                nonce: tx.nonce,
            })
        ).wait()

        return receipt.transactionHash
    }

    public getProvider(): ExternalProvider {
        return this.connector
    }
}
