<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useWeb3Store } from '@/store/web3'
import { useRoutesStore } from '@/store/routes'
import { useTransactionStore } from '@/store/transaction'
import ModalNetworkAndTokenSelect from '@/components/Modals/ModalNetworkAndTokenSelect.vue'
import ModalTransactionStatus from '@/components/Modals/ModalTransactionStatus.vue'
import ModalSettings from '@/components/Modals/ModalSettings.vue'
import Route from '@/domain/paths/path'
import { useToast } from 'vue-toastification'
import { TxHash } from '@/domain/wallets/IWallet'
import SendingBox from '@/components/SendingBox.vue'
import ReceivingBox from '@/components/ReceivingBox.vue'
import AdjustmentsIcon from './svg/AdjustmentIcon.vue'
import ReloadIcon from '@/components/svg/ReloadIcon.vue'
import ActionButton from '@/components/Buttons/ActionButton.vue'
import FromToArrow from '@/components/Buttons/FromToArrow.vue'
import { IToken } from '@/domain/metadata/Metadata'
import RecipientUserCard from '@/components/RecipientUserCard.vue'
import { storeToRefs } from 'pinia'
import { indexedErrors } from '@/api/models/get-quote'

const web3Store = useWeb3Store()
const routesStore = useRoutesStore()
const transactionStore = useTransactionStore()
const { isValidReceiverAddress } = storeToRefs(routesStore)
const { isConnected } = storeToRefs(web3Store)
const toast = useToast()

const sourceTokenAmount = ref<string>('')

const isModalTokensOpen = ref(false)
const isSourceChainToken = ref(false)
const isExecuteButtonDisabled = ref(true)
const isModalStatusOpen = ref(false)
const isSettingsModalOpen = ref(false)
const showTransactionAlert = ref(false)
const transactionAlertMessage = ref<string>('')
const isExecutingTransaction = ref<boolean>(false)

const buttonLabel = computed({
    get: () => {
        if (!web3Store.isConnected) {
            return 'Connect wallet'
        } else if (showTransactionAlert.value) {
            return transactionAlertMessage.value
        } else if (isExecutingTransaction.value) {
            return 'Executing'
        } else {
            return 'Swidge'
        }
    },
    set: () => null,
})

const setButtonAlert = (text: string) => {
    transactionAlertMessage.value = text
    showTransactionAlert.value = true
}

const unsetButtonAlert = () => {
    transactionAlertMessage.value = ''
    showTransactionAlert.value = false
}

watch(isValidReceiverAddress, (isValid) => {
    if (!isValid) {
        setButtonAlert('Invalid receiver')
    } else {
        unsetButtonAlert()
    }
})

watch(isConnected, (connected) => {
    if (connected) {
        if (shouldQuote()) {
            onQuote()
        }
    }
})

const destinationChainSelected = computed({
    get: () => {
        return routesStore.getDestinationChainId
    },
    set: () => null
})
/**
 * Decides if should quote for a possible path
 */
