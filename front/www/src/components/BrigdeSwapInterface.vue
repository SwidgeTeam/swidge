<script setup lang='ts'>
import {
    ArrowCircleRightIcon,
    XCircleIcon,
} from '@heroicons/vue/outline'
import { ref, reactive, computed } from 'vue'
import BridgeSwapSelectionCard from './BridgeSwapSelectionCard.vue'
import ModalNetworkAndTokenSelect from './ModalNetworkAndTokenSelect.vue'
import Header from '@/components/Header.vue'
import FAQCard from '@/components/FAQCard.vue'
import IToken from '@/tokens/models/IToken'
import BridgeSwapInteractiveButton from './BridgeSwapInteractiveButton.vue'
import SwidgeAPI from '@/api/swidge-api'
import GetQuoteResponse from '@/api/models/get-quote-response'
import { RouterCaller, RouterCallPayload } from '@/contracts/routerCaller'
import { useWeb3Store } from '@/store/web3'
import { BigNumber, ethers, providers } from 'ethers'
import networks from '@/assets/Networks'
import { INetwork } from '@/models/INetwork'
import ModalSwidgeStatus from './ModalSwidgeStatus.vue'
import { TransactionSteps } from '@/models/TransactionSteps'
import SwitchButton from './Buttons/SwitchButton.vue'
import TransactionSettings from './TransactionSettings.vue'


const web3Store = useWeb3Store()
const { switchToNetwork, getChainProvider, getBalance } = web3Store

const sourceTokenAmount = ref<string>('')
const destinationTokenAmount = ref<string>('')
const sourceTokenMaxAmount = ref<string>('')

const isModalTokensOpen = ref(false)
const isSourceChainToken = ref(false)
const isFaqOpen = ref(false)
const isGettingQuote = ref(false)
const isExecuteButtonDisabled = ref(true)
const isModalStatusOpen = ref(false)
const showTransactionAlert = ref(false)
const transactionAlertMessage = ref<string>('')
const isExecutingTransaction = ref<boolean>(false)


const selectedSourceToken = ref<IToken>({
    address: '',
    decimals: 0,
    img: '',
    name: '',
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    replaceByDefault(): void {
    },
    symbol: '',
})

const selectedDestinationToken = ref<IToken>({
    address: '',
    decimals: 0,
    img: '',
    name: '',
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    replaceByDefault(): void {
    },
    symbol: '',
})

const quotedPath = ref<GetQuoteResponse>({
    router: '',
    amountOut: '',
    destinationFee: '',
    originSwap: {
        code: '',
        tokenIn: {
            name: '',
            address: '',
        },
        tokenOut: {
            name: '',
            address: '',
        },
        data: '',
        required: false,
        amountOut: '',
        estimatedGas: '',
    },
    bridge: {
        tokenIn: {
            name: '',
            address: '',
        },
        tokenOut: {
            name: '',
            address: '',
        },
        toChainId: '',
        data: '',
        required: false,
        amountOut: '',
    },
    destinationSwap: {
        tokenIn: {
            name: '',
            address: '',
        },
        tokenOut: {
            name: '',
            address: '',
        },
        required: false,
    },
})
const sourceChainInfo = reactive<INetwork>({
    name: '',
    icon: '',
    id: '',
    tokens: [],
    rpcUrl: '',
    live: false,
})
const destinationChainInfo = reactive<INetwork>({
    name: '',
    icon: '',
    id: '',
    tokens: [],
    rpcUrl: '',
    live: false,
})
const switchChainInfo = reactive<INetwork>({
    name: '',
    icon: '',
    id: '',
    tokens: [],
    rpcUrl: '',
    live: false,
})

const steps = ref<TransactionSteps>({
    origin: {
        required: false,
        completed: false,
        tokenIn: '',
        tokenOut: '',
        amountIn: '',
        amountOut: '',
    },
    bridge: {
        required: false,
        completed: false,
        tokenIn: '',
        tokenOut: '',
        amountIn: '',
        amountOut: '',
    },
    destination: {
        required: false,
        completed: false,
        tokenIn: '',
        tokenOut: '',
        amountIn: '',
        amountOut: '',
    },
    completed: false,
})

const providersOnUse = ref<providers.BaseProvider[]>([])

const buttonLabel = computed({
    get: () => {
        if (showTransactionAlert.value) {
            return transactionAlertMessage.value
        } else if (isExecutingTransaction.value) {
            return 'Executing'
        } else {
            return 'Swidge'
        }
    },
    set: () => null,
})

/**
 * Resets the details of the source token
 */
const resetSelectedOriginToken = () => {
    selectedSourceToken.value.address = ''
    selectedSourceToken.value.decimals = 0
    selectedSourceToken.value.img = ''
    selectedSourceToken.value.name = ''
    selectedSourceToken.value.symbol = ''
}

