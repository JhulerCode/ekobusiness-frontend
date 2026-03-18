<template>
    <div class="jd-table" :style="{ height, maxHeight, width }">
        <div
            ref="container"
            class="container-table"
            :style="{ minHeight }"
            :tabindex="rowFocusable ? 0 : -1"
            @keydown.up.prevent="rowFocusable && handleKeyDown($event, focusUp)"
            @keydown.down.prevent="rowFocusable && handleKeyDown($event, focusDown)"
            @keydown.enter.prevent="rowFocusable && handleKeyDown($event, selectFocusedRow)"
        >
            <table ref="jdtable" :class="{ 'table-cols-resizable': columnsResizable }">
                <colgroup>
                    <col v-if="rowReorderable" style="width: 2rem" />
                    <col v-if="colNro" style="width: 2rem" />
                    <col v-if="rowSelectable" style="width: 2.5rem" />
                    <col v-if="computedColAct" :style="`width: ${colActWidth}`" />
                    <col
                        v-for="col in columns"
                        :key="col.id"
                        v-show="col.show"
                        :style="{ width: col.width }"
                    />
                    <col style="width: 100%" />
                </colgroup>

                <TableHead
                    v-bind="{
                        columns,
                        headless,
                        rowReorderable,
                        colNro,
                        colAct: computedColAct,
                        rowSelectable: rowSelectable,
                        resizable: columnsResizable,
                        allSelected,
                        rsUno,
                    }"
                    @update:allSelected="allSelected = $event"
                    @sort="sortData"
                    @resize="onColumnResize"
                    @resizeEnd="onColumnResizeEnd"
                />

                <tbody>
                    <TableRow
                        v-for="(item, i) in datosFiltrados"
                        :key="item.id || i"
                        v-bind="{
                            item,
                            index: i,
                            columns,
                            rowSelectable: rowSelectable,
                            reorderable: rowReorderable,
                            colNro,
                            colAct: computedColAct,
                            rowOptions,
                            rowOptionsMode,
                            resizable: columnsResizable,
                            inputsDisabled,
                        }"
                        @select="(item, index) => { selectRow(item, index); rowFocusable && focusContainer() }"
                        @toggleOptions="toogleRowOptions"
                        @action="selectOptionRaw"
                        @dragStart="draggedRowIndex = $event"
                        @drop="handleDrop"
                        @dragEnd="draggedRowIndex = null"
                        @onChange="(...args) => $emit('onChange', ...args)"
                        @onInput="(...args) => $emit('onInput', ...args)"
                        @rowDblclick="(...args) => $emit('rowDblclick', ...args)"
                    >
                        <!-- Dynamic slots forwarding -->
                        <template v-for="slot in dynamicSlots" v-slot:[slot]="slotProps">
                            <slot :name="slot" v-bind="slotProps"></slot>
                        </template>
                    </TableRow>

                    <tr v-if="agregarFila">
                        <td colspan="100%">
                            <JdButton
                                text="Agregar fila"
                                tipo="3"
                                :small="true"
                                @click="agregarFila"
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <transition name="fade">
            <ul
                class="row-options-case"
                v-if="optionsCaseItem.i >= 0"
                @click.stop
                :id="'options-case-' + name"
            >
                <template v-for="(b, i) in rowOptions" :key="i">
                    <li @click="selectOption(b)" v-if="verifyRowOptionPermiso(optionsCaseItem, b)">
                        <i :class="b.icon"></i>
                        <span>{{ b.label }}</span>
                    </li>
                </template>
            </ul>
        </transition>
    </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useAuth } from '@/pinia/auth'
import { useTable } from './useTable'
import TableHead from './JdTableHead.vue'
import TableRow from './JdTableRow.vue'

const props = defineProps({
    name: String,
    columns: { type: Array, required: true },
    datos: { type: Array, required: true },
    headless: { type: Boolean, default: false },
    height: { type: String, default: 'auto' },
    maxHeight: { type: String, default: '100%' },
    minHeight: { type: String, default: 'auto' },
    width: { type: String, default: '100%' },
    colNro: { type: Boolean, default: true },
    colActWidth: { type: String, default: '2.5rem' },
    rowOptionsMode: { type: String, default: 'menu' },
    columnsResizable: { type: Boolean, default: true },
    rowSelectable: { type: Boolean, default: false },
    rsUno: { type: Boolean, default: false },
    inputsDisabled: { type: Boolean, default: false },
    rowOptions: { type: Array, default: () => [] },
    rowReorderable: { type: Boolean, default: false },
    rowReorderProp: { type: String, default: 'orden' },
    bulkActions: { type: Array, default: () => [] },
    agregarFila: Function,
    rowFocusable: { type: Boolean, default: false },
})

const emit = defineEmits(['rowSelected', 'rowOptionSelected', 'onReorder', 'onChange', 'onInput', 'rowDblclick'])

const auth = useAuth()
const container = ref(null)

const {
    draggedRowIndex,
    optionsCaseItem,
    datosFiltrados,
    allSelected,
    focusedIndex,
    sortData,
    selectRow,
    focusUp,
    focusDown,
    selectFocusedRow,
} = useTable(props, emit)

