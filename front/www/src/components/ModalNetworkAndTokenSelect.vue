<script setup lang='ts'>
import { Dialog, DialogOverlay, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { XIcon } from '@heroicons/vue/solid'
import { ref } from 'vue'
import SearchInputBox from './SearchInputBox.vue'
import NetworkLineSelector from './NetworkLineSelector.vue'
import SelectTokenList from './SelectTokenList.vue'
import IToken from '@/domain/tokens/IToken'
import { Networks } from '@/domain/chains/Networks'

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
    <TransitionRoot
        as="template"
        :show="isModalOpen">
        <Dialog
            as="div"
            class="fixed inset-0 z-10 overflow-y-auto"
            @close="onCloseModal()">
            <div
                class="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <TransitionChild
                    as="template"
                    enter="ease-out duration-300"
                    enter-from="opacity-0"
                    enter-to="opacity-100"
                    leave="ease-in duration-200"
                    leave-from="opacity-100"
                    leave-to="opacity-0">
                    <DialogOverlay
                        class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"/>
                </TransitionChild>
                <span
                    class="hidden sm:inline-block sm:align-middle sm:h-screen"
                    aria-hidden="true">&#8203;</span>
                <TransitionChild
                    as="template"
                    enter="ease-out duration-300"
                    enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    enter-to="opacity-100 translate-y-0 sm:scale-100"
                    leave="ease-in duration-200"
                    leave-from="opacity-100 translate-y-0 sm:scale-100"
                    leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
                    <div
                        v-on:click=focusAlways()
                        class="inline-block w-full max-w-xl px-10 py-12 text-left relative align-middle transition-all transform shadow-xl bg-[#222129] rounded-2xl">
                        <XIcon
                            class="absolute w-5 top-6 right-6 cursor-pointer"
                            @click="onCloseModal()"/>
                        <SearchInputBox
                            v-model:search-term="searchTerm"
                            placeholder="Search by token or network"
                            ref="searchComponent"/>
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
                    </div>
                </TransitionChild>
            </div>
        </Dialog>
    </TransitionRoot>
</template>