const shouldQuote = () => {
    return (
        routesStore.bothTokensSelected &&
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
 * Handles selection of a token from the selection modal
 * @param token
 */
const handleUpdateTokenFromModal = (token: IToken) => {
    const selectedOriginChainId = routesStore.getOriginChainId
    const selectedDestinationChainId = routesStore.getDestinationChainId
    const selectedOriginTokenAddress = routesStore.getOriginTokenAddress
    const selectedDestinationTokenAddress = routesStore.getDestinationTokenAddress

    if (isSourceChainToken.value) {
        // If the origin network is being chosen
        if (selectedOriginChainId != token.chainId) {
            // If network and token of source and destination are the same, switch inputs instead of setting new ones.
            if (token.chainId == selectedDestinationChainId && token.address == selectedDestinationTokenAddress) {
                switchHandlerFunction()
            } else {
                updateOriginToken(token)
            }
        } else {
            updateOriginToken(token)
        }
    } else {
        if (token.chainId == selectedOriginChainId && token.address == selectedOriginTokenAddress) {
            switchHandlerFunction()
        } else {
            // Update token details
            routesStore.selectDestinationToken(token.chainId, token.address)
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
    const originTokenAddress = routesStore.getOriginTokenAddress
    const originTokenChainId = routesStore.getOriginChainId
    // If user selected a different token, update
    if (originTokenAddress !== token.address || originTokenChainId !== token.chainId) {
        // Update token details
        routesStore.selectOriginToken(token.chainId, token.address)
        // Reset amount
        sourceTokenAmount.value = ''
        // Check user's token balance
    }
}

/**
 * Sets the transition variable switchDestinationChain to Current source Chain info
 */
const switchHandlerFunction = () => {
    routesStore.switchTokens()
    sourceTokenAmount.value = ''
    isExecuteButtonDisabled.value = true
}

/**
 * Quotes the possible path for a given pair and amount
 */
const onQuote = async () => {
    if (!routesStore.bothTokensSelected) {
        return
    }
    unsetButtonAlert()

    isExecuteButtonDisabled.value = true

    try {
        await routesStore.quotePath(sourceTokenAmount.value)

        const thereAreRoutes = routesStore.getAllRoutes.length > 0
        if (!thereAreRoutes) {
            isExecuteButtonDisabled.value = false
        } else if (Number(sourceTokenAmount.value) > Number(routesStore.getSelectedTokenBalance)) {
            setButtonAlert('Insufficient Balance')
        } else {
            isExecuteButtonDisabled.value = false
        }
    } catch (e: unknown) {
        onQuotingError(e as Error)
    }
}

/**
 * What to do when quoting fails
 * @param e
 */
const onQuotingError = (e: Error) => {
    const errorMessage = indexedErrors[e.message] ?? 'Unhandled error!'
    setButtonAlert(errorMessage)
    isExecuteButtonDisabled.value = true
}

/**
 * Executes the transaction process
 */
const onExecuteTransaction = async () => {
    const route = routesStore.getSelectedRoute
    if (!route) {
        throw new Error('No route')
    }
    if (!routesStore.isValidReceiverAddress) {
        // should never happen because button should be disabled
        // but better safe than sorry
        throw new Error('Invalid receiver address')
    }

    // Make sure on the correct chain
    await web3Store.switchToNetwork(route.resume.fromChain)

    setExecutingButton()

    await transactionStore.setCurrentNonce()

    let promise
    const aggregator = route.aggregator

    if (!aggregator.requiresCallDataQuoting) {
        promise = executeRoute()
    } else {
        promise = aggregator.bothQuotesInOne
            ? executeSingleQuoteExecution()
            : executeDoubleQuoteExecution()
    }

    await promise
        .then((txHash: TxHash) => {
            onInitialTxCompleted(route, txHash)
        })
        .catch((error) => {
            console.log(error)
            toast.error('Transaction failed')
            closeModalStatus()
        })
        .finally(() => {
            unsetExecutingButton()
        })
}

/**
 * Executes the route when the aggregator already sent all the callData
 */
const executeRoute = async (): Promise<TxHash> => {
    const approvalTx = transactionStore.getApprovalTx
    const mainTx = transactionStore.getMainTx
    if (!mainTx) {
        throw new Error('trying to execute an empty transaction')
    }
    if (approvalTx) {
        await web3Store.sendApprovalTransaction(approvalTx)
    }
    openTransactionStatusModal()

    return web3Store.sendMainTransaction(mainTx)
}

/**
 * Executes the route when the aggregator requires quoting the callData
 */
const executeSingleQuoteExecution = async (): Promise<TxHash> => {
    await transactionStore.fetchBothTxs(sourceTokenAmount.value)
    const approvalTx = transactionStore.getApprovalTx
    const mainTx = transactionStore.getMainTx
    if (!mainTx) {
        throw new Error('trying to execute an empty transaction')
    }
    if (approvalTx) {
        await web3Store.sendApprovalTransaction(approvalTx)
    }
    openTransactionStatusModal()
    return web3Store.sendMainTransaction(mainTx)
}

/**
 * Executes the route when the aggregator requires quoting the callData
 */
const executeDoubleQuoteExecution = async (): Promise<TxHash> => {
    await transactionStore.fetchApprovalTx()
    const approvalTx = transactionStore.getApprovalTx
    if (approvalTx) {
        await web3Store.sendApprovalTransaction(approvalTx)
    }
    await transactionStore.fetchMainTx()
    const mainTx = transactionStore.getMainTx
    if (!mainTx) {
        throw new Error('trying to execute an empty transaction')
    }
    openTransactionStatusModal()
    return web3Store.sendMainTransaction(mainTx)
}

/**
 * Manages the process once the tx has been executed
 * @param route
 * @param txHash
 */
const onInitialTxCompleted = (route: Route, txHash: TxHash) => {
    transactionStore.informExecutedTx(txHash)
    if (routesStore.isCrossChainRoute) {
        routesStore.completeFirstStep()
        transactionStore.startCheckingStatus()
    } else {
        routesStore.completeRoute()
    }
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
 * Opens the transaction status modal after an executed transaction
 */
const openTransactionStatusModal = () => {
    isModalStatusOpen.value = true
}

/**
 * Closes the transaction status modal,
 * closing also all the listeners set on the providers
 */
const closeModalStatus = () => {
    isModalStatusOpen.value = false
}
</script>

<template>
    <div class="flex flex-col gap-3 px-3 pb-2 md:mt-[15px] w-full max-w-sm rounded-xl md:bg-[#5A5564]/30">
        <div class="flex justify-end gap-2 py-2 h-[var(--settings-line-height)]">
            <ReloadIcon
                class="w-5 h-5 cursor-pointer"
                @click="onQuote"
            />
            <AdjustmentsIcon
                class="w-5 h-5 cursor-pointer"
                @click="isSettingsModalOpen = true"
            />
        </div>
        <div class="flex flex-col">
            <SendingBox
                v-model:value="sourceTokenAmount"
                @input-changed="handleSourceInputChanged"
                @select-token="() => handleOpenTokenList(true)"
            />
            <FromToArrow
                @switch-tokens="switchHandlerFunction"
            />
            <ReceivingBox
                @select-token="() => handleOpenTokenList(false)"
            />
        </div>
        <RecipientUserCard
            v-if="destinationChainSelected"
        />
        <ActionButton
            :text="buttonLabel"
            :disabled="isExecuteButtonDisabled"
            :on-click="onExecuteTransaction"
        />
    </div>

    <ModalNetworkAndTokenSelect
        :is-modal-open="isModalTokensOpen"
        :is-origin="isSourceChainToken"
        @close-modal="isModalTokensOpen = false"
        @update-token="handleUpdateTokenFromModal($event)"
    />
    <ModalSettings
        :is-open="isSettingsModalOpen"
        @close-modal="isSettingsModalOpen = false"
    />
    <ModalTransactionStatus
        :show="isModalStatusOpen"
        @close-modal="closeModalStatus"
    />
</template>
