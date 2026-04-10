<template>
    <tr
        :class="{
            'row-selectable': rowSelectable,
            'row-selected': item.selected,
            'row-reorderable': reorderable,
            'row-dragging': isDragging,
            'row-focused': item.focused,
        }"
        :draggable="reorderable"
        @click="onRowClick"
        @dragstart="onDragStart"
        @dragover.prevent="onDragOver"
        @dragleave="onDragLeave"
        @drop="onDrop"
        @dragend="onDragEnd"
        @dblclick="onRowDblclick"
    >
        <td v-if="reorderable" class="td-reorder">
            <i class="fa-solid fa-grip-vertical"></i>
        </td>

        <td v-if="colNro" class="td-numero">{{ index + 1 }}</td>

        <td v-if="rowSelectable" class="td-checkbox">
            <JdCheckBox v-model="item.selected" @change="$emit('select', item)" />
        </td>

        <td v-if="colAct" class="td-act">
            <div class="acts" v-if="rowOptionsMode === 'buttons'">
                <template v-for="(b, i) in rowOptions" :key="i">
                    <JdButton
                        v-if="buttonVerifyPermission(item, b)"
                        v-bind="b"
                        tipo="2"
                        :small="true"
                        @click.stop="$emit('action', b.action, item)"
                    />
                </template>
            </div>

            <JdButton
                v-if="rowOptionsMode === 'menu'"
                icon="fa-solid fa-ellipsis"
                tipo="2"
                :small="true"
                :id="`button-options-${item.id}`"
                @click="$emit('toggleOptions', { ...item, i: index })"
            />
        </td>

        <td
            v-for="col in columns"
            :key="col.prop || col.id"
            v-show="col.show"
            :class="[
                'td-vfor',
                {
                    'td-vfor-right': col.toRight,
                    'td-vfor-resizable': resizable,
                },
            ]"
            :style="col.width ? { width: col.width } : {}"
        >
            <TableCell :column="col" :item="item" :disabled="inputsDisabled">
                <!-- Forward slots -->
                <template v-if="col.slot" v-slot:[col.slot]="slotProps">
                    <slot :name="col.slot" v-bind="slotProps"></slot>
                </template>
            </TableCell>
        </td>

        <td class="td-last"></td>
    </tr>
</template>

<script setup>
import { ref } from 'vue'
// import { useAuth } from '@/pinia/auth'
import TableCell from './JdTableCell.vue'
import { buttonVerifyPermission } from '@/utils/mine'

const props = defineProps([
    'item',
    'index',
    'columns',
    'rowSelectable',
    'reorderable',
    'colNro',
    'colAct',
    'rowOptions',
    'rowOptionsMode',
    'resizable',
    'inputsDisabled',
])
const emit = defineEmits([
    'select',
    'toggleOptions',
    'action',
    'reorder',
    'dragStart',
    'drop',
    'dragEnd',
    'rowDblclick',
])

const isDragging = ref(false)

const onDragStart = (e) => {
    isDragging.value = true
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', props.item.id)
    emit('dragStart', props.item)
}

const onDragOver = (e) => {
    const tr = e.currentTarget
    const rect = tr.getBoundingClientRect()
    const midpoint = rect.top + rect.height / 2

    tr.classList.remove('row-drag-over-top', 'row-drag-over-bottom')
    if (e.clientY < midpoint) {
        tr.classList.add('row-drag-over-top')
    } else {
        tr.classList.add('row-drag-over-bottom')
    }
}

const onDragLeave = (e) => {
    e.currentTarget.classList.remove('row-drag-over-top', 'row-drag-over-bottom')
}

const onDrop = (e) => {
    e.currentTarget.classList.remove('row-drag-over-top', 'row-drag-over-bottom')
    emit('drop', props.item)
}

const onDragEnd = () => {
    isDragging.value = false
    emit('dragEnd')
}

const onRowDblclick = (e) => {
    const isInput = ['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)
    const isInsideInput = e.target.closest('input, select, textarea')
    const isInsideAct = e.target.closest('.td-act, .td-reorder, .td-checkbox')

    if (isInput || isInsideInput || isInsideAct) return

    emit('rowDblclick', props.item)
}

const onRowClick = (e) => {
    const isInput = ['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)
    const isInsideInput = e.target.closest('input, select, textarea')
    const isInsideActs = e.target.closest('.acts')

    if (isInput || isInsideInput || isInsideActs) return

    emit('select', props.item, props.index)
}
</script>

<style lang="scss" scoped>
tr {
    border-bottom: var(--border);
    scroll-margin-top: 2.3rem;

    &:hover {
        background-color: var(--bg-color-hover);
        .td-numero {
            background-color: var(--bg-color-hover);
        }
    }
    &.row-selectable {
        cursor: pointer;
    }
    &.row-selected {
        background-color: var(--bg-color-selected);
        .td-numero {
            background-color: var(--bg-color-selected);
        }
    }
    &.row-dragging {
        opacity: 0.5;
        background-color: var(--bg-color-hover);
    }
    &.row-focused {
        outline: 1px solid var(--primary-color);
        outline-offset: -1px;
        &:not(.row-selected) {
            background-color: var(--bg-color-hover);
        }
    }
    &.row-drag-over-top {
        border-top: 2px solid var(--primary-color) !important;
    }
    &.row-drag-over-bottom {
        border-bottom: 2px solid var(--primary-color) !important;
    }
}

td {
    padding: 0.4rem 0.5rem;
    vertical-align: top;
}

.td-numero {
    background-color: var(--bg-color);
    position: sticky;
    left: 0;
    z-index: 1;
    font-size: 0.85rem;
}

.td-reorder {
    cursor: grab;
    color: var(--text-color3);
    text-align: center;
    &:active {
        cursor: grabbing;
    }
}

.td-checkbox {
    text-align: center;
    vertical-align: middle;
}
.td-act {
    .acts {
        display: flex;
        gap: 0.3rem;
    }
}

.td-vfor {
    &.td-vfor-resizable {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}

.td-vfor-right {
    text-align: right;
}
</style>
