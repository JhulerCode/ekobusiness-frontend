<template>
    <div
        class="jd-buscador"
        ref="buscadorRef"
        @click="focusInput"
        :class="{ 'has-focus': isFocused }"
    >
        <div class="container-icon">
            <i :class="icon"></i>
        </div>

        <div class="input-container">
            <div class="active-filters" v-if="activeFilters.length > 0">
                <transition-group name="chip">
                    <div v-for="col in activeFilters" :key="col.id" class="filter-chip">
                        <span class="chip-label">{{ col.title }}:</span>
                        <span class="chip-value">{{ formatVal(col) }}</span>
                        <i class="fa-solid fa-xmark chip-close" @click.stop="removeFilter(col)"></i>
                    </div>
                </transition-group>
            </div>

            <input
                ref="inputRef"
                type="search"
                v-model="query"
                :placeholder="placeholder"
                @focus="onFocus"
                @blur="onBlur"
                @keydown.down.prevent="onArrowDown"
                @keydown.up.prevent="onArrowUp"
                @keydown.enter.prevent="onEnter"
                class="buscador-input"
            />
        </div>

        <div class="container-chevron" @click.stop="toggleActions">
            <i :class="showActions ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"></i>
        </div>

        <!-- Menu de Opciones de Busqueda Rapida -->
        <transition name="options-fade">
            <div v-if="isValidSearch && showOptions" class="options-menu">
                <ul v-if="seekableColumns.length > 0">
                    <li
                        v-for="(col, index) in seekableColumns"
                        :key="col.id || index"
                        :class="{ active: activeIndex === index }"
                        @mousedown.prevent="selectOption(col)"
                    >
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <div class="text">
                            Buscar <strong class="highlight">"{{ query }}"</strong> en
                            <strong class="col-name">{{ col.title }}</strong>
                        </div>
                    </li>
                </ul>
                <div v-else class="no-options">
                    No hay más columnas disponibles para búsqueda rápida
                </div>
            </div>
        </transition>

        <!-- Menu de Acciones (Filtros y Recarga) -->
        <transition name="options-fade">
            <div v-if="showActions" class="actions-menu">
                <ul>
                    <li @click.stop="handleAction('open-filters')">
                        <i class="fa-solid fa-filter"></i>
                        <span>Configurar filtros</span>
                    </li>
                    <li @click.stop="handleAction('reload')">
                        <i class="fa-solid fa-rotate-right"></i>
                        <span>Recargar datos</span>
                    </li>
                </ul>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useAuth } from '@/pinia/auth'
import dayjs from 'dayjs'

const props = defineProps({
    tableName: { type: String, required: true },
    columns: { type: Array, required: true },
    placeholder: { type: String, default: 'Buscar...' },
    icon: { type: String, default: 'fa-solid fa-magnifying-glass' },
})

const emit = defineEmits(['open-filters', 'reload'])

const auth = useAuth()

const query = ref('')

const showOptions = ref(false)
const showActions = ref(false)
const isFocused = ref(false)
const activeIndex = ref(0)
const buscadorRef = ref(null)
const inputRef = ref(null)

const activeFilters = computed(() => {
    return props.columns.filter((c) => c.op && c.val !== undefined && c.val !== '')
})

const formatVal = (col) => {
    if (col.valLabel) return col.valLabel

    const formatDate = (v) => {
        if (typeof v !== 'string') return v
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        if (dateRegex.test(v)) {
            return dayjs(v).format('DD-MM-YYYY')
        }
        return v
    }

    const v = formatDate(col.val)
    const v1 = formatDate(col.val1)

    if (v && v1 && col.op === 'Está dentro de') {
        return `${v} → ${v1}`
    }

    return v
}

const isValidSearch = computed(() => {
    const val = (query.value ?? '').toString().trim()
    return val.length >= 1
})

const seekableColumns = computed(() => {
    // return (props.columns || []).filter((c) => c.seek && !c.op)
    return (props.columns || []).filter((c) => c.seek)
})

const focusInput = () => {
    inputRef.value?.focus()
}

const toggleActions = () => {
    showActions.value = !showActions.value
    if (showActions.value) {
        showOptions.value = false
    }
}

const handleAction = (action) => {
    emit(action)
    showActions.value = false
}

const onFocus = () => {
    isFocused.value = true
    showActions.value = false
    if (isValidSearch.value) {
        showOptions.value = true
    }
}

const onBlur = () => {
    isFocused.value = false
}

const handleClickOutside = (event) => {
    if (buscadorRef.value && !buscadorRef.value.contains(event.target)) {
        showOptions.value = false
        showActions.value = false
        if (query.value) {
            query.value = ''
        }
    }
}

