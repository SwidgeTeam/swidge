<script setup>
import {CheckIcon} from '@heroicons/vue/outline'
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
                    :class="{'completed': timerEnded}"
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
                <CheckIcon
                    class="h-28 w-28 font-extrabold stroke-[4px]"/>
            </div>
            <div v-if="timerEnded" class="wrapper">
                <div class="clock"></div>
                <div class="clock"></div>
            </div>
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

.timer__path-remaining.completed {
    color: gray;
}

.wrapper {
    position: relative;
    width: 50px;
    height: 100px;
    transform-origin: center center;
    animation: rotate 3s .75s ease-in-out infinite;
}

.wrapper:before,
.wrapper:after {
    z-index: -1;
    content: "";
    border: solid 4px rgba(black, 0.2);
    border-bottom: none;
    border-left: none;
    border-right: none;
    border-radius: 50%;
    clip-path: inset(0 60% 0 0);
    width: 100%;
    height: 50%;
    animation: shadow 3s .75s linear infinite;
    opacity: 0;
}

.wrapper:after {
    position: absolute;
    top: -1px;
    left: -18px;
}

.wrapper:before {
    position: absolute;
    bottom: -1px;
    right: -18px;
    transform: rotate(180deg);
}

.clock {
    position: relative;
    width: 0;
    height: 0;
    border-top: solid 50px #e67e22;
    border-bottom: solid 25px transparent;
    border-left: solid 25px transparent;
    border-right: solid 25px transparent;
}

.clock::before,
.clock::after {
    content: "";
    position: absolute;
    left: -20px;
    top: -47px;
    width: 0;
    height: 0;
    border-top: solid 44px #f3f3f3;
    border-bottom: solid 20px transparent;
    border-left: solid 20px transparent;
    border-right: solid 20px transparent;
}

.clock::after {
    border-top: solid 44px #e67e22;
    will-change: transform;
    animation: clock1 3s linear infinite;
}

.clock:last-child {
    transform: rotate(180deg) translateY(50px);
}

.clock:last-child::after {
    transform: scale(0);
    animation: clock2 3s linear infinite;
}

@keyframes clock1 {
    20%, 50% {
        transform: scale(0);
    }
    70%, 100% {
        transform: scale(1);
    }
}

@keyframes clock2 {
    20%, 50% {
        transform: scale(1);
    }
    70%, 100% {
        transform: scale(0);
    }
}

@keyframes shadow {
    10% {
        opacity: 1;
    }
    20%, 50% {
        opacity: 0;
    }
    60% {
        opacity: 1;
    }
    70%, 100% {
        opacity: 0;
    }
}

@keyframes rotate {
    20%, 50% {
        transform: rotate(180deg);
    }
    70%, 100% {
        transform: rotate(360deg);
    }
}
</style>
