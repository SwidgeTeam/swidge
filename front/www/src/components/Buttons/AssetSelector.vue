<script setup lang="ts">
import { useTokensStore } from '@/store/tokens'
import AssetButtonSelected from '@/components/Buttons/AssetButtonSelected.vue'
import AssetButtonUnselected from '@/components/Buttons/AssetButtonUnselected.vue'
import IToken from '@/domain/tokens/IToken'

const tokensStore = useTokensStore()

const props = defineProps<{
    isOrigin: boolean
}>()

const emits = defineEmits<{
    (event: 'open-token-list'): void
}>()

const getToken = () => {
    if (props.isOrigin) {
        return tokensStore.getOriginToken() as IToken
    } else {
        return tokensStore.getDestinationToken() as IToken
    }
}
</script>

<template>
    <div
        class="flex
            justify-between
            gap-2
            cursor-pointer
            bg-[#2A2934]/100
            hover:bg-[#2A2934]/50
            rounded-2xl
            transition
            duration-150
            ease-out
            hover:ease-in
            asset-selector-shadow"
        @click="emits('open-token-list')"
    >
        <AssetButtonSelected
            v-if="getToken()"
            :is-origin="isOrigin"
            :token="getToken()"
        />
        <AssetButtonUnselected v-else/>
    </div>
</template>
