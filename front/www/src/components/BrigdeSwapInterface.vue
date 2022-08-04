<script setup lang="ts">
import { ref, computed } from 'vue'
import ModalNetworkAndTokenSelect from './ModalNetworkAndTokenSelect.vue'
import GetQuoteResponse from '@/api/models/get-quote-response'
import { RouterCaller, RouterCallPayload } from '@/contracts/routerCaller'
import { useWeb3Store } from '@/store/web3'
import { BigNumber, ethers, providers } from 'ethers'
import ModalSwidgeStatus from './ModalSwidgeStatus.vue'
import { TransactionSteps } from '@/models/TransactionSteps'
import IToken from '@/domain/tokens/IToken'
import { useTokensStore } from '@/store/tokens'
import { usePathsStore } from '@/store/paths'
import SwapBox from '@/components/SwapBox.vue'

const web3Store = useWeb3Store()
const tokensStore = useTokensStore()
const transactionStore = usePathsStore()

const { switchToNetwork, getChainProvider, getBalance } = web3Store

const sourceTokenAmount = ref<string>('')
const destinationTokenAmount = ref<string>('')
const sourceTokenMaxAmount = ref<string>('')
const totalFee = ref<string>('')

const isModalTokensOpen = ref(false)
const isSourceChainToken = ref(false)
const isGettingQuote = ref(false)
const isExecuteButtonDisabled = ref(true)
const isModalStatusOpen = ref(false)
const showTransactionAlert = ref(false)
const transactionAlertMessage = ref<string>('')
const isExecutingTransaction = ref<boolean>(false)

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
 * Decides if should quote for a possible path
 */
const shouldQuote = () => {
    return (
        tokensStore.bothTokensSelected &&
        Number(sourceTokenAmount.value) !== 0
    )
}

/**
 * Updates the input amount
 * @param value
 */
