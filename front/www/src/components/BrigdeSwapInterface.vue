<script setup lang="ts">
import { ref, computed } from 'vue'
import ModalNetworkAndTokenSelect from './ModalNetworkAndTokenSelect.vue'
import { RouterCaller } from '@/contracts/routerCaller'
import { useWeb3Store } from '@/store/web3'
import { ethers, providers } from 'ethers'
import ModalSwidgeStatus from './ModalSwidgeStatus.vue'
import IToken from '@/domain/tokens/IToken'
import { useTokensStore } from '@/store/tokens'
import { useRoutesStore } from '@/store/routes'
import SwapBox from '@/components/SwapBox.vue'
import Route, { TransactionDetails } from '@/domain/paths/path'
import { Erc20Caller } from '@/contracts/erc20Caller';

const web3Store = useWeb3Store()
const tokensStore = useTokensStore()
const routesStore = useRoutesStore()

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
        await routesStore.quotePath({
            fromChainId: tokensStore.getOriginChainId,
            srcToken: tokensStore.getOriginTokenAddress,
            toChainId: tokensStore.getDestinationChainId,
            dstToken: tokensStore.getDestinationTokenAddress,
            amount: sourceTokenAmount.value.toString(),
            slippage: 2,
            receiverAddress: web3Store.account || ethers.constants.AddressZero
        })

        const route = routesStore.getSelectedRoute

        destinationTokenAmount.value = route.amountOut
        isGettingQuote.value = false
        totalFee.value = route.steps.reduce((total, current) => {
            return total + Number(current.fee)
        }, 0).toFixed(2).toString()

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
    const route = routesStore.getSelectedRoute
    if (!route) {
        throw new Error('No path')
    }

    if(route.tx){
        await ownExecution(route.resume.tokenIn.address, route.tx)
    }
    else {
        // quote approval tx calldata

        // approve

        // quote tx calldata

        // execute
    }
}

const ownExecution = async (tokenIn: string, tx: TransactionDetails) => {
    await Erc20Caller.approveIfRequired(tokenIn, tx.to)

    setExecutingButton()

    const contractCall = await RouterCaller.call(tx)

    openTransactionStatusModal()

    await contractCall
        .wait()
        .then(async (receipt: { transactionHash: string }) => {
            routesStore.completeFirstStep()
            if (isCrossTransaction()) {
                setUpEventListener(tx, receipt.transactionHash)
            } else {
                routesStore.completeRoute()
            }
        })
        .finally(() => {
            unsetExecutingButton()
        })
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
    <SwapBox
        v-model:source-token-amount="sourceTokenAmount"
        :destination-token-amount="destinationTokenAmount"
        :source-token-max-amount="sourceTokenMaxAmount"
        :button-text="buttonLabel"
        :is-getting-quote="isGettingQuote"
        :is-execute-button-disabled="isExecuteButtonDisabled"
        :transaction-fees="totalFee"
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
        :show="isModalStatusOpen"
        @close-modal="closeModalStatus"
    />
</template>
