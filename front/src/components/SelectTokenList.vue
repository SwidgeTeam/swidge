<script setup lang='ts'>
import { ref } from 'vue';
import ButtonSelect from './ButtonSelect.vue';
import TokenDisplay from './TokenDisplay.vue';
import NetworkAndTokenNothingFound from './NetworkAndTokenNothingFound.vue';
import IToken from '@/tokens/models/IToken';
import { INetwork } from "@/models/INetwork";

const props = defineProps<{
    chainList: INetwork[]
    selectedNetworkId: string
    searchTerm: string
    isOrigin: boolean
}>()

const emits = defineEmits<{
    (event: 'set-token', { token, chain }: { token: IToken, chain: INetwork }): void
}>()

const filterList = [
    'Popular',
    'Alphabetical',
    'Recent'
]

const selectedFilter = ref('Popular')

const filteredChainList = (list: any) => {
    if (props.selectedNetworkId === '' && props.chainList.find((el: INetwork) => el.name.toLowerCase().includes(props.searchTerm))) {
        return list.filter((el: any) => el.name.toLowerCase().includes(props.searchTerm))
    } else {
        return list.filter((el: any) => props.selectedNetworkId === '' ? el : el.id === props.selectedNetworkId)
    }
}

const filteredTokenList = (tokenList: IToken[]) => {
    if (props.selectedNetworkId === '' && props.chainList.find((el: INetwork) => el.name.toLowerCase().includes(props.searchTerm))) {
        return tokenList
    } else {
        return tokenList
            .filter(
                (el: IToken) => {
                    return el.name.toLowerCase().includes(props.searchTerm) ||
                        el.symbol.toLowerCase().includes(props.searchTerm)
                })
            .filter(
                (el: IToken) => {
                    // TODO : remove when we allow not_required transaction on destination chain
                    if (!props.isOrigin) {
                        return el.address.toLowerCase() !== '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75'.toLowerCase() &&
                            el.address.toLowerCase() !== '0x2791bca1f2de4661ed88a30c99a7a9449aa84174'.toLowerCase();
                    }
                    return true;
                }
            )
    }
}

</script>

<template>
    <div class="text-lg font-roboto">
        <div class="flex gap-6 items-center">
            <span>Select Token:</span>
            <div class="flex gap-2 items-center">
                <span class="font-extralight text-sm mt-1">Filter</span>
                <ButtonSelect
                    v-model:selected="selectedFilter"
                    :list="filterList"/>
            </div>
            <span v-if="selectedNetworkId !== '' || searchTerm !== ''"
                  class="text-sm font-extralight mt-1 ml-auto">Network</span>
        </div>
        <div class="h-80 w-full overflow-y-auto">
            <NetworkAndTokenNothingFound
                v-if="selectedNetworkId === '' && searchTerm === ''"/>
            <ul v-if="selectedNetworkId !== '' || searchTerm !== ''"
                class="text-base flex flex-col mt-6">
                <template v-for="chain in filteredChainList(chainList)"
                          :key="chain.id">
                    <li
                        v-for="token in filteredTokenList(chain.tokens)"
                        :key="token.address"
                        class="hover:bg-cards-background-dark-grey py-3 rounded-xl cursor-pointer"
                        @click="emits('set-token', {
              token: {
                address: token.address,
                img: token.img,
                symbol: token.symbol,
                name: token.name,
                decimals: token.decimals,
                replaceByDefault: token.replaceByDefault
              },
              chain: chain
            })"
                    >
                        <TokenDisplay :token="token"
                                      :chain-name="chain.name"/>
                    </li>
                </template>
            </ul>
        </div>
    </div>
</template>
