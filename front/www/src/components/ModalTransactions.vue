<script setup lang='ts'>
import { Dialog, DialogOverlay, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { XIcon } from '@heroicons/vue/solid'
import SwidgeAPI from '@/api/swidge-api'
import { useWeb3Store } from '@/store/web3'
import { onUpdated, ref } from 'vue'
import { Transaction } from '@/api/models/transactions'
import networks from '@/assets/Networks'

const web3Store = useWeb3Store()

const props = defineProps({
    isOpen: {
        type: Boolean,
        default: true
    },
})

const emits = defineEmits<{
    (event: 'close-modal'): void
    (event: 'show-transactions'): void
}>()

const onCloseModal = () => {
    emits('close-modal')
}

const transactions = ref<Transaction[]>([])
const isLoading = ref<boolean>(false)

onUpdated(async () => {
    if (props.isOpen) {
        isLoading.value = true
        await loadData()
            .then(txs => {
                transactions.value = txs
                isLoading.value = false
            })
    }
})

const loadData = async () => {
    return SwidgeAPI.getTransactions(web3Store.account)
        .then(transactionList => {
            return transactionList.transactions
        })
}

const transformDate = (timestamp: number) => {
    const year = new Date(timestamp).getFullYear()
    const month = new Date(timestamp).getMonth()
    const day = new Date(timestamp).getDay()
    const hours = new Date(timestamp).getHours()
    const minutes = new Date(timestamp).getMinutes()
    const date = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes
    return date
}

</script>

<template>
    <TransitionRoot
        as="template"
        :show="isOpen"
    >
        <Dialog
            as="div"
            class="fixed inset-0 z-10 overflow-y-auto"
            @close="onCloseModal()"
        >
            <div class="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <TransitionChild
                    as="template"
                    enter="ease-out duration-300"
                    enter-from="opacity-0"
                    enter-to="opacity-100"
                    leave="ease-in duration-200"
                    leave-from="opacity-100"
                    leave-to="opacity-0">
                    <DialogOverlay class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"/>
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
                        class="inline-block w-full max-w-xl px-10 py-12 text-left relative align-middle transition-all transform shadow-xl bg-[#222129] rounded-2xl"
                    >
                        <XIcon
                            class="absolute w-5 top-6 right-6 cursor-pointer"
                            @click="onCloseModal()"
                        />
                        <div v-if="isLoading">
                            loading
                        </div>
                        <div v-if="!isLoading && transactions.length < 1" class="text-center">
                            No transactions
                        </div>
                        <div v-if="!isLoading && transactions.length > 1">
                            <li
                                v-for="i in transactions"
                                class="grid content-center gradient-border-header-main flex flex-wrap justify-between gap-2 mb-4 p-2">
                                <div> Date: {{ transformDate(+i.date) }}</div>
                                <div> Amount swaped: {{ i.amountIn }}</div>
                                <div> From chain: {{ networks.get(i.fromChain)?.name }}</div>
                                <div> To chain: {{ networks.get(i.toChain)?.name }}</div>
                                <div> Transaction status: {{ i.status }}</div>
                                <div> From Token: {{ i.srcAsset }}</div>
                                <div> To Token: {{ i.dstAsset }}</div>

                            </li>
                        </div>
                        <div v-else>
                            test
                        </div>
                    </div>
                </TransitionChild>
            </div>
        </Dialog>
    </TransitionRoot>
</template>