const computedColAct = computed(() => props.rowOptions && props.rowOptions.length > 0)
const dynamicSlots = computed(() => props.columns.filter((c) => c.slot).map((c) => c.slot))

watch(focusedIndex, (val) => {
    if (val === -1) return
    nextTick(() => {
        const row = container.value.querySelector('.row-focused')
        if (!row) return
        row.scrollIntoView({ block: 'nearest', behavior: 'auto' })
    })
})

const focusContainer = () => container.value?.focus()

const handleKeyDown = (e, callback) => {
    const isInput = ['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)
    if (isInput) return
    callback()
}

const onColumnResize = ({ column, width }) => {
    column.width = `${width}px`
}

const onColumnResizeEnd = () => {
    auth.saveTableColumns(props.name, props.columns)
}

const handleDrop = (targetItem) => {
    if (draggedRowIndex.value === null || draggedRowIndex.value.id === targetItem.id) return

    // Encontrar índices reales en el array original (props.datos)
    const fromIndex = props.datos.indexOf(draggedRowIndex.value)
    const toIndex = props.datos.indexOf(targetItem)

    if (fromIndex === -1 || toIndex === -1) return

    // eslint-disable-next-line vue/no-mutating-props
    const item = props.datos.splice(fromIndex, 1)[0]
    // eslint-disable-next-line vue/no-mutating-props
    props.datos.splice(toIndex, 0, item)

    props.datos.forEach((item, idx) => {
        item[props.rowReorderProp] = idx + 1
    })

    emit('onReorder', props.datos)
}

const toogleRowOptions = (item) => {
    if (optionsCaseItem.value.i === item.i) {
        hide()
        return
    }
    hide()
    optionsCaseItem.value = item
    nextTick(() => {
        const el = document.getElementById('options-case-' + props.name)
        const btn = document.getElementById(`button-options-${item.id}`)
        if (!el || !btn) return

        const rect = btn.getBoundingClientRect()
        const rectMenu = el.getBoundingClientRect()

        if (window.innerWidth < rect.left + rectMenu.width) {
            el.style.right = `${window.innerWidth - rect.right + window.scrollX}px`
        } else {
            el.style.left = `${rect.left + window.scrollX}px`
        }

        if (window.innerHeight < rect.bottom + rectMenu.height) {
            el.style.bottom = `${window.innerHeight - rect.top + window.scrollY + 5}px`
        } else {
            el.style.top = `${rect.bottom + window.scrollY + 5}px`
        }

        setTimeout(() => document.body.addEventListener('click', closeOnOutside), 0)
    })
}

const closeOnOutside = (e) => {
    const el = document.getElementById('options-case-' + props.name)
    if (el && !el.contains(e.target)) hide()
}

const hide = () => {
    optionsCaseItem.value = {}
    document.body.removeEventListener('click', closeOnOutside)
}

const selectOption = (a) => {
    emit('rowOptionSelected', a.action, optionsCaseItem.value)
    hide()
}

const selectOptionRaw = (action, item) => {
    emit('rowOptionSelected', action, item)
}

const verifyRowOptionPermiso = (item, option) => {
    if (option.ocultar) {
        for (const prop in option.ocultar) {
            const cond = option.ocultar[prop]
            const val = item[prop]
            if (val === undefined) continue
            if (Array.isArray(cond)) {
                if (cond.includes(val)) return false
            } else if (typeof cond === 'object' && cond.op) {
                if (comparar(val, cond.op, cond.val)) return false
            } else if (cond == val) return false
        }
    }
    if (!option.permiso) return true
    return Array.isArray(option.permiso)
        ? auth.verifyPermiso(...option.permiso)
        : auth.verifyPermiso(option.permiso)
}

const comparar = (a, op, b) => {
    switch (op) {
        case '>':
            return a > b
        case '<':
            return a < b
        case '>=':
            return a >= b
        case '<=':
            return a <= b
        case '==':
            return a == b
        case '!=':
            return a != b
        default:
            return false
    }
}

// Expose methods for parent
defineExpose({})
</script>

<style lang="scss" scoped>
.jd-table {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    max-width: 100%;
}

.container-table {
    height: 100%;
    overflow: auto;
    border-bottom: var(--border);

    &:focus {
        outline: none;
    }

    .table-cols-resizable {
        table-layout: fixed;
        width: fit-content !important;
    }

    table {
        border-collapse: collapse;
        border-spacing: 0;
        width: 100%;
    }
}

.row-options-case {
    position: absolute;
    z-index: 3;
    user-select: none;
    max-height: 15rem;
    overflow-y: auto;
    background-color: var(--bg-color);
    box-shadow: 0 0 0.5rem 0.1rem var(--shadow-color);
    border-radius: 0.3rem;

    li {
        cursor: pointer;
        padding: 0.5rem 0.8rem;
        display: grid;
        grid-template-columns: 1.5rem 1fr;
        &:hover {
            background-color: var(--bg-color-hover);
        }
        span {
            text-wrap: nowrap;
        }
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.1s;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
