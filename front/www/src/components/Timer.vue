<!-- https://medium.com/js-dojo/how-to-create-an-animated-countdown-timer-with-vue-89738903823f -->
<template>
    <div class="timer relative w-64 h-64">
        <svg
            class="timer__svg"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg">
            <g class="fill-transparent stroke-current">
                <circle
                    class="timer__path-elapsed"
                    cx="50"
                    cy="50"
                    r="45"></circle>
                <path
                    :stroke-dasharray="circleDasharray"
                    class="timer__path-remaining"
                    d="
                        M 50, 50
                        m -45, 0
                        a 45,45 0 1,0 90,0
                        a 45,45 0 1,0 -90,0
                      "
                ></path>
            </g>
        </svg>
        <span class="absolute w-64 h-64 top-0 flex items-center justify-center text-[48px]">
            {{ formattedTimeLeft }}
        </span>
    </div>
</template>

<script setup lang='ts'>
import { ref, computed, watch, onMounted } from 'vue'
let timePassed = ref<number>(0)
let timerInterval = ref<number>(0)
const props = defineProps<{
    seconds: number
}>()

onMounted(() => {
    startTimer()
})

const startTimer = () => {
    timerInterval.value = window.setInterval(() => (timePassed.value += 1), 1000)
}

const onTimesUp = () => {
    clearInterval(timerInterval.value)
}

const FULL_DASH_ARRAY = 283
const circleDasharray = computed({
    get: () => {
        return `${(timeFraction.value * FULL_DASH_ARRAY).toFixed(0)} ${FULL_DASH_ARRAY}`
    },
    set: () => null
})

const formattedTimeLeft = computed({
    get: () => {
        const minutes = Math.floor(timeLeft.value / 60)
        let seconds = `${timeLeft.value % 60}`

        if (Number(seconds) < 10) {
            seconds = `0${seconds}`
        }

        return `${minutes}:${seconds}`
    },
    set: () => null
})

const timeLeft = computed({
    get: () => {
        return props.seconds - timePassed.value
    },
    set: () => null
})

const timeFraction = computed({
    get: () => {
        const rawTimeFraction = timeLeft.value / props.seconds
        return rawTimeFraction - (1 / props.seconds) * (1 - rawTimeFraction)
    },
    set: () => null
})

watch(timeLeft, (newValue) => {
    if (newValue === 0) {
        onTimesUp()
    }
})
</script>

<style scoped>
.timer__svg {
    transform: scaleX(-1);
}

.timer__path-elapsed {
    stroke-width: 7px;
    stroke: grey;
}

.timer__path-remaining {
    stroke-width: 7px;
    stroke-linecap: round;
    transform: rotate(90deg);
    transform-origin: center;
    transition: 1s linear all;
    fill-rule: nonzero;
    color: rgb(65, 184, 131);
}
</style>
