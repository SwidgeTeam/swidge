<script setup lang='ts'>
import { ref } from 'vue'
import SearchInputBox from '../SearchInputBox.vue'
import NetworkLineSelector from '../NetworkLineSelector.vue'
import SelectTokenList from '../SelectTokenList.vue'
import IToken from '@/domain/tokens/IToken'
import { Networks } from '@/domain/chains/Networks'
import Modal from '@/components/Modals/Modal.vue'
import { ethers } from 'ethers'
import { useTokensStore } from '@/store/tokens'
import IERC20Abi from '@/contracts/IERC20.json'
import { INetwork } from '@/domain/chains/INetwork'
import { flatten } from 'lodash'

const tokensStore = useTokensStore()

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

const getNetworks = () => {
    return Networks.live()
}

const handleSetToken = (token: IToken) => {
    searchTerm.value = ''
    selectedNetworkId.value = ''
    emits('update-token', token)
}

const onCloseModal = () => {
    searchTerm.value = ''
    selectedNetworkId.value = ''
    emits('close-modal')
}

const handleModalClick = () => {
    searchComponent.value?.focusInput()
}

/**
 * Update the search term and
 * fetch matching tokens if it's an address
 * @param term
 */
const updateSearchTerm = async (term: string) => {
    searchTerm.value = term

    if (isTermAnAddress()) {
        matchingTokens.value = await loadMatchingTokens()
    }
}

/**
 * Tries to fetch the matching tokens of a specific address
 */
const loadMatchingTokens = async (): Promise<IToken[]> => {
    const address = searchTerm.value.toLowerCase().trim()
    const promises: Promise<any>[] = []
    Networks.live().forEach(network => {
        promises.push(fetchToken(network, address))
    })

    return flatten(await Promise.all(promises))
        .filter(token => token)
}

/**
 * Tries to fetch on-chain token details
 * @param network Network to check
 * @param address Address to check
 * @returns A token or undefined
 */
const fetchToken = async (network: INetwork, address: string): Promise<IToken | undefined> => {
    const provider = new ethers.providers.JsonRpcProvider(network.rpcUrl)
    const token = new ethers.Contract(
        address,
        IERC20Abi,
        provider,
    )

    try {
        const decimals = await token.functions.decimals()
        const name = await token.functions.name()
        const symbol = await token.functions.symbol()

        return {
            chainId: network.id,
            chainName: network.name,
            address: address,
            name: name[0],
            symbol: symbol[0],
            decimals: decimals[0],
            logo: '',
        }
    } catch (e) {
        // nothing to return
    }
}

/**
 * Returns the list of tokens that have to be shown on the modal
 */
const listTokens = () => {
    if (isTermAnAddress()) {
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
 * Returns the filtered token list
 */
const filteredTokens = () => {
    let tokens: IToken[]

    if (selectedNetworkId.value) {
        // If there's a selected network, get only the chain's tokens
        tokens = tokensStore.getChainTokens(selectedNetworkId.value)
    } else {
        // Otherwise get them all
        tokens = tokensStore.getTokens
    }

    const pattern = searchTerm.value.toLowerCase().trim()

    if (pattern) {
        // If there's a search pattern, filter only those that match
        tokens = tokens
            .filter(token => {
                return (
                    token.name.toLowerCase().includes(pattern) ||
                    token.symbol.toLowerCase().includes(pattern) ||
                    token.chainName.toLowerCase().includes(pattern)
                )
            })
    }

    return tokens
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
            placeholder="Search by token or network"
            @update:search-term="updateSearchTerm"/>
        <NetworkLineSelector
            v-model:selected-network-id="selectedNetworkId"
            :networks="getNetworks()"
            class="my-6"/>
        <SelectTokenList
            :is-origin="isOrigin"
            :tokens="listTokens()"
            :chain-list="getNetworks()"
            :search-term="searchTerm"
            :selected-network-id="selectedNetworkId"
            @set-token="handleSetToken($event)"/>
    </Modal>
</template>