onMounted(() => {
    document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('mousedown', handleClickOutside)
})

const onArrowDown = () => {
    if (seekableColumns.value.length === 0) return
    showOptions.value = true
    if (activeIndex.value < seekableColumns.value.length - 1) {
        activeIndex.value++
    }
}

const onArrowUp = () => {
    if (seekableColumns.value.length === 0) return
    if (activeIndex.value > 0) {
        activeIndex.value--
    }
}

const onEnter = () => {
    if (seekableColumns.value[activeIndex.value]) {
        selectOption(seekableColumns.value[activeIndex.value])
    }
}

const selectOption = (col) => {
    const targetCol = props.columns.find((c) => c.id === col.id)
    if (targetCol) {
        targetCol.op = 'Contiene'
        targetCol.val = query.value
        targetCol.valLabel = null
    }

    auth.saveTableColumns(props.tableName, props.columns)
    emit('reload', true)

    query.value = ''
    showOptions.value = false
    nextTick(() => focusInput())
}

const removeFilter = (col) => {
    const targetCol = props.columns.find((c) => c.id === col.id)
    if (targetCol) {
        targetCol.op = null
        targetCol.val = null
        targetCol.valLabel = null
    }

    auth.saveTableColumns(props.tableName, props.columns)
    emit('reload', true)

    nextTick(() => focusInput())
}

watch(query, (newVal) => {
    activeIndex.value = 0
    if (isValidSearch.value) {
        showOptions.value = true
        showActions.value = false
    } else if (newVal === '') {
        showOptions.value = false
    }
})
</script>

<style lang="scss" scoped>
.jd-buscador {
    display: flex;
    position: relative;
    width: 100%;
    min-width: 20rem;
    min-height: 2rem;
    cursor: text;
    transition: all 0.2s ease;

    .container-icon,
    .container-chevron {
        padding: 0 0.55rem;
        border-radius: 0.2rem;
        border: var(--border);
        background-color: var(--bg-color2);
        display: flex;
        align-items: center;
        transition: all 0.2s;

        i {
            color: var(--text-color2);
            font-size: 0.8rem;
            // opacity: 0.7;
        }
    }

    .container-icon {
        border-right: initial !important;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
    }

    .container-chevron {
        border-left: initial !important;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        cursor: pointer;
    }

    .input-container {
        padding: 0 0.5rem;
        border: var(--border);
        background-color: var(--bg-color);
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.4rem;
        flex: 1;
    }

    .active-filters {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
    }

    .filter-chip {
        display: inline-flex;
        align-items: center;
        background: var(--bg-color2);
        color: var(--text-color);
        padding: 0.1rem 0.5rem;
        border-radius: 0.3rem;
        font-size: 0.75rem;
        gap: 0.35rem;
        transition: all 0.2s;

        .chip-label {
            color: var(--text-color2);
            font-weight: 400;
        }

        .chip-value {
            font-weight: 600;
            color: var(--primary-color);
        }

        .chip-close {
            cursor: pointer;
            font-size: 0.7rem;
            opacity: 0.5;
            transition: all 0.2s;
            &:hover {
                opacity: 1;
                color: var(--rojo);
                transform: scale(1.1);
            }
        }
    }

    .buscador-input {
        flex: 1;
        min-width: 4rem;
        border: none;
        background: transparent;
        outline: none;
        color: var(--text-color);
        font-size: 0.9rem;
        padding: 0;
    }

    .options-menu,
    .actions-menu {
        position: absolute;
        top: calc(100% + 6px);
        background: var(--bg-color);
        border: var(--border);
        border-radius: 0.5rem;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.12);
        z-index: 3;
        overflow: hidden;
        animation: menu-slide 0.2s ease-out;

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

    .options-menu {
        left: 0;
        width: 100%;

        li.active {
            background: var(--bg-color-hover);
            .col-name {
                color: var(--primary-color);
            }
        }

        .highlight {
            color: var(--primary-color);
        }

        .col-name {
            font-weight: 600;
        }
    }

    .actions-menu {
        right: 0;
        min-width: 12rem;
    }

    .no-options {
        padding: 1.2rem;
        text-align: center;
        font-size: 0.8rem;
        color: var(--text-color2);
        font-style: italic;
    }
}

// Transitions
.chip-enter-active,
.chip-leave-active {
    transition: all 0.25s ease;
}
.chip-enter-from,
.chip-leave-to {
    opacity: 0;
    transform: scale(0.85);
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
