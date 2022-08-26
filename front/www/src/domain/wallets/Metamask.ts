import { ethers } from 'ethers'
import IERC20Abi from '@/contracts/IERC20.json'
import { IWallet, WalletEvents } from '@/domain/wallets/IWallet'

export class Metamask implements IWallet {
    private callbacks: WalletEvents
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private connector: any

    constructor(callbacks: WalletEvents) {
        this.callbacks = callbacks
    }

    public async connect() {
        if (!window.ethereum) {
            throw new Error('Metamask not installed')
        }
        this.connector = window.ethereum
        const isConnected = await this.isAlreadyConnected()
        if (!isConnected) {
            await this.requestAccess()
        }
        this.setListeners()
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

    private async isAlreadyConnected() {
        const accounts: string[] = await this.connector.request({ method: 'eth_accounts' })
        return accounts.length !== 0
    }

    private async requestAccess() {
        const accounts: string[] = await this.connector.request({ method: 'eth_requestAccounts' })
        this.callbacks.onConnect(accounts[0])
    }

    private setListeners() {
        this.connector.on('accountsChanged', async (account: string[]) => {
            if (account.length === 0) {
                this.callbacks.onDisconnect()
            }
            else {
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
