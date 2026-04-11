<template>
    <thead v-if="!headless">
        <tr>
            <th v-if="rowReorderable" class="th-reorder"></th>

            <th v-if="colNro" class="th-numero">
                <div><span>#</span></div>
            </th>

            <th v-if="showCheckboxes" class="th-checkbox">
                <JdCheckBox
                    v-if="!rsUno"
                    :modelValue="allSelected"
                    @update:modelValue="$emit('update:allSelected', $event)"
                />
            </th>

            <th v-if="colAct"></th>

            <th
                v-for="col in columns"
                :key="col.id"
                v-show="col.show"
                :class="['th-vfor']"
                :style="[col.align ? { textAlign: col.align } : {}]"
            >
                <div class="th-vfor-title th-vfor-sortable" @click="$emit('sort', col)">
                    <i v-if="col.sortDirection === 'desc'" class="fa-solid fa-arrow-up"></i>
                    <i v-if="col.sortDirection === 'asc'" class="fa-solid fa-arrow-down"></i>
                    <span>{{ col.title }}</span>
                </div>

                <span
                    v-if="resizable"
                    class="icon-resize"
                    @mousedown="onResize($event, col)"
                ></span>
            </th>
            <th class="th-last"></th>
        </tr>
    </thead>
</template>

<script setup>
defineProps([
    'columns',
    'headless',
    'rowReorderable',
    'colNro',
    'colAct',
    'showCheckboxes',
    'resizable',
    'allSelected',
    'rsUno',
])
const emit = defineEmits(['sort', 'resize', 'resizeEnd', 'update:allSelected'])

const onResize = (event, column) => {
    const startX = event.pageX
    const startWidth = event.target.parentElement.offsetWidth

    const onMouseMove = (moveEvent) => {
        const deltaX = moveEvent.pageX - startX
        const newWidth = Math.max(85, startWidth + deltaX)
        emit('resize', { column, width: newWidth })
    }

    const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseup', onMouseUp)
        emit('resizeEnd', column)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
}
</script>

<style lang="scss" scoped>
thead {
    position: sticky;
    top: 0;
    z-index: 2;
    tr {
        background-color: var(--bg-color2);
        border-bottom: var(--border);
    }
    th {
        padding: 0.5rem 0.5rem;
        text-align: left;
        * {
            color: var(--text-color2);
            font-size: 0.9rem;
        }
    }
    .th-numero {
        position: sticky;
        left: 0;
        z-index: 1;
        background-color: var(--bg-color2);
    }
    .th-checkbox {
        text-align: center;
        vertical-align: middle;
    }
    .th-vfor {
        position: relative;
        .th-vfor-title {
            display: flex;
            i {
                margin-right: 0.5rem;
            }
            span {
                width: 100%;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }
        .th-vfor-sortable {
            cursor: pointer;
        }
        .icon-resize {
            position: absolute;
            right: 0;
            top: 0;
            width: 0.5rem;
            height: 100%;
            cursor: col-resize;
            &:hover {
                border-right: solid 2px var(--primary-color);
            }
        }
    }
    .th-checkbox-hidden {
        display: none;
    }
}
</style>