/**
 * Decides if should quote for a possible path
 */
const shouldQuote = () => {
    return (
        selectedSourceToken.value.address &&
        selectedDestinationToken.value.address &&
        Number(sourceTokenAmount.value) !== 0
    )
}

/**
 * Handles the update of the amount on the origin amount
 */
const handleSourceInputChanged = () => {
    if (shouldQuote()) {
        onQuote()
    }
}

/**
 * Handles the opening of the token selection modal
 * @param isSource
 */
const handleOpenTokenList = (isSource: boolean) => {
    isSourceChainToken.value = isSource
    isModalTokensOpen.value = true
}


/**
 * Returns an array with the accepted networks
 */

const getNetworks = () => {
    return Array.from(networks.values()).filter(network => {
        return network.live
    })

}

/**
 * Handles a change of network when executed from outside the token selector
 * @param chainId
 */
const handleGlobalNetworkSwitched = (chainId: string) => {
    const chain = <INetwork>networks.get(chainId)
    updateOriginChainInfo(chain)
    resetSelectedOriginToken()
}

/**
 * Handles selection of a token from the selection modal
 * @param info
 */
const handleUpdateTokenFromModal = (info: {
    token: IToken
    chain: INetwork
}) => {
    if (isSourceChainToken.value) {
        // If the origin network is being chosen
        if (sourceChainInfo.id != info.chain.id) {
            // If we changed origin network, inform wallet
            switchToNetwork(info.chain.id).then(() => {
                updateOriginChainInfo(info.chain)
                updateOriginToken(info.token)
            })
        } else {
            updateOriginToken(info.token)
        }
    } else {
        // If the destination network is being chosen
        updateDestinationChainInfo(info.chain)
        // Update token details
        selectedDestinationToken.value = info.token
    }

    // Check if we can quote
    if (shouldQuote()) {
        onQuote()
    }

    // Close modal
    isModalTokensOpen.value = false
}

/**
 * Updates the details of source chain
 * @param chain
 */
const updateOriginChainInfo = (chain: INetwork) => {
    sourceChainInfo.id = chain.id
    sourceChainInfo.icon = chain.icon
    sourceChainInfo.name = chain.name
    sourceChainInfo.tokens = chain.tokens
}


/**
 * Updates the selected origin token
 * @param token
 */
const updateOriginToken = async (token: IToken) => {
    // If user selected a different token, update
    if (selectedSourceToken.value.address !== token.address) {
        // Update token details
        selectedSourceToken.value = token
        // Reset amount
        sourceTokenAmount.value = ''
        // Check user's token balance
        await updateTokenBalance(token.address)
    }
}

/**
 * Updates the balance of the selected token
 * @param address
 */
const updateTokenBalance = async (address: string) => {
    sourceTokenMaxAmount.value = await getBalance(address)
}

/**
 * Updates details of destination chain
 * @param chain
 */
const updateDestinationChainInfo = (chain: INetwork) => {
    destinationChainInfo.id = chain.id
    destinationChainInfo.icon = chain.icon
    destinationChainInfo.name = chain.name
    destinationChainInfo.tokens = chain.tokens
}

/**
 * Tokens Switch
 */

const switchTokenHandler = () => {
    const switchTokenSource = ref<IToken>({
        address: '',
        decimals: 0,
        img: '',
        name: '',
        symbol: '',
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        replaceByDefault(): void {
        }
    })

    switchTokenSource.value = selectedSourceToken.value
    selectedSourceToken.value = selectedDestinationToken.value
    selectedDestinationToken.value = switchTokenSource.value

    // Reset Input Values on Switch of Network+Token
    sourceTokenAmount.value = ''
    destinationTokenAmount.value = ''

    // Clean alert message in case there is
    transactionAlertMessage.value = 'Swidge'
}

/**
 * Sets the transition variable switchDestinationChain to Current source Chain info
 */
const switchHandlerFunction = () => {
    switchChainInfo.id = sourceChainInfo.id
    switchChainInfo.icon = sourceChainInfo.icon
    switchChainInfo.name = sourceChainInfo.name
    switchChainInfo.tokens = sourceChainInfo.tokens

    sourceChainInfo.id = destinationChainInfo.id
    sourceChainInfo.icon = destinationChainInfo.icon
    sourceChainInfo.name = destinationChainInfo.name
    sourceChainInfo.tokens = destinationChainInfo.tokens

    destinationChainInfo.id = switchChainInfo.id
    destinationChainInfo.icon = switchChainInfo.icon
    destinationChainInfo.name = switchChainInfo.name
    destinationChainInfo.tokens = switchChainInfo.tokens
}

/**
 * Quotes the possible path for a given pair and amount
 */