const handleSourceInputUpdate = (value: string) => {
    sourceTokenAmount.value = value
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
 * Handles selection of a token from the selection modal
 * @param token
 */
const handleUpdateTokenFromModal = (token: IToken) => {
    const originChainId = tokensStore.getOriginChainId
    const destinationChainId = tokensStore.getDestinationChainId
    const originTokenAddress = tokensStore.getOriginTokenAddress
    const destinationTokenAddress = tokensStore.getDestinationTokenAddress

    if (isSourceChainToken.value) {
        // If the origin network is being chosen
        if (originChainId != token.chainId) {
            // If network and token of source and destination are the same, switch inputs instead of setting new ones.
            if (token.chainId == destinationChainId && token.address == destinationTokenAddress) {
                switchHandlerFunction()
            } else {
                // If we changed origin network, inform wallet
                switchToNetwork(token.chainId).then(() => {
                    updateOriginToken(token)
                })
            }
        } else {
            updateOriginToken(token)
        }
    } else {
        if (token.chainId == originChainId && token.address == originTokenAddress) {
            switchHandlerFunction()
        } else {
            // Update token details
            tokensStore.selectDestinationToken(token.chainId, token.address)
        }
    }

    // Check if we can quote
    if (shouldQuote()) {
        onQuote()
    }

    // Close modal
    isModalTokensOpen.value = false
}

/**
 * Updates the selected origin token
 * @param token
 */
const updateOriginToken = async (token: IToken) => {
    const originTokenAddress = tokensStore.getOriginTokenAddress
    // If user selected a different token, update
    if (originTokenAddress !== token.address) {
        // Update token details
        tokensStore.selectOriginToken(token.chainId, token.address)
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
 * Sets the transition variable switchDestinationChain to Current source Chain info
 */
const switchHandlerFunction = () => {
    tokensStore.switchTokens()

    //Reset Input Values on Switch of Network+Token
    sourceTokenAmount.value = ''
    destinationTokenAmount.value = ''
    totalFee.value = ''

    // Clean alert message in case there is
    transactionAlertMessage.value = 'Swidge'
    isExecuteButtonDisabled.value = true
}

/**
 * Quotes the possible path for a given pair and amount
 */
const onQuote = async () => {
    showTransactionAlert.value = false
    isExecuteButtonDisabled.value = true
    isGettingQuote.value = true

    if (!tokensStore.bothTokensSelected) {
        return
    }

    try {
        await transactionStore.quotePath({
            fromChainId: tokensStore.getOriginChainId,
            srcToken: tokensStore.getOriginTokenAddress,
            toChainId: tokensStore.getDestinationChainId,
            dstToken: tokensStore.getDestinationTokenAddress,
            amount: sourceTokenAmount.value.toString(),
        })

        const path = transactionStore.getPath
        destinationTokenAmount.value = path.amountOut
        isGettingQuote.value = false
        totalFee.value = (
            Number(path.originSwap.fee) +
            Number(path.bridge.fee) +
            Number(path.destinationSwap.fee)
        ).toFixed(2).toString()

        if (
            Number(sourceTokenAmount.value) > Number(sourceTokenMaxAmount.value)
        ) {
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
            totalFee.value = ''
        } else {
            console.log('Unexpected error', e)
        }
    }
}

/**
 * Executes and stores the transaction
 */
const onExecuteTransaction = async () => {
    const originToken = tokensStore.getOriginToken()
    if (!originToken) {
        throw new Error('Undefined origin token')
    }
    const path = transactionStore.getPath
    if (!path) {
        throw new Error('No path')
    }
    const amountIn = ethers.utils.parseUnits(
        sourceTokenAmount.value,
        originToken.decimals
    )
    const contractCallPayload: RouterCallPayload = {
        router: path.router,
        amountIn: amountIn,
        destinationFee: BigNumber.from(path.destinationFee),
        originSwap: {
            providerCode: path.originSwap.code,
            tokenIn: path.originSwap.tokenIn.address,
            tokenOut: path.originSwap.tokenOut.address,
            data: path.originSwap.data,
            required: path.originSwap.required,
            estimatedGas: path.originSwap.estimatedGas,
        },
        bridge: {
            toChainId: path.bridge.toChainId,
            tokenIn: path.bridge.tokenIn.address,
            data: path.bridge.data,
            required: path.bridge.required,
        },
        destinationSwap: {
            tokenIn: path.destinationSwap.tokenIn.address,
            tokenOut: path.destinationSwap.tokenOut.address,
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
                setUpEventListener(path, receipt.transactionHash)
            } else {
                steps.value.completed = true
            }
        })
        .finally(() => {
            unsetExecutingButton()
        })
}

const isCrossTransaction = () => {
    return !tokensStore.sameChainAssets
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
 * @param path
 * @param executedTxHash
 */
const setUpEventListener = (path: GetQuoteResponse, executedTxHash: string) => {
    const provider = getChainProvider(path.bridge.toChainId)

    const filter = {
        address: path.router,
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
    const path = transactionStore.getPath
    if (!path) {
        throw new Error('No path')
    }
    steps.value.origin.tokenIn = path.originSwap.tokenIn.name
    steps.value.origin.tokenOut = path.originSwap.tokenOut.name
    steps.value.origin.amountIn = sourceTokenAmount.value
    steps.value.origin.amountOut = path.originSwap.amountOut
    steps.value.origin.required = path.originSwap.required
    steps.value.origin.completed = false

    steps.value.bridge.tokenIn = path.bridge.tokenIn.name
    steps.value.bridge.tokenOut = path.bridge.tokenOut.name
    steps.value.bridge.amountIn = path.originSwap.amountOut
    steps.value.bridge.amountOut = path.bridge.amountOut
    steps.value.bridge.required = path.bridge.required
    steps.value.bridge.completed = false

    steps.value.destination.tokenIn = path.destinationSwap.tokenIn.name
    steps.value.destination.tokenOut = path.destinationSwap.tokenOut.name
    steps.value.destination.amountIn = path.bridge.amountOut
    steps.value.destination.amountOut = path.amountOut
    steps.value.destination.required = path.destinationSwap.required
    steps.value.destination.completed = false

    steps.value.completed = false

    isModalStatusOpen.value = true
}

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
    <SwapBox
        :source-token-amount="sourceTokenAmount"
        :destination-token-amount="destinationTokenAmount"
        :source-token-max-amount="sourceTokenMaxAmount"
        :button-text="buttonLabel"
        :is-getting-quote="isGettingQuote"
        :is-execute-button-disabled="isExecuteButtonDisabled"
        :transaction-fees="totalFee"
        @update:source-token-amount="handleSourceInputUpdate"
        @source-input-changed="handleSourceInputChanged"
        @select-source-token="() => handleOpenTokenList(true)"
        @select-destination-token="() => handleOpenTokenList(false)"
        @switch-tokens="switchHandlerFunction"
        @execute-transaction="onExecuteTransaction"
    />
    <ModalNetworkAndTokenSelect
        :is-modal-open="isModalTokensOpen"
        :is-origin="isSourceChainToken"
        @close-modal="isModalTokensOpen = false"
        @update-token="handleUpdateTokenFromModal($event)"
    />
    <ModalSwidgeStatus
        :steps="steps"
        :show="isModalStatusOpen"
        @close-modal="closeModalStatus"
    />
</template>
