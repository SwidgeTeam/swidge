<script setup lang='ts'>
import { useRoutesStore } from '@/store/routes'
import Route from '@/domain/paths/path'
import ModalFull from '@/components/Modals/ModalFull.vue'
import SwidgeLogo from '../svg/SwidgeLogo.vue';
import TokenLogo from '@/components/Icons/TokenLogo.vue'
import ChainLogo from '@/components/Icons/ChainLogo.vue'
import { IToken } from '@/domain/metadata/Metadata'
import { useMetadataStore } from '@/store/metadata'

const routesStore = useRoutesStore()
const metadataStore = useMetadataStore()


const props = defineProps<{
    show: boolean
    token: IToken
}>()

const emits = defineEmits<{
    (event: 'close-modal'): void
}>()

const getRoute = (): Route => {
    return routesStore.getSelectedRoute
}

const getChainLogo = () => {
    const chain = metadataStore.getChain(props.token.chainId)
    return chain ? chain.logo : ''
}

</script>

<template>
    <ModalFull
        :is-open="show"
        @close="emits('close-modal')">

        <div class="grid grid-rows-5 flex">
            <div class="flex justify-start">                        
                <SwidgeLogo
                    class="xs:w-24 sm:w-32 w-32 top-2 left-2  cursor-pointer"
                 />
            </div>
            <div class="flex justify-center">
                Timer
            </div>
            <div class="flex justify-center">
                <div>
                    <div class="relative w-6">
                        From Token
                    </div>
                </div>
                <div>
                    arrow
                </div>
                <div>
                    To token
                </div>
            </div>
            <div class="grid grid-rows-2 flex justify-center">
                <div>Start Chain Hash</div>
                <div>Dest. Chain Hash</div>
            </div>
            <div class="grid grid-rows-2 flex justify-center">
                <div>Twitter</div>
                <div>Discord</div>
            </div>
            
        </div>

        <div v-if="getRoute().completed" class="flex flex-col items-center">
            <div class="text-3xl font-bold">Swidge successful!</div>
        </div>
    </ModalFull>
</template>
