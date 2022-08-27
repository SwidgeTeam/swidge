import { ethers, Signer } from 'ethers'
import IERC20Abi from '@/contracts/IERC20.json'
import { IWallet, Tx, WalletEvents } from '@/domain/wallets/IWallet'

export class Metamask implements IWallet {
    private callbacks: WalletEvents
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private connector: any

    constructor(callbacks: WalletEvents) {
        this.callbacks = callbacks
    }

    public async connect(request: boolean): Promise<void> {
        if (!window.ethereum) {
            throw new Error('Metamask not installed')
        }
        this.connector = window.ethereum
        const isConnected = await this.isAlreadyConnected()
        if (!isConnected && request) {
            await this.requestAccess()
        }
        const accounts: string[] = await this.connectedAccounts()
        if (accounts.length > 0) {
            this.callbacks.onConnect(accounts[0])
            this.setListeners()
        }
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

    public async getNativeBalance(account: string): Promise<string> {
        if (!account) return ''
        try {
            const provider = new ethers.providers.Web3Provider(this.connector)
            const balance = await provider.getBalance(account)
            return ethers.utils.formatEther(balance)
        } catch (error) {
            return ''
        }
    }

    public async getTokenBalance(account: string, address: string): Promise<string> {
        try {
            const provider = new ethers.providers.Web3Provider(this.connector)
            const contract = new ethers.Contract(address, IERC20Abi, provider)
            const balance = await contract.balanceOf(account)
            const decimals = await contract.decimals()
            return ethers.utils.formatUnits(balance, decimals)
        } catch (error) {
            return ''
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

    private async isAlreadyConnected() {
        const accounts: string[] = await this.connectedAccounts()
        return accounts.length !== 0
    }

    private async connectedAccounts(): Promise<string[]> {
        return await this.connector.request({ method: 'eth_accounts' })
    }

    private async requestAccess() {
        await this.connector.request({ method: 'eth_requestAccounts' })
    }

    private setListeners() {
        this.connector.on('accountsChanged', async (account: string[]) => {
            if (account.length === 0) {
                this.callbacks.onDisconnect()
            } else {
                this.callbacks.onConnect(account[0])
            }
        })
        this.connector.on('chainChanged', async () => {
        })
        this.connector.on('disconnect', async () => {
            this.callbacks.onDisconnect()
        })
    }
}
