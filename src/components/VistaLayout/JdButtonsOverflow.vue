<template>
    <div class="jd-buttons-overflow" :class="{ 'align-right': align === 'right' }" ref="container">
        <div
            class="visible-buttons"
            :class="{ 'is-calculating': calculating }"
            ref="visibleContainer"
        >
            <template v-for="(btn, i) in visibleButtons" :key="i">
                <JdButton
                    :text="btn.text"
                    :title="btn.title"
                    :icon="btn.icon"
                    :tipo="btn.tipo"
                    :disabled="btn.disabled"
                    @click="btnAction(btn)"
                />
            </template>

            <div class="options-menu" v-if="hiddenButtons.length > 0" ref="optionsBtn">
                <JdButton
                    icon="fa-solid fa-ellipsis-vertical"
                    tipo="2"
                    title="Más opciones"
                    @click="toggleMenu"
                />

                <transition name="options-fade">
                    <div
                        class="menu-dropdown"
                        v-bind:class="{ 'align-right': align === 'right' }"
                        v-if="menuOpen"
                    >
                        <ul>
                            <li
                                v-for="(btn, i) in hiddenButtons"
                                :key="'hidden-' + i"
                                @click="btnAction(btn)"
                                :class="{ disabled: btn.disabled }"
                            >
                                <i v-if="btn.icon" :class="btn.icon"></i>
                                <span>{{ btn.text }}</span>
                            </li>
                        </ul>
                    </div>
                </transition>
            </div>
        </div>
    </div>
</template>

<script>
import { useAuth } from '@/pinia/auth'

export default {
    name: 'JdButtonsOverflow',
    props: {
        actions: {
            type: Array,
            required: true,
            // Example items: { text: 'Nuevo', icon: 'fa-solid fa-plus', tipo: '1', action: fn, show: true }
        },
        align: {
            type: String,
            default: 'left', // 'left' or 'right'
        },
    },
    data: () => ({
        useAuth: useAuth(),
        visibleCount: 999,
        menuOpen: false,
        observer: null,
        calculating: true,
    }),
    computed: {
        activeButtons() {
            return this.actions.filter((b) => {
                if (b.show === false) return false
                // if (b.permiso && !this.useAuth.verifyPermiso(b.permiso)) return false
                if (b.showIfAvance && !this.useAuth.avances[b.showIfAvance]) return false
                return true
            })
        },
        visibleButtons() {
            return this.calculating
                ? this.activeButtons
                : this.activeButtons.slice(0, this.visibleCount)
        },
        hiddenButtons() {
            return this.calculating ? [] : this.activeButtons.slice(this.visibleCount)
        },
    },
    watch: {
        activeButtons: {
            deep: true,
            handler() {
                this.forceRecalculate()
            },
        },
    },
    mounted() {
        this.observer = new ResizeObserver(this.handleResize)
        if (this.$refs.container) {
            this.observer.observe(this.$refs.container)
        }
        document.addEventListener('mousedown', this.closeMenuOutside)
        this.forceRecalculate()
    },
    beforeUnmount() {
        if (this.observer) this.observer.disconnect()
        document.removeEventListener('mousedown', this.closeMenuOutside)
    },
    methods: {
        handleResize() {
            this.forceRecalculate()
        },
        forceRecalculate() {
            this.calculating = true
            this.visibleCount = this.activeButtons.length

            this.$nextTick(() => {
                this.calculateLayout()
            })
        },
        calculateLayout() {
            if (!this.$refs.visibleContainer || !this.$refs.container) {
                this.calculating = false
                return
            }

            const containerWidth = this.$refs.container.clientWidth
            const children = Array.from(this.$refs.visibleContainer.children)

            let currentWidth = 0
            let newCount = this.activeButtons.length

            const optionsBtnWidth = 45 // Approximate width of the ellipsis button with its gap

            for (let i = 0; i < children.length; i++) {
                if (children[i].classList.contains('options-menu')) continue

                // Element width + 8px gap
                const childWidth = children[i].offsetWidth + 8
                currentWidth += childWidth

                if (currentWidth > containerWidth) {
                    newCount = i
                    break
                }
            }

            if (newCount < this.activeButtons.length) {
                // We have overflow, meaning the options button will also be shown.
                // Re-evaluate to make sure the options button fits:
                currentWidth = 0
                let adjustedCount = 0
                for (let i = 0; i < newCount; i++) {
                    const childWidth = children[i].offsetWidth + 8
                    if (currentWidth + childWidth + optionsBtnWidth > containerWidth) {
                        break
                    }
                    currentWidth += childWidth
                    adjustedCount++
                }
                newCount = adjustedCount
            }

            this.visibleCount = newCount
            this.calculating = false
        },
        toggleMenu() {
            this.menuOpen = !this.menuOpen
        },
        closeMenuOutside(e) {
            if (this.$refs.optionsBtn && !this.$refs.optionsBtn.contains(e.target)) {
                this.menuOpen = false
            }
        },
        btnAction(btn) {
            this.menuOpen = false
            if (typeof btn.action === 'function') {
                btn.action()
            } else if (typeof btn.action === 'string') {
                this.$emit('actionSelected', btn.action)
            }
        },
    },
}
</script>

<style lang="scss" scoped>
.jd-buttons-overflow {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    position: relative;
    min-height: 2.5rem;

    &.align-right {
        justify-content: flex-end;
    }

    .visible-buttons {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        flex-wrap: nowrap;
        white-space: nowrap;

        &.is-calculating {
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
            width: max-content;
        }
    }

    .options-menu {
        position: relative;

        .menu-dropdown {
            position: absolute;
            top: calc(100% + 6px);
            left: 0;

            &.align-right {
                left: auto;
                right: 0;
            }
            background: var(--bg-color);
            border: var(--border);
            border-radius: 0.5rem;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.12);
            z-index: 3;
            overflow: hidden;
            animation: menu-slide 0.2s ease-out;
            min-width: 12rem;
            width: max-content;

            ul {
                list-style: none;
                margin: 0;
                padding: 0.3rem;
            }

            li {
                padding: 0.5rem 0.8rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 0.8rem;
                border-radius: 0.3rem;
                transition: all 0.15s;
                font-size: 0.9rem;
                color: var(--text-color);

                i {
                    font-size: 0.9rem;
                    width: 1rem;
                    text-align: center;
                }

                &:hover {
                    background: var(--bg-color-hover);
                    color: var(--primary-color);
                    i {
                        color: var(--primary-color);
                    }
                }
            }
        }
    }
}

.options-fade-enter-active,
.options-fade-leave-active {
    transition:
        opacity 0.2s,
        transform 0.2s;
}
.options-fade-enter-from,
.options-fade-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}

@keyframes menu-slide {
    from {
        opacity: 0;
        transform: translateY(-8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
