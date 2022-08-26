import { ethers } from 'ethers'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'
import { Networks } from '@/domain/chains/Networks'
import { IWallet, Wallet, WalletEvents } from '@/domain/wallets/IWallet'
import { Metamask } from '@/domain/wallets/Metamask'

export const NATIVE_COIN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

export const useWeb3Store = defineStore('web3', () => {
    const account = ref('')
    const isConnected = ref(false)
    const isCorrectNetwork = ref(true)
    const selectedNetworkId = ref('')
    const wallet = ref<IWallet | null>(null)

    /**
     * entrypoint to connect a wallet
     * @param code
     */
    async function init(code: Wallet) {
        const events: WalletEvents = {
            onConnect: onConnect,
            onSwitchNetwork: onSwitchNetwork,
            onDisconnect: onDisconnect
        }

        switch (code) {
        case Wallet.Metamask:
            wallet.value = new Metamask(events)
            break
        default:
            throw new Error('Unsupported wallet')
        }

        await connect()
        await checkIfCorrectNetwork()
    }

    /**
     * tries to connect with the selected wallet
     */
    async function connect() {
        if (!wallet.value) throw new Error('No wallet')
        try {
            await wallet.value.connect()
            isConnected.value = true
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
            return wallet.value.getNativeBalance(account.value)
        } else {
            return wallet.value.getTokenBalance(account.value, address)
        }
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
     * triggered when the wallet is connected an account
     * @param address
     */
    function onConnect(address: string) {
        account.value = address
    }

    /**
     * triggered when the wallet is disconnected
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
        getChainProvider,
    }

})

if (import.meta.hot)
    import.meta.hot.accept(acceptHMRUpdate(useWeb3Store, import.meta.hot))
