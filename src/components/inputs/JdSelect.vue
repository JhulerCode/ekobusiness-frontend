<template>
    <div class="jd-select" :style="`grid-template-columns: ${label || icon ? 'auto 1fr' : '1fr'}`">
        <div class="left" v-if="label || icon">
            <span v-if="label">{{ label }}</span>
            <i v-if="icon" :class="icon"></i>
            <span v-if="nec" class="nec"> *</span>
        </div>

        <div class="right" ref="right">
            <div class="se-muestra" :class="{ 'no-disabled': !disabled, disabled: disabled }" @click="toogleList">
                <div class="text">
                    <span :title="setMostrar()">{{ setMostrar() }}</span>
                    
                    <small v-if="inputModel == null">{{ placeholder }}</small>
                </div>

                <div class="actions" v-if="!disabled">
                    <i class="fa-solid fa-rotate-right" title="Recargar" v-if="loaded" @click.stop="reload()"></i>
                    <i class="fa-solid fa-xmark" v-if="inputModel" @click.stop="setNull()"></i>
                    <i :class="`${isVisible ? 'fa-solid fa-caret-up' : 'fa-solid fa-caret-down'}`"></i>
                </div>
            </div>

            <div class="lista-box" ref="lista-box" v-if="isVisible" :class="{ 'lista-is-open': isVisible }">
                <input type="search" placeholder="Buscar..." v-model="txtBuscar" v-if="lista.length > 10">

                <ul >
                    <li v-if="lista.length == 0"><small>Sin datos</small></li>

                    <li
                        v-else-if="lista.filter(a => a[mostrar].toLowerCase().includes(this.txtBuscar.toLowerCase())).length == 0">
                        <small>Sin resultados</small>
                    </li>

                    <li v-for="(a, i) in lista.filter(a => a[mostrar].toLowerCase().includes(this.txtBuscar.toLowerCase()))"
                        :key="i" @click="elegir(a[id])" :class="{ selected: inputModel == a[id] }" v-else>
                        {{ a[mostrar] }}
                    </li>
                </ul>
            </div>
        </div>

        <!-- <select v-model="inputModel">
            <option v-for="(a, i) in lista" :key="i" :value="a[id]">
                {{ a[mostrar] }}
            </option>
        </select> -->
        <!-- <input type="text" v-model="inputModel"> -->
    </div>
</template>

<script>
// import loadingSpin from '@/components/LoadingSpin.vue'

export default {
    components: {
        // loadingSpin
    },
    props: {
        modelValue: [String, Number],

        label: String,
        icon: String,
        nec: { type: Boolean, default: false },
        loaded: { type: Boolean, default: false },
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
            if (this.disabled == true) return

            /* ABRIR */
            this.isVisible = !this.isVisible

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
            if (id !== null && id !== undefined) {
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
            const isChanged = id == this.inputModel ? false : true

            this.inputModel = id

            if (isChanged) {
                this.$emit('elegir', this.lista.find(a => a[this.id] == id))
            }

            this.ocultar()
        },
        setNull() {
            this.inputModel = null

            this.$emit('elegir', null)
        },
        setMostrar() {
            if (this.inputModel !== null && this.inputModel !== undefined && this.inputModel !== '') {
                const send = this.lista.find(a => a[this.id] == this.inputModel)

                if (send) {
                    return send[this.mostrar]
                }
                else {
                    return ''
                }
            }
        },
        reload() {
            this.$emit('reload')
        }
    },
}
</script>

<style lang="scss" scoped>
.jd-select {
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
        .no-disabled {
            cursor: pointer;
        }

        .se-muestra {
            min-height: 100%;
            padding: 0 0.5rem;
            border-radius: 0.2rem;
            border: var(--border);
            background-color: var(--bg-color);
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
                    // text-overflow: ellipsis;
                }
            }

            .actions {
                display: flex;
                align-items: center;
                gap: 0.3rem;
                margin-left: 0.5rem;
            }
        }

        .lista-box {
            z-index: 3;
            position: absolute;
            background-color: var(--bg-color);
            // padding: 0.5rem;
            // width: 200%;
            // width: fit-content;
            box-shadow: 0 0.5rem 0.7rem var(--shadow-color);

            input {
                border-radius: 0.3rem;
                border: var(--border);
                padding: 0.3rem 0.5rem;
                width: 100%;
                margin-bottom: 0.5rem;
                background-color: var(--bg-color);
            }

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

                .selected {
                    color: var(--primary-color);
                    font-weight: bold;
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