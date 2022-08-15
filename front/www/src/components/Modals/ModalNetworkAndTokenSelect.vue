<script setup lang='ts'>
import { ref } from 'vue'
import SearchInputBox from '../SearchInputBox.vue'
import NetworkLineSelector from '../NetworkLineSelector.vue'
import SelectTokenList from '../SelectTokenList.vue'
import IToken from '@/domain/tokens/IToken'
import { Networks } from '@/domain/chains/Networks'
import Modal from '@/components/Modals/Modal.vue'

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
const searchComponent = ref<any| null>(null)

const getNetworks = () => {
    return Networks.all().filter(network => {
        return network.live
    })
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

const focusAlways = () => {
    searchComponent.value?.focusInput()
}

</script>

<template>
    <Modal
        :is-open="isModalOpen"
        @click=focusAlways()
        @close="onCloseModal()"
    >
        <SearchInputBox
            ref="searchComponent"
            v-model:search-term="searchTerm"
            placeholder="Search by token or network"/>
        <NetworkLineSelector
            v-model:selected-network-id="selectedNetworkId"
            :networks="getNetworks()"
            class="my-6"/>
        <SelectTokenList
            :is-origin="isOrigin"
            :chain-list="getNetworks()"
            :search-term="searchTerm"
            :selected-network-id="selectedNetworkId"
            @set-token="handleSetToken($event)"/>
    </Modal>
</template>
