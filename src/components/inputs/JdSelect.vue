<template>
    <div class="jd-select" :style="`grid-template-columns: ${label || icon ? 'auto 1fr' : '1fr'}`">
        <div class="left" v-if="label || icon">
            <i v-if="icon" :class="icon"></i>

            <span v-if="label">{{ label }}</span>

            <span v-if="nec" class="nec"> *</span>
        </div>

        <div class="right" ref="right">
            <div
                class="se-muestra"
                :class="{ 'no-disabled': !disabled, disabled: disabled }"
                @click="toogleList"
            >
                <div class="text">
                    <span :title="mostrarValor">{{ mostrarValor }}</span>

                    <small v-if="inputModel == null">{{ placeholder }}</small>
                </div>

                <div class="actions" v-if="!disabled">
                    <i
                        class="fa-solid fa-rotate-right hidden"
                        title="Recargar"
                        v-if="loaded"
                        @click.stop="reload"
                    ></i>

                    <i
                        class="fa-solid fa-xmark hidden"
                        v-if="inputModel"
                        @click.stop="setNull()"
                    ></i>

                    <i
                        :class="`${isVisible ? 'fa-solid fa-caret-up' : 'fa-solid fa-caret-down'}`"
                    ></i>
                </div>
            </div>

            <div
                class="lista-box"
                ref="lista-box"
                v-if="isVisible"
                :class="{ 'lista-is-open': isVisible }"
            >
                <input
                    type="search"
                    placeholder="Buscar..."
                    v-model="txtBuscar"
                    v-if="lista.length > 10"
                />

                <div v-if="listaFiltrada.length === 0 || lista.length == 0" class="notes">
                    <small>Sin resultados</small>
                </div>

                <ul v-if="!groupBy" class="ul-main">
                    <li
                        v-for="(a, i) in listaFiltrada"
                        :key="i"
                        @click="elegir(a[id])"
                        :class="{ selected: inputModel == a[id] }"
                        class="li-option"
                    >
                        {{ getNestedProp(a, mostrar) }}
                    </li>
                </ul>

                <ul v-else class="ul-main">
                    <li v-for="(group, groupName) in listaAgrupada" :key="groupName">
                        <ul class="options-grouped">
                            <li class="group-label">{{ groupName }}</li>
                            <li
                                v-for="(a, i) in group"
                                :key="i"
                                @click="elegir(a[id])"
                                :class="{ selected: inputModel == a[id] }"
                                class="li-option group-options"
                            >
                                {{ getNestedProp(a, mostrar) }}
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        modelValue: [String, Number, Boolean],

        label: String,
        icon: String,
        nec: { type: Boolean, default: false },
        placeholder: { type: String, default: null },
        disabled: { type: Boolean, default: false },

        id: { type: String, default: 'id' },
        mostrar: { type: String, default: 'nombre' },
        groupBy: { type: String, default: null },

        lista: { type: Array, default: () => [] },
        loaded: { type: Boolean, default: false },
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
        mostrarValor() {
            if (
                this.inputModel !== null &&
                this.inputModel !== undefined &&
                this.inputModel !== ''
            ) {
                const send = this.lista.find((a) => a[this.id] == this.inputModel)

                if (send) {
                    return this.getNestedProp(send, this.mostrar)
                }
            }

            return ''
        },
        listaFiltrada() {
            if (!this.txtBuscar) return this.lista

            const textoBuscado = this.normalizarTexto(this.txtBuscar)

            return this.lista.filter((a) => {
                const valor = this.getNestedProp(a, this.mostrar)
                return this.normalizarTexto(valor).includes(textoBuscado)
            })
        },
        listaAgrupada() {
            if (!this.groupBy) {
                return {}
            }

            const grouped = this.listaFiltrada.reduce((acc, item) => {
                // const groupName = this.getNestedProp(item, this.groupBy) || 'Sin agrupar'
                const groupName = item[this.groupBy] || 'Sin agrupar'
                if (!acc[groupName]) {
                    acc[groupName] = []
                }
                acc[groupName].push(item)
                return acc
            }, {})

            return grouped
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
            } else {
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
                } else {
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
                this.$emit(
                    'elegir',
                    this.lista.find((a) => a[this.id] == id),
                )
            }

            this.ocultar()
        },
        setNull() {
            this.inputModel = null

            this.$emit('elegir', null)
        },

        getNestedProp(obj, prop) {
            const result = prop.split('.').reduce((acc, part) => acc?.[part], obj)

            return result === undefined || result === null ? '' : result
        },
        normalizarTexto(texto) {
            return texto
                .toString()
                .normalize('NFD') // separa letras y tildes
                .replace(/[\u0300-\u036f]/g, '') // elimina los signos diacríticos
                .toLowerCase()
        },

        reload() {
            this.$emit('reload')
        },
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

                .hidden {
                    opacity: 0;
                }
            }
        }

        .lista-box {
            z-index: 3;
            position: absolute;
            background-color: var(--bg-color);
            box-shadow: 0 0.5rem 0.7rem var(--shadow-color);

            input {
                border-bottom: var(--border);
                padding: 0.3rem 0.5rem;
                width: 100%;
                background-color: var(--bg-color);
            }

            .notes {
                padding: 0.4rem 0.5rem;
            }

            .ul-main {
                max-height: 13rem;
                overflow-y: auto;
                width: 100%;

                .li-option {
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

            .options-grouped {
                .group-label {
                    font-weight: bold;
                    color: var(--text-color-muted);
                    padding: 0.4rem 0.5rem;
                    cursor: default;
                }

                .group-options {
                    margin-left: 0.5rem;
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

    &:hover {
        .right {
            .se-muestra {
                .actions {
                    .hidden {
                        opacity: 1;
                    }
                }
            }
        }
    }
}
</style>
