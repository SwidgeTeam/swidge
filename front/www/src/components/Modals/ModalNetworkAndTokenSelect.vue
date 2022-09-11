<script setup lang='ts'>
import { ref } from 'vue'
import SearchInputBox from '../SearchInputBox.vue'
import NetworkLineSelector from '../NetworkLineSelector.vue'
import SelectTokenList from '../SelectTokenList.vue'
import Modal from '@/components/Modals/Modal.vue'
import { ethers } from 'ethers'
import { useMetadataStore } from '@/store/metadata'
import IERC20Abi from '@/contracts/IERC20.json'
import ModalImportToken from '@/components/Modals/ModalImportToken.vue'
import { debounce } from 'lodash'
import { IChain, IToken } from '@/domain/metadata/Metadata'

const metadataStore = useMetadataStore()

defineProps<{
    isModalOpen: boolean
    isOrigin: boolean
}>()

const emits = defineEmits<{
    (event: 'close-modal'): void
    (event: 'update-token', token: IToken): void
}>()

const searchTerm = ref('')
const selectedNetworkId = ref('')
const searchComponent = ref<any | null>(null)
const matchingTokens = ref<IToken[]>([])
const checkingNetworks = ref<number>(0)
const isImportModalOpen = ref<boolean>(false)
const selectedTokenToImport = ref<IToken | null>(null)

const getNetworks = () => {
    return metadataStore.getChains
}

/**
 * Handles the event of a token being selected
 * @param token
 */
const handleSetToken = (token: IToken) => {
    searchTerm.value = ''
    selectedNetworkId.value = ''
    matchingTokens.value = []
    emits('update-token', token)
}

/**
 * Handles the event of a token being selected to import
 * @param token
 */
const handleSelectTokenToImport = (token: IToken) => {
    selectedTokenToImport.value = token
    isImportModalOpen.value = true
}

/**
 * Handles the event of a token being imported
 */
const handleImportToken = () => {
    if (selectedTokenToImport.value) {
        const token = selectedTokenToImport.value
        metadataStore.importToken(token)
        handleSetToken(token)
        selectedTokenToImport.value = null
    }
}

/**
 * Handle modal closing
 */
const onCloseModal = () => {
    searchTerm.value = ''
    selectedNetworkId.value = ''
    matchingTokens.value = []
    emits('close-modal')
}

const onCloseImportModal = () => {
    isImportModalOpen.value = false
}

const handleModalClick = () => {
    searchComponent.value?.focusInput()
}

/**
 * Update the search term and
 * fetch matching tokens if it's an address
 * @param term
 */
const updateSearchTerm = (term: string) => {
    searchTerm.value = term
    matchingTokens.value = []

    if (showCustomTokens()) {
        loadMatchingTokens()
    }
}

const handlerUpdateSearchTerm = debounce(updateSearchTerm, 300)

/**
 * Tries to fetch the matching tokens of a specific address
 */
const loadMatchingTokens = () => {
    const address = searchTerm.value.toLowerCase().trim()
    const liveNetworks = getNetworks()
    checkingNetworks.value = liveNetworks.length
    liveNetworks.forEach(network => {
        fetchToken(network, address).then(token => {
            if (token) {
                matchingTokens.value.push(token)
            }
            checkingNetworks.value--
        })
    })
}

/**
 * Tries to fetch on-chain token details
 * @param network Network to check
 * @param address Address to check
 * @returns A token or undefined
 */
const fetchToken = async (network: IChain, address: string): Promise<IToken | undefined> => {
    const provider = new ethers.providers.JsonRpcProvider(network.rpcUrls[0])
    const token = new ethers.Contract(
        address,
        IERC20Abi,
        provider,
    )

    try {
        const decimals = await token.functions.decimals()
        const name = await token.functions.name()
        const symbol = await token.functions.symbol()
        const balance = await token.functions.balanceOf(address)

        return {
            chainId: network.id,
            chainName: network.name,
            address: address,
            name: name[0],
            symbol: symbol[0],
            decimals: decimals[0],
            logo: '',
            price: '0',
            balance: balance,
        }
    } catch (e) {
        // nothing to return
    }
}

/**
 * Returns the list of tokens that have to be shown on the modal
 */
const listTokens = () => {
    if (showCustomTokens()) {
        return matchingTokens.value
    } else {
        return filteredTokens()
    }
}

/**
 * Checks if the introduced search term is an address
 */
const isTermAnAddress = () => {
    try {
        ethers.utils.getAddress(searchTerm.value.toLowerCase().trim())
        return true
    } catch (e) {
        // not an address, just a term
        return false
    }
}

/**
 * Whether to show the custom fetched tokens
 */
const showCustomTokens = () => {
    return isTermAnAddress() && !existsAddressOnList()
}

/**
 * Checks if an address exists on the list
 */
const existsAddressOnList = (): boolean => {
    const tokens = metadataStore.getTokensByAddress(searchTerm.value)
    return tokens ? tokens.length > 0 : false
}

/**
 * Returns the filtered token list
 */
const filteredTokens = () => {
    // for performance issues,
    // we only search the whole set of tokens if at least 3 characters
    if (!selectedNetworkId.value && searchTerm.value.length < 3) return []

    let tokens: IToken[]

    if (selectedNetworkId.value) {
        // If there's a selected network, get only the chain's tokens
        tokens = metadataStore.getChainTokens(selectedNetworkId.value)
    } else {
        // Otherwise get them all
        tokens = metadataStore.getTokens
    }

    const pattern = searchTerm.value.toLowerCase().trim()

    if (pattern) {
        // If there's a search pattern, filter only those that match
        tokens = tokens
            .filter(token => {
                return (
                    token.address.toLowerCase().includes(pattern) ||
                    token.name.toLowerCase().includes(pattern) ||
                    token.symbol.toLowerCase().includes(pattern) ||
                    token.chainName.toLowerCase().includes(pattern)
                )
            })
    }

    return tokens.sort((a: IToken, b: IToken) => {
        if (a.balance.gt(b.balance)) {
            return -1
        } else if (b.balance.gt(a.balance)) {
            return 1
        } else {
            return 0
        }
    })
}

</script>

<template>
    <Modal
        :is-open="isModalOpen"
        @click="handleModalClick()"
        @close="onCloseModal()"
    >
        <SearchInputBox
            ref="searchComponent"
            :search-term="searchTerm"
            @update:search-term="handlerUpdateSearchTerm"
            @clear-input="searchTerm = ''"/>
        <NetworkLineSelector
            v-model:selected-network-id="selectedNetworkId"
            :networks="getNetworks()"
            class="my-3"/>
        <SelectTokenList
            :is-origin="isOrigin"
            :tokens="listTokens()"
            :custom-tokens="showCustomTokens()"
            :loading-custom-tokens="checkingNetworks > 0"
            :chain-list="getNetworks()"
            :search-term="searchTerm"
            :selected-network-id="selectedNetworkId"
            @set-token="handleSetToken($event)"
            @import-token="handleSelectTokenToImport($event)"/>
    </Modal>
    <ModalImportToken
        :is-open="isImportModalOpen"
        @close="onCloseImportModal()"
        @import-token="handleImportToken()"
    />
</template>