const onQuote = async () => {
    showTransactionAlert.value = false
    isExecuteButtonDisabled.value = true
    isGettingQuote.value = true

    if (!selectedSourceToken.value || !selectedDestinationToken.value) {
        return
    }
    try {
        const quote: GetQuoteResponse = await SwidgeAPI.getQuote({
            fromChainId: sourceChainInfo.id,
            srcToken: selectedSourceToken.value.address,
            toChainId: destinationChainInfo.id,
            dstToken: selectedDestinationToken.value.address,
            amount: sourceTokenAmount.value.toString(),
        })
        quotedPath.value = quote
        destinationTokenAmount.value = quote.amountOut
        isGettingQuote.value = false

        if (Number(sourceTokenAmount.value) > Number(sourceTokenMaxAmount.value)) {
            showTransactionAlert.value = true
            transactionAlertMessage.value = 'Insufficient Balance'
            return
        }
        isExecuteButtonDisabled.value = false
        transactionAlertMessage.value = ''
        showTransactionAlert.value = false
    } catch (e: unknown) {
        isGettingQuote.value = false
        isExecuteButtonDisabled.value = true
        if (e instanceof Error) {
            transactionAlertMessage.value = e.message
            showTransactionAlert.value = true
            destinationTokenAmount.value = ''
        } else {
            console.log('Unexpected error', e)
        }
    }
}

/**
 * Executes and stores the transaction
 */
const onExecuteTransaction = async () => {
    const amountIn = ethers.utils.parseUnits(
        sourceTokenAmount.value,
        selectedSourceToken.value.decimals
    )
    const contractCallPayload: RouterCallPayload = {
        router: quotedPath.value.router,
        amountIn: amountIn,
        destinationFee: BigNumber.from(quotedPath.value.destinationFee),
        originSwap: {
            providerCode: quotedPath.value.originSwap.code,
            tokenIn: quotedPath.value.originSwap.tokenIn.address,
            tokenOut: quotedPath.value.originSwap.tokenOut.address,
            data: quotedPath.value.originSwap.data,
            required: quotedPath.value.originSwap.required,
            estimatedGas: quotedPath.value.originSwap.estimatedGas,
        },
        bridge: {
            toChainId: quotedPath.value.bridge.toChainId,
            tokenIn: quotedPath.value.bridge.tokenIn.address,
            data: quotedPath.value.bridge.data,
            required: quotedPath.value.bridge.required,
        },
        destinationSwap: {
            tokenIn: quotedPath.value.destinationSwap.tokenIn.address,
            tokenOut: quotedPath.value.destinationSwap.tokenOut.address,
        },
    }

    setExecutingButton()

    const contractCall = await RouterCaller.call(contractCallPayload)

    openTransactionStatusModal()

    await contractCall
        .wait()
        .then(async (receipt: { transactionHash: string }) => {
            steps.value.origin.completed = true
            if (isCrossTransaction()) {
                setUpEventListener(receipt.transactionHash)
            } else {
                steps.value.completed = true
            }
        })
        .finally(() => {
            unsetExecutingButton()
        })
}

const isCrossTransaction = () => {
    return sourceChainInfo.id !== destinationChainInfo.id
}

/**
 * Sets the button to `executing` mode
 */
const setExecutingButton = () => {
    isExecutingTransaction.value = true
    isExecuteButtonDisabled.value = true
}

/**
 * Unsets the button from `executing` mode
 */
const unsetExecutingButton = () => {
    isExecutingTransaction.value = false
    isExecuteButtonDisabled.value = false
}

/**
 * Sets up the required listener to check for the events on the destination chain
 * It allows the frontend to know when the transaction has been completed
 * @param executedTxHash
 */
const setUpEventListener = (executedTxHash: string) => {
    const provider = getChainProvider(quotedPath.value.bridge.toChainId)

    const filter = {
        address: quotedPath.value.router,
        topics: [ethers.utils.id('CrossFinalized(bytes32,uint256)')],
    }

    provider.on(filter, (event: { data: ethers.utils.BytesLike }) => {
        const [txHash] = ethers.utils.defaultAbiCoder.decode(
            ['bytes32', 'uint256'],
            event.data
        )
        if (executedTxHash === txHash) {
            steps.value.bridge.completed = true
            steps.value.destination.completed = true
            steps.value.completed = true
            provider.off(filter)
        }
        // TODO : store finalAmount if we want it visible on the modal
    })

    providersOnUse.value.push(provider)
}

/**
 * Opens the transaction status modal after an executed transaction
 */
