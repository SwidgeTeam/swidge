import { ethers } from 'ethers'
import { ref } from 'vue'
import { acceptHMRUpdate, defineStore } from 'pinia'
import IERC20Abi from '@/contracts/IERC20.json'
import { IWallet, TxHash, Wallet, WalletEvents } from '@/domain/wallets/IWallet'
import { ApprovalTransactionDetails, TransactionDetails } from '@/domain/paths/path'
import { WalletConnect } from '@/domain/wallets/WalletConnect'
import { Metamask } from '@/domain/wallets/Metamask'
import { Networks } from '@/domain/chains/Networks'

export const NATIVE_COIN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

export const useWeb3Store = defineStore('web3', () => {
    const account = ref('')
    const isConnected = ref(false)
    const isCorrectNetwork = ref(true)
    const selectedNetworkId = ref('')
    const wallet = ref<IWallet | null>(null)

    /**
     * entrypoint to connect a wallet
     * @param code Wallet to use
     * @param request Whether to ask the user to connect if not connected already
     */
    async function init(code = Wallet.Metamask, request = false) {
        const events: WalletEvents = {
            onConnect: onConnect,
            onSwitchNetwork: onSwitchNetwork,
            onDisconnect: onDisconnect
        }

        switch (code) {
        case Wallet.Metamask:
            wallet.value = new Metamask(events)
            break
        case Wallet.WalletConnect:
            wallet.value = new WalletConnect(events)
            break
        default:
            throw new Error('Unsupported wallet')
        }

        await connect(request)
        await checkIfCorrectNetwork()
    }

    /**
     * tries to connect with the selected wallet
     */
    async function connect(request: boolean) {
        if (!wallet.value) throw new Error('No wallet')
        try {
            const isConnected = await wallet.value.isConnected()
            if (!isConnected && request) {
                await wallet.value.requestAccess()
            }
            wallet.value.setListeners()
        } catch (e) {
            isConnected.value = false
        }
    }

    /**
     * checks that the connected chain is an accepted one
     */
    async function checkIfCorrectNetwork() {
        if (!wallet.value) throw new Error('No wallet')
        const chainId = await wallet.value.getCurrentChain()
        const acceptedChains = Networks.ids()
        selectedNetworkId.value = chainId
        isCorrectNetwork.value = acceptedChains.includes(chainId)
    }

    /**
     * fetches and returns the balance of an asset
     * @param address Address of the asset to query
     */
    async function getBalance(address: string) {
        if (!wallet.value) throw new Error('No wallet')
        if (address === NATIVE_COIN_ADDRESS) {
            return getNativeBalance()
        } else {
            return getTokenBalance(address)
        }
    }

    /**
     * fetches and returns the amount of native coins
     */
    async function getNativeBalance(): Promise<string> {
        if (!account.value) return ''
        try {
            const provider = getWalletProvider()
            const balance = await provider.getBalance(account.value)
            return ethers.utils.formatEther(balance)
        } catch (error) {
            return ''
        }
    }

    /**
     * fetches and returns the amount of certain token
     */
    async function getTokenBalance(address: string): Promise<string> {
        try {
            const provider = getWalletProvider()
            const contract = new ethers.Contract(address, IERC20Abi, provider)
            const balance = await contract.balanceOf(account.value)
            const decimals = await contract.decimals()
            return ethers.utils.formatUnits(balance, decimals)
        } catch (error) {
            return ''
        }
    }

    /**
     * creates a Web3Provider using the connected wallet provider
     */
    function getWalletProvider(): ethers.providers.Web3Provider {
        if (!wallet.value) throw new Error('No wallet')
        return new ethers.providers.Web3Provider(wallet.value.getProvider())
    }

    /**
     * switches the wallet to the specified chain
     * @param chainId
     */
    async function switchToNetwork(chainId: string) {
        if (!wallet.value) throw new Error('No wallet')
        const changed = await wallet.value.switchNetwork(chainId)
        if (changed) {
            await checkIfCorrectNetwork()
        }
    }

    /**
     * broadcasts a transactions using the connected wallet provider
     * @param tx
     */
    async function sendTransaction(tx: {
        to: string,
        data: string,
        gasLimit: string,
        value?: string,
    }): Promise<TxHash> {
        if (!wallet.value) throw new Error('No wallet')
        const provider = getWalletProvider()
        const nonce = await provider.getTransactionCount(account.value)
        const feeData = await provider.getFeeData()

        if (!feeData.gasPrice) {
            throw new Error('error fetching gas')
        }

        return wallet.value.sendTransaction({
            from: account.value,
            to: tx.to,
            data: tx.data,
            gas: tx.gasLimit,
            value: tx.value ? tx.value : '0x0',
            gasPrice: feeData.gasPrice.toString(),
            nonce: nonce.toString(),
        })
    }

    /**
     * sends an approval transaction
     * @param tx
     */
    async function sendApprovalTransaction(tx: ApprovalTransactionDetails): Promise<TxHash> {
        return sendTransaction({
            to: tx.to,
            data: tx.callData,
            gasLimit: tx.gasLimit,
        })
    }

    /**
     * sends a main transaction(swap/bridge)
     * @param tx
     */
    async function sendMainTransaction(tx: TransactionDetails): Promise<TxHash> {
        return sendTransaction({
            to: tx.to,
            data: tx.callData,
            value: tx.value,
            gasLimit: tx.gasLimit,
        })
    }

    /**
     * triggered when the wallet connects an account
     * @param address
     */
    function onConnect(address: string) {
        account.value = address
        isConnected.value = true
    }

    /**
     * triggered when the wallet disconnects
     */
    function onDisconnect() {
        account.value = ''
        isConnected.value = false
    }

    /**
     * triggered when the wallet changes the network
     */
    async function onSwitchNetwork(chainId: string) {
        selectedNetworkId.value = chainId
        await checkIfCorrectNetwork()
    }

    /**
     * returns a provider for the given chain
     * @dev non-related to the connected wallet provider
     * @param chainId
     */
    function getChainProvider(chainId: string) {
        const chain = Networks.get(chainId)
        return ethers.getDefaultProvider({
            name: chain.name,
            chainId: Number(chain.id),
            _defaultProvider: (providers) => new providers.JsonRpcProvider(chain.rpcUrl)
        })
    }

    return {
        account,
        isConnected,
        isCorrectNetwork,
        selectedNetworkId,
        init,
        getBalance,
        switchToNetwork,
        sendApprovalTransaction,
        sendMainTransaction,
        getChainProvider,
    }
})

if (import.meta.hot)
    import.meta.hot.accept(acceptHMRUpdate(useWeb3Store, import.meta.hot))
