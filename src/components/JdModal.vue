<template>
    <div class="modal-back" :class="{ 'with-back': hasBack, 'without-back': !hasBack }" :style="{
        'border-radius': `${hasBack == false ? borderRadius : '0'}`, 'z-index': zIndex
    }" ref="modal-back" @click="closeOnBack()">

        <transition name="pop-up">
            <div class="modal-main" :style="{
                'background-color': backgroundColor,
                'border-radius': borderRadius,
            }" v-if="popUp">
                <!-- 'padding': padding, -->

                <div class="head" v-if="hasHead">
                    <span>{{ useModals[modal].title }}</span>

                    <div class="btn" @click="useModals.show[modal] = false" v-if="btnClose">
                        <i class="fa-solid fa-xmark"></i>
                    </div>
                </div>

                <div class="body" :style="{ 'padding': padding }">
                    <slot></slot>
                </div>

                <div class="foot" v-if="buttons && buttons.length">
                    <div class="botones">
                        <template v-for="(a, i) in buttons" :key="i">
                            <JdButton :text="a.text" :spin="a.spin" :tipo="a.tipo" v-show="a.show"
                                @click="footButtonsClick(a.spin, a.action)" />
                        </template>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
import JdButton from '@/components/inputs/JdButton.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'

export default {
    components: {
        JdButton
    },
    props: {
        modal: String,
        hasHead: { type: Boolean, default: true },
        hasBack: { type: Boolean, default: true },
        btnClose: { type: Boolean, default: true },

        backgroundColor: { type: String, default: 'var(--bg-color)' },
        padding: { type: String, default: '1rem 1rem' },
        borderRadius: { type: String, default: '0.5rem' },
        zIndex: { type: Number, default: 2 },
        buttons: Array,

        closeOnTimeOut: { type: Boolean, default: false },
        closeOnClickOutside: { type: Boolean, default: false },
        closeOnClickBack: { type: Boolean, default: false },
        closeOnInputEsc: { type: Boolean, default: false },
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),

        popUp: false,
    }),
    mounted() {
        if (this.closeOnTimeOut) this.closeOnTime()

        setTimeout(() => {
            if (this.closeOnClickOutside) document.body.addEventListener('click', this.closeOnOutside)
            if (this.closeOnInputEsc) window.addEventListener('keydown', this.closeOnEsc)
            this.popUp = true
        }, 0)
    },
    beforeUnmount() {
        if (this.closeOnClickOutside) document.body.removeEventListener('click', this.closeOnOutside)
        if (this.closeOnInputEsc) window.removeEventListener('keydown', this.closeOnEsc)
    },
    methods: {
        hideComponent() {
            this.useModals.show[this.modal] = false
        },
        closeOnOutside(event) {
            this.$nextTick(() => {
                const el = this.$refs['modal-back']

                if (el && !el.contains(event.target)) {
                    this.hideComponent()
                }
            })
        },
        closeOnTime() {
            clearTimeout(this.useModals[this.modal].timeOutClose)

            if (this.useModals[this.modal].closeOnSec == undefined) this.useModals[this.modal].closeOnSec = 3

            this.useModals[this.modal].timeOutClose = setTimeout(() => {
                this.hideComponent()
            }, 1000 * this.useModals[this.modal].closeOnSec)
        },
        closeOnBack() {
            if (this.closeOnClickBack) {
                this.hideComponent()
            }
        },
        closeOnEsc(event) {
            if (event.key === 'Escape' || event.keyCode === 27) {
                this.hideComponent()
            }
        },
        footButtonsClick(spin, action) {
            if (spin) return

            this.$emit('button-click', action)
        }
    },
}
</script>

<style lang="scss" scoped>
.without-back {
    box-shadow: 0 0 0.5rem 0.1rem var(--shadow-color);
}

.with-back {
    top: 0;
    left: 0;
    width: 100%;
    height: 100dvh;
    background-color: var(--bg-color-transparent);
    display: flex;
    justify-content: center;
    align-items: flex-start;
    overflow-x: hidden;
    overflow-y: hidden;

    .modal-main {
        margin: 1rem 0;
        display: grid;
        grid-template-rows: auto 1fr auto;
        max-height: calc(100% - 2rem);
        max-width: 95%;
        overflow: hidden;

        .head {
            border-bottom: var(--border);
            padding: 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 2rem;

            span {
                font-size: 1.2rem;
                font-weight: bold;
            }

            .btn {
                cursor: pointer;
                width: 2rem;
                height: 2rem;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;

                &:hover {
                    background-color: var(--bg-color2);

                    * {
                        color: var(--text-color);
                    }
                }
            }
        }

        .body {
            overflow-y: auto;
        }

        .foot {
            border-top: var(--border);
            padding: 1rem;
        }
    }
}

.modal-back {
    position: absolute;
}

.pop-up-enter-active {
    animation: bounce-in 0.2s;
}

.pop-up-leave-active {
    animation: bounce-in 0.2s reverse;
}
</style>