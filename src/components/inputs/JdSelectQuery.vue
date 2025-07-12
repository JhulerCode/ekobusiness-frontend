<template>
    <article class="jd-select-query" :style="`grid-template-columns: ${label || icon ? 'auto 1fr' : '1fr'}`">
        <div class="left" v-if="label || icon">
            <span v-if="label">{{ label }}</span>
            <i v-if="icon" :class="icon"></i>
            <span v-if="nec" class="nec"> *</span>
        </div>

        <div class="right" ref="right">
            <div class="se-muestra" :class="{ disabled: disabled }">
                <input type="search" v-model="txtBuscar" @input="handleInput()" :placeholder="placeholder" v-if="!inputModel">

                <div class="text" v-if="inputModel">
                    <span :title="setMostrar()">{{ setMostrar() }}</span>
                </div>

                <div class="actions" v-if="!disabled">
                    <i class="fa-solid fa-xmark" v-if="inputModel" @click.stop="setNull()"></i>
                </div>
            </div>

            <div class="lista-box" ref="lista-box" v-if="isVisible" :class="{ 'lista-is-open': isVisible }">
                <loadingSpin borderRadius="0.2rem" :shadowBack="false" :rellenar="false" v-if="spin" />

                <div v-else>
                    <div v-if="txtBuscar !== '' && lista.length == 0"><small>Sin resultados</small></div>

                    <ul v-if="txtBuscar !== '' && lista.length > 0">
                        <li v-for="(a, i) in lista" :key="i" @click="elegir(a[id])">
                            {{ a[mostrar] }}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </article>
</template>

<script>
import loadingSpin from '@/components/LoadingSpin.vue'

export default {
    components: {
        loadingSpin
    },
    props: {
        modelValue: [String, Number],

        label: String,
        icon: String,
        nec: { type: Boolean, default: false },
        spin: { type: Boolean, default: false },
        lista: { type: Array, default: () => [] },
        id: { type: String, default: 'id' },
        mostrar: { type: String, default: 'nombre' },
        placeholder: { type: String, default: null },
        disabled: { type: Boolean, default: false },
    },
    computed: {
        inputModel: {
            get() {
                return this.modelValue
            },
            set(newValue) {
                this.$emit('update:modelValue', newValue)
            },
        },
    },
    data: () => ({
        isVisible: false,
        txtBuscar: '',
        searchTimeOut: null,
    }),
    mounted() {
        this.init(this.inputModel)
    },
    methods: {
        handleClickOutside(event) {
            const el = this.$refs['lista-box']

            if (el && !el.contains(event.target)) {
                this.ocultar()
            }
        },
        handleEscapeKey(event) {
            if (event.key === 'Escape' || event.keyCode === 27) {
                this.ocultar()
            }
        },
        toogleList() {
            // this.isVisible = !this.isVisible

            if (this.isVisible) {
                this.$nextTick(() => {
                    const rect = this.$refs.right.getBoundingClientRect()

                    const el = this.$refs['lista-box']
                    el.style.top = `${rect.bottom + window.scrollY}px`
                    el.style.left = `${rect.left + window.scrollX}px`
                    el.style.width = `${rect.width}px`
                })

                setTimeout(() => {
                    document.addEventListener('click', this.handleClickOutside)
                    window.addEventListener('keydown', this.handleEscapeKey)
                }, 0)
            }
            else {
                this.ocultar()
            }
        },
        ocultar() {
            this.isVisible = false
            this.txtBuscar = ''

            document.removeEventListener('click', this.handleClickOutside)
            window.removeEventListener('keydown', this.handleEscapeKey)
        },
        init(id) {
            if (id) {
                if (this.lista.length > 0) {
                    this.inputModel = id
                }
                else {
                    const inter = setInterval(() => {
                        if (this.lista.length > 0) {
                            this.inputModel = id

                            clearInterval(inter)
                        }
                    }, 100)
                }
            }
        },
        elegir(id) {
            this.inputModel = id

            this.$emit('elegir', this.lista.find(a => a[this.id] == id))

            this.ocultar()
        },
        setNull() {
            this.inputModel = null

            this.$emit('elegir', null)
        },

        handleInput() {
            clearTimeout(this.searchTimeOut)

            if (this.txtBuscar == '') {
                this.isVisible = false
                this.toogleList()
                this.$emit('search')
                return
            }

            this.isVisible = true
            this.toogleList()
            this.searchTimeOut = setTimeout(() => {
                this.search()
            }, 500)
        },
        setMostrar() {
            if (this.inputModel) {
                const send = this.lista.find(a => a[this.id] == this.inputModel)

                if (send) {
                    return send[this.mostrar]
                }
                else {
                    return ''
                }
            }
        },
        async search() {
            this.$emit('search', this.txtBuscar)
        }
    },
}
</script>

<style lang="scss" scoped>
.jd-select-query {
    display: grid;
    width: 100%;
    height: 2.2rem;

    * {
        font-size: 0.9rem;
    }

    .left {
        padding: 0 0.5rem;
        border-radius: 0.2rem;
        border: var(--border);
        border-right: initial !important;
        background-color: var(--bg-color2);
        display: flex;
        align-items: center;
        gap: 0.3rem;

        .nec {
            color: var(--rojo);
        }
    }

    .right {
        // position: relative;

        .se-muestra {
            min-height: 100%;
            padding: 0 0.5rem;
            border-radius: 0.2rem;
            border: var(--border);
            // display: flex;
            // justify-content: space-between;
            // gap: 0.5rem;
            // position: relative;
            display: grid;
            grid-template-columns: 1fr auto;
            max-width: 100%;

            .text {
                display: flex;
                align-items: center;
                overflow: hidden;

                span {
                    white-space: nowrap;
                    overflow: hidden;
                }
            }

            input {
                background-color: var(--bg-color);
            }

            .actions {
                display: flex;
                gap: 0.3rem;
                align-items: center;
                margin-left: 0.5rem;

                i {
                    cursor: pointer;
                }
            }
        }

        .lista-box {
            z-index: 3;
            position: absolute;
            background-color: var(--bg-color);
            box-shadow: 0 0.5rem 0.7rem var(--shadow-color);

            ul {
                width: 100%;
                max-height: 10rem;
                overflow-y: auto;

                li {
                    cursor: pointer;
                    padding: 0.4rem 0.5rem;

                    &:hover {
                        background-color: var(--bg-color-hover);
                    }
                }
            }
        }

        .lista-is-open {
            border: var(--border);
        }

        .disabled {
            background-color: var(--bg-color2) !important;
        }
    }
}
</style>