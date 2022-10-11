<script setup>
import {CheckIcon} from '@heroicons/vue/outline'
import Spinner from 'vue-spinner/src/PulseLoader.vue'
</script>

<!-- https://medium.com/js-dojo/how-to-create-an-animated-countdown-timer-with-vue-89738903823f -->
<template>
    <div class="timer relative w-40 h-40">
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
        <div class="absolute w-40 h-40 top-0 flex items-center justify-center text-[40px]">
            <div v-if="finished" class="h-28 w-28 rounded-full flex items-center justify-center p-[1px] bg-[#1CBA3E]">
                <CheckIcon class="h-28 w-28 font-extrabold stroke-[4px]"/>
            </div>
            <Spinner v-else-if="timerEnded"></Spinner>
            <span v-else>{{ formattedTimeLeft }}</span>
        </div>
    </div>
</template>


<script>
const FULL_DASH_ARRAY = 283

export default {
    props: {
        seconds: {
            type: Number,
            default: 0
        },
        finished: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            timePassed: 0,
            timerInterval: null
        }
    },
    computed: {
        circleDasharray() {
            return `${(this.timeFraction * FULL_DASH_ARRAY).toFixed(0)} 283`
        },
        formattedTimeLeft() {
            const minutes = Math.floor(this.timeLeft / 60)
            let seconds = `${this.timeLeft % 60}`

            if (Number(seconds) < 10) {
                seconds = `0${seconds}`
            }

            return `${minutes}:${seconds}`
        },
        timeLeft() {
            return this.seconds - this.timePassed
        },
        timeFraction() {
            const rawTimeFraction = this.timeLeft / this.seconds
            return rawTimeFraction - (1 / this.seconds) * (1 - rawTimeFraction)
        },
        timerEnded() {
            return this.timeLeft === 0
        },
    },
    watch: {
        timeLeft(newValue) {
            if (newValue === 0) {
                this.onTimesUp()
            }
        }
    },
    mounted() {
        this.startTimer()
    },
    beforeUnmount() {
        this.onTimesUp()
    },
    methods: {
        onTimesUp() {
            clearInterval(this.timerInterval)
        },

        startTimer() {
            this.timerInterval = setInterval(() => (this.timePassed += 1), 1000)
        }
    }
}
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
