import { ethers } from 'ethers'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'
import { Networks } from '@/assets/Networks'
import IERC20Abi from '@/contracts/IERC20.json'
import { NATIVE_COIN_ADDRESS } from '@/contracts/routerCaller'

export const useWeb3Store = defineStore('web3', () => {
    const account = ref('')
    const isConnected = ref(false)
    const isCorrectNetwork = ref(true)
    const selectedNetworkId = ref('')
    const error = ref('')
    const balanceETH = ref<null | string>(null)

    async function connect(connect: boolean) {
        try {
            const { ethereum } = window
            if (!ethereum) {
                error.value = 'Metamask not installed.'
                return
            }
            if (!(await checkIfIsAlreadyConnected()) && connect) {
                await requestAccess()
                isConnected.value = true
            }
            await checkIsCorrectNetwork()
            await setupEventListeners()
        } catch {
            error.value = 'Account request refused.'
            isConnected.value = false
        }
    }

    async function checkIfIsAlreadyConnected() {
        const { ethereum } = window
        const accounts: string[] = await ethereum.request({ method: 'eth_accounts' })
        if (accounts.length !== 0) {
            account.value = accounts[0]
            isConnected.value = true
            return true
        } else {
            return false
        }
    }

    async function requestAccess() {
        const { ethereum } = window
        const accounts: string[] = await ethereum.request({ method: 'eth_requestAccounts' })
        account.value = accounts[0]
    }

    async function checkIsCorrectNetwork() {
        const { ethereum } = window
        const hexChainId = await ethereum.request({ method: 'eth_chainId' })
        const chainId = parseInt(hexChainId, 16).toString()
        const acceptedChains = Networks.ids()
        if (acceptedChains.includes(chainId)) {
            isCorrectNetwork.value = true
            selectedNetworkId.value = chainId
        } else {
            isCorrectNetwork.value = false
        }
    }

    async function getBalance(address: string) {
        if (address === NATIVE_COIN_ADDRESS) {
            return getETHBalance()
        } else {
            return getTokenBalance(address)
        }
    }

    async function getETHBalance(): Promise<string> {
        if (!account.value) return ''
        try {
            const { ethereum } = window
            const provider = new ethers.providers.Web3Provider(ethereum)
            const balance = await provider.getBalance(account.value)
            return ethers.utils.formatEther(balance)
        } catch (error) {
            console.log(error)
            return ''
        }
    }

    async function getTokenBalance(address: string): Promise<string> {
        try {
            const { ethereum } = window
            const provider = new ethers.providers.Web3Provider(ethereum)
            const contract = new ethers.Contract(address, IERC20Abi, provider)
            const balance = await contract.balanceOf(account.value)
            const decimals = await contract.decimals()
            return ethers.utils.formatUnits(balance, decimals)
        } catch (error) {
            console.log(error)
            return ''
        }
    }

    async function switchToNetwork(chainId: string) {
        const { ethereum } = window
        try {
            const hexChainId = '0x' + Number(chainId).toString(16)
            await ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: hexChainId }]
            })
            isCorrectNetwork.value = true
            selectedNetworkId.value = chainId
            return true
        } catch {
            isCorrectNetwork.value = false
            return false
        }
    }

    async function setupEventListeners() {
        const { ethereum } = window
        ethereum.on('accountsChanged', async () => {
            history.replaceState(null, '', '/')
            window.location.reload()
        })
        ethereum.on('chainChanged', async () => {
            await checkIsCorrectNetwork()
        })
    }

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
        error,
        balanceETH,
        connect,
        getBalance,
        switchToNetwork,
        getChainProvider,
    }

})

if (import.meta.hot)
    import.meta.hot.accept(acceptHMRUpdate(useWeb3Store, import.meta.hot))
