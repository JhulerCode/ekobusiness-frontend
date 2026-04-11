<template>
    <tr
        :class="{
            'row-selected': item.selected,
            'row-reorderable': reorderable,
            'row-dragging': isDragging,
        }"
        :draggable="reorderable"
        @click="onRowClick"
        @mousedown="onMouseDown"
        @mouseup="onMouseUp"
        @mouseleave="onMouseUp"
        @dragstart="onDragStart"
        @dragover.prevent="onDragOver"
        @dragleave="onDragLeave"
        @drop="onDrop"
        @dragend="onDragEnd"
    >
        <td v-if="reorderable" class="td-reorder">
            <i class="fa-solid fa-grip-vertical"></i>
        </td>

        <td v-if="colNro" class="td-numero">{{ index + 1 }}</td>

        <td v-if="showCheckboxes" class="td-checkbox">
            <JdCheckBox v-model="row_is_selected" />
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
                @click.stop="$emit('toggleOptions', { ...item, i: index })"
            />
        </td>

        <td
            v-for="col in columns"
            :key="col.prop || col.id"
            v-show="col.show"
            :class="[
                'td-vfor',
                {
                    'td-vfor-resizable': resizable,
                },
            ]"
            :style="[
                col.width ? { width: col.width } : {},
                col.align ? { textAlign: col.align } : {},
            ]"
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
import { ref, onUnmounted, computed } from 'vue'
import TableCell from './JdTableCell.vue'
import { buttonVerifyPermission } from '@/utils/mine'

const props = defineProps([
    'item',
    'index',
    'columns',
    'rowSelectable',
    'showCheckboxes',
    'reorderable',
    'colNro',
    'colAct',
    'rowOptions',
    'rowOptionsMode',
    'resizable',
    'inputsDisabled',
    'rsUno',
])
const emit = defineEmits([
    'reorder',
    'dragStart',
    'drop',
    'dragEnd',
    'toggleOptions',
    'action',
    'select',
    'rowClick',
    'enterSelectionMode',
])

const row_is_selected = computed(() => {
    return props.item.selected
})

const isDragging = ref(false)
const longPressTimer = ref(null)
const hasLongPressed = ref(false)
const LONG_PRESS_DURATION = 500 // ms

const onMouseDown = (e) => {
    const isInput = ['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)
    const isInsideInput = e.target.closest('input, select, textarea')
    const isInsideActs = e.target.closest('.acts')

    if (isInput || isInsideInput || isInsideActs) return

    hasLongPressed.value = false
    longPressTimer.value = setTimeout(() => {
        hasLongPressed.value = true
        if (props.rowSelectable && !props.showCheckboxes) {
            emit('enterSelectionMode')
        }
    }, LONG_PRESS_DURATION)
}

const onRowClick = (e) => {
    const isInput = ['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)
    const isInsideInput = e.target.closest('input, select, textarea')
    const isInsideActs = e.target.closest('.acts')

    if (isInput || isInsideInput || isInsideActs) return

    if (props.rowSelectable && props.showCheckboxes) {
        emit('select', props.item)
        return
    }

    emit('rowClick', props.item)
}

const onMouseUp = () => {
    if (longPressTimer.value) {
        clearTimeout(longPressTimer.value)
        longPressTimer.value = null
    }
}

onUnmounted(() => {
    if (longPressTimer.value) {
        clearTimeout(longPressTimer.value)
    }
})

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
</script>

<style lang="scss" scoped>
tr {
    border-bottom: var(--border);
    scroll-margin-top: 2.3rem;
    cursor: pointer;

    &:hover {
        background-color: var(--bg-color-hover);
        .td-numero {
            background-color: var(--bg-color-hover);
        }
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
</style>
