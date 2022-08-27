import { IWallet, Tx, WalletEvents } from '@/domain/wallets/IWallet'
import QRCodeModal from '@walletconnect/qrcode-modal'
import { default as WalletConnectClient } from '@walletconnect/client'
import { ExternalProvider } from '@ethersproject/providers'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { Networks } from '@/domain/chains/Networks'
import { IRPCMap } from '@walletconnect/types'

export class WalletConnect implements IWallet {
    private readonly callbacks: WalletEvents
    private readonly connector: WalletConnectClient
    private readonly provider: WalletConnectProvider

    constructor(callbacks: WalletEvents) {
        this.connector = new WalletConnectClient({
            bridge: 'https://bridge.walletconnect.org', // Required
            qrcodeModal: QRCodeModal,
        })
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
        return this.connector.killSession()
    }

    public setListeners(): void {
        // Subscribe to connection events
        this.connector.on('connect', (error, payload) => {
            if (error) {
                throw error
            }

            // Get provided accounts and chainId
            const { accounts, } = payload.params[0]
            if (accounts.length === 0) {
                this.callbacks.onDisconnect()
            } else {
                this.callbacks.onConnect(accounts[0])
            }
        })

        this.connector.on('session_update', (error, payload) => {
            if (error) {
                throw error
            }

            // Get updated accounts and chainId
            const { accounts, } = payload.params[0]
            if (accounts.length === 0) {
                this.callbacks.onDisconnect()
            } else {
                this.callbacks.onConnect(accounts[0])
            }
        })

        this.connector.on('disconnect', (error, payload) => {
            if (error) {
                throw error
            }
            this.callbacks.onDisconnect()
        })
    }

    public async switchNetwork(chainId: string): Promise<boolean> {
        try {
            const hexChainId = '0x' + Number(chainId).toString(16)
            await this.connector.sendCustomRequest({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: hexChainId }]
            })
            return true
        } catch {
            return false
        }
    }

    public async getCurrentChain(): Promise<string> {
        return this.connector.chainId.toString()
    }

    public async sendTransaction(tx: Tx): Promise<string> {
        const receipt = await this.connector.sendTransaction({
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
