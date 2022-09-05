<script setup lang="ts">
import { ref, computed } from 'vue'
import { ethers, providers } from 'ethers'
import { useWeb3Store } from '@/store/web3'
import { useTokensStore } from '@/store/tokens'
import { useRoutesStore } from '@/store/routes'
import { useTransactionStore } from '@/store/transaction'
import ModalNetworkAndTokenSelect from '@/components/Modals/ModalNetworkAndTokenSelect.vue'
import ModalTransactionStatus from '@/components/Modals/ModalTransactionStatus.vue'
import ModalSettings from '@/components/Modals/ModalSettings.vue'
import Route, { TransactionDetails } from '@/domain/paths/path'
import Aggregators from '@/domain/aggregators/aggregators'
import { useToast } from 'vue-toastification'
import { TxHash } from '@/domain/wallets/IWallet'
import SendingBox from '@/components/SendingBox.vue'
import ReceivingBox from '@/components/ReceivingBox.vue'
import AdjustmentsIcon from './svg/AdjustmentIcon.vue'
import ReloadIcon from '@/components/svg/ReloadIcon.vue'
import ActionButton from '@/components/Buttons/ActionButton.vue'
import FromToArrow from '@/components/Icons/FromToArrow.vue'
import { IToken } from '@/domain/metadata/Metadata'

const web3Store = useWeb3Store()
const tokensStore = useTokensStore()
const routesStore = useRoutesStore()
const transactionStore = useTransactionStore()
const toast = useToast()

const { switchToNetwork, getChainProvider, getBalance } = web3Store

const sourceTokenAmount = ref<string>('')
const sourceTokenMaxAmount = ref<string>('')

const isModalTokensOpen = ref(false)
const isSourceChainToken = ref(false)
const isGettingQuote = ref(false)
const isExecuteButtonDisabled = ref(true)
const isModalStatusOpen = ref(false)
const isSettingsModalOpen = ref(false)
const showTransactionAlert = ref(false)
const transactionAlertMessage = ref<string>('')
const isExecutingTransaction = ref<boolean>(false)

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

const setButtonAlert = (text: string) => {
    transactionAlertMessage.value = text
    showTransactionAlert.value = true
}

const unsetButtonAlert = () => {
    transactionAlertMessage.value = ''
    showTransactionAlert.value = false
}

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
    const selectedOriginChainId = tokensStore.getOriginChainId
    const selectedDestinationChainId = tokensStore.getDestinationChainId
    const selectedOriginTokenAddress = tokensStore.getOriginTokenAddress
    const selectedDestinationTokenAddress = tokensStore.getDestinationTokenAddress

    if (isSourceChainToken.value) {
        // If the origin network is being chosen
        if (selectedOriginChainId != token.chainId) {
            // If network and token of source and destination are the same, switch inputs instead of setting new ones.
            if (token.chainId == selectedDestinationChainId && token.address == selectedDestinationTokenAddress) {
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
        if (token.chainId == selectedOriginChainId && token.address == selectedOriginTokenAddress) {
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
    sourceTokenAmount.value = ''
    isExecuteButtonDisabled.value = true
}

/**
 * Quotes the possible path for a given pair and amount
 */
const onQuote = async () => {
    if (!tokensStore.bothTokensSelected) {
        return
    }
    unsetButtonAlert()

    isGettingQuote.value = true
    isExecuteButtonDisabled.value = true

    try {
        await routesStore.quotePath(sourceTokenAmount.value)

        if (Number(sourceTokenAmount.value) > Number(sourceTokenMaxAmount.value)) {
            setButtonAlert('Insufficient Balance')
        } else {
            isExecuteButtonDisabled.value = false
        }
    } catch (e: unknown) {
        onQuotingError(e as Error)
    } finally {
        isGettingQuote.value = false
    }
}

/**
 * What to do when quoting fails
 * @param e
 */
const onQuotingError = (e: Error) => {
    setButtonAlert(e.message)
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
    const mainTx = transactionStore.mainTx
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
    const mainTx = transactionStore.mainTx
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
    const mainTx = transactionStore.mainTx
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
    if (isCrossTransaction()) {
        routesStore.completeFirstStep()
        if (route.aggregator.id === Aggregators.Swidge) {
            setUpEventListener(route.tx as TransactionDetails, txHash)
        } else {
            transactionStore.informExecutedTx(txHash)
            transactionStore.startCheckingStatus()
        }
    } else {
        routesStore.completeRoute()
    }
}

/**
 * Sets up the required listener to check for the events on the destination chain
 * It allows the frontend to know when the transaction has been completed
 * @param tx
 * @param executedTxHash
 */
const setUpEventListener = (tx: TransactionDetails, executedTxHash: string) => {
    const toChainId = tokensStore.getDestinationChainId
    const provider = getChainProvider(toChainId)

    const filter = {
        address: tx.to,
        topics: [ethers.utils.id('CrossFinalized(bytes32,uint256,address)')],
    }

    provider.on(filter, (event: { data: ethers.utils.BytesLike }) => {
        const [txHash] = ethers.utils.defaultAbiCoder.decode(
            ['bytes32', 'uint256', 'address'],
            event.data
        )
        if (executedTxHash === txHash) {
            routesStore.completeRoute()
            provider.off(filter)
        }
        // TODO : store finalAmount if we want it visible on the modal
    })

    providersOnUse.value.push(provider)
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
    providersOnUse.value.forEach((provider) => {
        provider.removeAllListeners()
    })
    providersOnUse.value = []
    isModalStatusOpen.value = false
}
</script>

<template>
    <div class="swap-interface">
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
                :balance="sourceTokenMaxAmount"
                @input-changed="handleSourceInputChanged"
                @select-token="() => handleOpenTokenList(true)"
            />
            <FromToArrow/>
            <ReceivingBox
                @select-token="() => handleOpenTokenList(false)"
            />
        </div>
        <ActionButton
            :text="buttonLabel"
            :is-loading="isGettingQuote"
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
