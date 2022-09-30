<script setup lang="ts">
import { Popover, PopoverButton, PopoverPanel, TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue'
import { useWeb3Store } from '@/store/web3'
import { storeToRefs } from 'pinia'
import { useMetadataStore } from '@/store/metadata'
import { computed } from 'vue'
import { ethers } from 'ethers'
import TokenLogo from '@/components/Icons/TokenLogo.vue'
import ChainLogo from '@/components/Icons/ChainLogo.vue'
import { IToken } from '@/domain/metadata/Metadata'
import Address from '@/domain/shared/address'
import AmountFormatter from '@/domain/shared/AmountFormatter'
import CopyButton from '@/components/Buttons/CopyButton.vue'

const web3Store = useWeb3Store()
const metadataStore = useMetadataStore()
const { account } = storeToRefs(web3Store)

const tokens = computed({
    get: () => {
        return metadataStore.getBalances
    },
    set: () => null
})

const getChainLogo = (chainId: string) => {
    const chain = metadataStore.getChain(chainId)
    return chain ? chain.logo : ''
}

const createShortAddress = (address: string): string => {
    return new Address(address).shortFormat()
}

const createShorterAddress = (address: string): string => {
    return new Address(address).extraShortFormat()
}

const formattedBalance = (token: IToken) => {
    return AmountFormatter.format(ethers.utils.formatUnits(token.balance.toString(), token.decimals))
}
</script>

<template>
    <Popover>
        <PopoverButton
            class="header-button"
        >
            {{ createShorterAddress(account) }}
        </PopoverButton>

        <PopoverPanel
            class="absolute left-1/2 -translate-x-1/2 xs:right-2 xs:left-auto xs:translate-x-0 bg-black
            rounded-lg top-12 px-2 py-1 w-64 z-50 gradient-border-header-main-hover account-bg-gradient"
        >
            <div class="flex flex-col">
                <div class="flex flex-row items-center gap-2">
                    {{ createShortAddress(account) }}
                    <CopyButton :content="account"/>
                </div>
                <div class="flex flex-col">
                    <TabGroup>
                        <TabList class="flex space-x-1 p-1">
                            <Tab v-slot="{ selected }" as="template">
                                <button
                                    class="tab-button"
                                    :class="{ 'selected': selected }"
                                >
                                    Assets
                                </button>
                            </Tab>
                            <Tab v-slot="{ selected }" as="template">
                                <button
                                    class="tab-button"
                                    :class="{ 'selected': selected }"
                                >
                                    History
                                </button>
                            </Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                                <div class="flex flex-col my-2 gap-2">
                                    <div
                                        v-for="(token, index) in tokens"
                                        :key="index"
                                        class="flex flex-row justify-start py-1 pl-2"
                                    >
                                        <div class="relative w-7">
                                            <TokenLogo
                                                :token-logo="token.logo"
                                                :chain-logo="token.logo"
                                                size="28"
                                            />
                                            <ChainLogo :logo="getChainLogo(token.chainId)" size="14"/>
                                        </div>
                                        <div class="flex w-full justify-center gap-2">
                                            <div class="w-3/5 text-right">
                                                <!-- add tooltip -->
                                                {{ formattedBalance(token) }}
                                            </div>
                                            <div class="w-2/5 text-left">
                                                {{ token.symbol }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabPanel>
                            <TabPanel>Content 2</TabPanel>
                        </TabPanels>
                    </TabGroup>
                </div>
            </div>
        </PopoverPanel>
    </Popover>
</template>

