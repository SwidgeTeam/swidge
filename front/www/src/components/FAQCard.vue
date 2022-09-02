<script setup lang='ts'>
import Accordion from './Accordion.vue'

const faqTexts = [
    {
        header: "What's happening here?",
        text: 'This is a Swap + Bridge (=Swidge) aggregator that allows you to swidge (see what we did there?) any asset you like on any chain to any other asset on any other chain. Enjoy!'
    },
    {
        header: 'Does Swidge charge fees?',
        text: "No! We don't charge zero fees. The only fees you need to pay are Gas fees (for transactions), Swap fees (fees for swapping tokens if needed) and Bridge fees (fee paid to bridging provider). We calculate an estimate for you before the transaction is executed."
    },
    {
        header: 'Looking for a specific token?',
        text: "We support any assets that are available to us through the DEXs we have integrated with. You can search them via their name or contract address. If you are looking to trade a token we don't support yet, join our Discord and let us know."
    }
]

</script>

<template>
    <div class="flex flex-col gap-6">
        <ul class="flex flex-col gap-5 mb-[2rem]">
            <Accordion
                v-for="faq in faqTexts"
                :key="faq.header"
                :header="faq.header"
                :text="faq.text"/>
        </ul>
    </div>
</template>
