<template>
    <article
        class="jd-select-query"
        :style="`grid-template-columns: ${label || icon ? 'auto 1fr' : '1fr'}`"
    >
        <div class="left" v-if="label || icon">
            <i v-if="icon" :class="icon"></i>

            <span v-if="label">{{ label }}</span>

            <span v-if="nec" class="nec"> *</span>
        </div>

        <div class="right" ref="right">
            <div
                class="se-muestra"
                :class="{ disabled: disabled }"
                @click="!disabled && handleFocus()"
            >
                <input
                    ref="searchInput"
                    type="search"
                    v-model="txtBuscar"
                    @input="handleInput()"
                    :placeholder="placeholder"
                    :disabled="disabled"
                    v-if="!hasValue || isVisible"
                />

                <div class="text" v-if="hasValue && !isVisible">
                    <span :title="mostrarValor">{{ mostrarValor }}</span>
                </div>

                <div class="actions" v-if="!disabled">
                    <i class="fa-solid fa-xmark hidden" v-if="hasValue" @click.stop="setNull()"></i>

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
                <LoadingSpin
                    borderRadius="0.2rem"
                    :shadowBack="false"
                    :rellenar="false"
                    v-if="computedSpin"
                />

                <template v-else>
                    <div v-if="txtBuscar !== '' && computedLista.length == 0" class="notes">
                        <small>Sin resultados</small>
                    </div>

                    <ul v-if="computedLista.length > 0">
                        <li v-for="(a, i) in computedLista" :key="i" @click="elegir(a[id])">
                            {{ getNestedProp(a, mostrar) }}
                        </li>
                    </ul>
                </template>
            </div>
        </div>
    </article>
</template>

<script>
export default {
    props: {
        modelValue: [String, Number],

        label: String,
        icon: String,
        nec: { type: Boolean, default: false },
        placeholder: { type: String, default: null },
        disabled: { type: Boolean, default: false },

        id: { type: String, default: 'id' },
        mostrar: { type: String, default: 'nombre' },

        // Props opcionales (para mantener compatibilidad o manejo externo)
        spin: { type: Boolean, default: null },
        lista: { type: Array, default: null },

        // Prop para búsqueda (función que devuelve la lista o URL/Recurso)
        // Si se pasa una función, el componente gestionará su propio estado interno
        search: { type: Function, default: null },

        // Nuevo: Objeto seleccionado inicial (evita depender de la lista para mostrar el valor)
        selectedObject: { type: Object, default: null },
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
        hasValue() {
            return (
                this.inputModel !== null && this.inputModel !== undefined && this.inputModel !== ''
            )
        },
        // Gestión cruzada entre lista interna (auto-gestionada) y externa (prop)
        computedLista() {
            return this.lista !== null ? this.lista : this.internalLista
        },
        computedSpin() {
            return this.spin !== null ? this.spin : this.internalSpin
        },
        mostrarValor() {
            if (!this.hasValue) return ''

            // 1. Prioridad: Buscar en la lista actual (resultados de búsqueda)
            const matchInList = this.computedLista.find((a) => a[this.id] == this.inputModel)
            if (matchInList) {
                return this.getNestedProp(matchInList, this.mostrar)
            }

            // 2. Fallback: Usar el objeto inicial si coincide con el id
            if (
                this.selectedObject &&
                this.getNestedProp(this.selectedObject, this.id) == this.inputModel
            ) {
                return this.getNestedProp(this.selectedObject, this.mostrar)
            }

            return ''
        },
    },
    data: () => ({
        isVisible: false,
        txtBuscar: '',
        searchTimeOut: null,

        // Estado interno para cuando el componente es autónomo
        internalLista: [],
        internalSpin: false,
    }),
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
        elegir(id) {
            this.inputModel = id

            this.$emit(
                'elegir',
                this.computedLista.find((a) => a[this.id] == id),
            )

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

        handleFocus() {
            if (this.isVisible) return

            this.isVisible = true
            this.toogleList()

            this.$nextTick(() => {
                this.$refs.searchInput?.focus()
            })

            // Solo buscamos si la lista está vacía y no estamos cargando
            if (this.computedLista.length === 0 && !this.computedSpin) {
                this.execSearch('')
            }
        },
        handleInput() {
            clearTimeout(this.searchTimeOut)
            this.isVisible = true
            this.toogleList()

            this.searchTimeOut = setTimeout(() => {
                this.execSearch(this.txtBuscar)
            }, 500)
        },
        async execSearch(txt) {
            // Si hay un handler de búsqueda (función), lo usamos de forma autónoma
            if (this.search) {
                this.internalSpin = true
                const res = await this.search(txt)
                this.internalSpin = false

                // Si la función devuelve la lista, la guardamos internamente
                if (Array.isArray(res)) {
                    this.internalLista = res
                }
            } else {
                // Si no hay handler, emitimos para que el padre la maneje externamente (retrocompatibilidad)
                this.$emit('search', txt)
            }
        },
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
                }
            }

            input {
                width: 100%;
                background-color: transparent;
            }

            .actions {
                display: flex;
                gap: 0.3rem;
                align-items: center;
                margin-left: 0.5rem;

                .fa-xmark {
                    cursor: pointer;
                }

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

            .notes {
                padding: 0.4rem 0.5rem;
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