const openTransactionStatusModal = () => {
    steps.value.origin.tokenIn = quotedPath.value.originSwap.tokenIn.name
    steps.value.origin.tokenOut = quotedPath.value.originSwap.tokenOut.name
    steps.value.origin.amountIn = sourceTokenAmount.value
    steps.value.origin.amountOut = quotedPath.value.originSwap.amountOut
    steps.value.origin.required = quotedPath.value.originSwap.required
    steps.value.origin.completed = false

    steps.value.bridge.tokenIn = quotedPath.value.bridge.tokenIn.name
    steps.value.bridge.tokenOut = quotedPath.value.bridge.tokenOut.name
    steps.value.bridge.amountIn = quotedPath.value.originSwap.amountOut
    steps.value.bridge.amountOut = quotedPath.value.bridge.amountOut
    steps.value.bridge.required = quotedPath.value.bridge.required
    steps.value.bridge.completed = false

    steps.value.destination.tokenIn =
        quotedPath.value.destinationSwap.tokenIn.name
    steps.value.destination.tokenOut =
        quotedPath.value.destinationSwap.tokenOut.name
    steps.value.destination.amountIn = quotedPath.value.bridge.amountOut
    steps.value.destination.amountOut = quotedPath.value.amountOut
    steps.value.destination.required = quotedPath.value.destinationSwap.required
    steps.value.destination.completed = false

    steps.value.completed = false

    isModalStatusOpen.value = true
}
/**
 * Passes variables to TransactionSettingCoponent to display the calculated
 * Slippage, Fees and arriving Value.
 */
const slippage = '0.5%'
const bridgeFee = '2%'
const nativeValue = '5%'
/**
 * Closes the transaction status modal,
 * closing also all the listeners set on the providers
 */
const closeModalStatus = () => {
    providersOnUse.value.forEach((provider) => {
        provider.removeAllListeners()
    })
    providersOnUse.value = []
    isModalStatusOpen.value = false
}
</script>

<template>
    <div class="flex flex-col flex-grow bg-radial-gradient-pink">
        <Header class="py-2" @switch-network="handleGlobalNetworkSwitched($event)"></Header>
        <main class="flex items-center justify-center mt-20">
            <div class="flex gap-[2rem]">
                <div class="flex flex-col gap-6">
                    <div class="flex items-center justify-between">
                        <span class="text-3xl ">Swap & Bridge</span>
                        <ArrowCircleRightIcon
                            v-if="!isFaqOpen"
                            class="w-7 h-7 cursor-pointer"
                            @click="isFaqOpen = true"/>
                        <XCircleIcon
                            v-if="isFaqOpen"
                            class="w-7 h-7 cursor-pointer"
                            @click="isFaqOpen = false"/>
                    </div>
                    <div
                        class="
                            flex flex-col
                            gap-6
                            px-12
                            py-6
                            rounded-3xl
                            bg-cards-background-dark-grey
                        ">
                        <div class="flex flex-col w-full gap-4">
                            <span class="text-2xl">You send:</span>
                            <BridgeSwapSelectionCard
                                v-model:value="sourceTokenAmount"
                                :token="selectedSourceToken"
                                :chain-info="sourceChainInfo"
                                :balance="sourceTokenMaxAmount"
                                :disabled-input="false"
                                @input-changed="handleSourceInputChanged()"
                                @on-click-max-amount="handleSourceInputChanged()"
                                @open-token-list="() => handleOpenTokenList(true)"/>
                        </div>
                        <div>
                            <SwitchButton
                                @click="switchTokenHandler"
                                @switch="switchHandlerFunction"
                            />
                        </div>
                        <div class="flex flex-col w-full gap-4">
                            <span class="text-2xl">You receive:</span>
                            <BridgeSwapSelectionCard
                                v-model:value="destinationTokenAmount"
                                :chain-info="destinationChainInfo"
                                :disabled-input="true"
                                :token="selectedDestinationToken"
                                @open-token-list="() => handleOpenTokenList(false)"/>
                            <div>Placeholder</div>
                            <TransactionSettings
                                :slippage-value="slippage"
                                :native-value="nativeValue"
                                :bridge-fee-value="bridgeFee">
                            </TransactionSettings>
                        </div>
                        <BridgeSwapInteractiveButton
                            :text="buttonLabel"
                            :is-loading="isGettingQuote"
                            :disabled="isExecuteButtonDisabled"
                            :on-click="onExecuteTransaction"/>
                    </div>
                    <ModalNetworkAndTokenSelect
                        :is-modal-open="isModalTokensOpen"
                        :networks="getNetworks()"
                        :is-origin="isSourceChainToken"
                        @close-modal="isModalTokensOpen = false"
                        @update-token="handleUpdateTokenFromModal($event)"/>

                    <ModalSwidgeStatus
                        :steps="steps"
                        :show="isModalStatusOpen"
                        :source-chain="sourceChainInfo.name"
                        :destination-chain="destinationChainInfo.name"
                        @close-modal="closeModalStatus"/>
                </div>
                <FAQCard v-if="isFaqOpen"/>
            </div>
        </main>
    </div>
</template>
