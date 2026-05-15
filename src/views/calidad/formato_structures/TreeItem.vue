<template>
    <div class="tree-item-wrapper" :class="[isOver ? 'drop-' + isOver : '']">
        <div
            class="tree-item-content"
            :class="{
                selected: selectedId === item.id,
                'is-hovered': hoveredId === item.id,
            }"
            draggable="true"
            @dragstart="handleDragStart"
            @dragover.prevent="handleDragOver"
            @dragleave="isOver = null"
            @drop.stop="handleDrop"
            @click.stop="(() => { closeMenu(); $emit('select', item.id, item); })()"
            @contextmenu.prevent.stop="handleContextMenu"
            @mouseenter="$emit('hover', item.id)"
            @mouseleave="$emit('hover', null)"
        >
            <div class="item-info">
                <div
                    @click.stop="collapsed = !collapsed"
                    v-if="item.children?.length"
                    class="expand-arrow"
                >
                    <i
                        class="fas fa-xs"
                        :class="collapsed ? 'fa-chevron-right' : 'fa-chevron-down'"
                    ></i>
                </div>
                <div v-else class="expand-placeholder"></div>
                <i :class="getIcon(item.type)"></i>
                <span class="item-name">{{ item.name || item.id }}</span>
            </div>

            <teleport to="body">
                <div
                    v-if="menuData.show"
                    class="item-dropdown"
                    :style="{ top: menuData.y + 'px', left: menuData.x + 'px' }"
                >
                    <div class="dropdown-item" @click.stop="handleDuplicate">
                        <i class="fas fa-copy"></i> Duplicar
                    </div>
                    <div
                        v-if="item.id !== 'root'"
                        class="dropdown-item delete"
                        @click.stop="handleDelete"
                    >
                        <i class="fas fa-trash-alt"></i> Eliminar
                    </div>
                </div>
            </teleport>
        </div>

        <div v-if="item.children?.length" v-show="!collapsed" class="tree-children">
            <TreeItem
                v-for="child in item.children"
                :key="child.id"
                :item="child"
                :selectedId="selectedId"
                :hoveredId="hoveredId"
                :mode="mode"
                @select="(id, el) => $emit('select', id, el)"
                @hover="(id) => $emit('hover', id)"
                @delete="(id) => $emit('delete', id)"
                @duplicate="(id) => $emit('duplicate', id)"
                @move="(dragId, targetId, pos) => $emit('move', dragId, targetId, pos)"
            />
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ELEMENT_TYPES } from './constants'

const props = defineProps({
    item: { type: Object, required: true },
    selectedId: { type: String, default: null },
    hoveredId: { type: String, default: null },
    mode: { type: String, default: 'edit' },
})

const emit = defineEmits(['select', 'hover', 'delete', 'move', 'duplicate'])

const collapsed = ref(true)
const isOver = ref(null) // 'before', 'inside', 'after'
const menuData = reactive({ show: false, x: 0, y: 0 })

const handleContextMenu = (e) => {
    if (props.mode !== 'edit') return
    if (props.item.id === 'root') return
    window.dispatchEvent(new CustomEvent('close-context-menus'))
    menuData.show = true
    menuData.x = e.clientX
    menuData.y = e.clientY
}

const closeMenu = () => {
    menuData.show = false
}

onMounted(() => {
    window.addEventListener('click', closeMenu)
    window.addEventListener('contextmenu', closeMenu)
    window.addEventListener('scroll', closeMenu, true)
    window.addEventListener('close-context-menus', closeMenu)
})

onUnmounted(() => {
    window.removeEventListener('click', closeMenu)
    window.removeEventListener('contextmenu', closeMenu)
    window.removeEventListener('scroll', closeMenu, true)
    window.removeEventListener('close-context-menus', closeMenu)
})

const handleDuplicate = () => {
    closeMenu()
    emit('duplicate', props.item.id)
}

const handleDelete = () => {
    closeMenu()
    emit('delete', props.item.id)
}

const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', props.item.id)
}

const handleDragOver = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const relativeY = e.clientY - rect.top
    const height = rect.height

    if (relativeY < height * 0.25) {
        isOver.value = 'before'
    } else if (relativeY > height * 0.75) {
        isOver.value = 'after'
    } else {
        isOver.value = 'inside'
    }
}

const handleDrop = (e) => {
    const dragId = e.dataTransfer.getData('text/plain')
    const pos = isOver.value
    isOver.value = null

    if (dragId && dragId !== props.item.id) {
        emit('move', dragId, props.item.id, pos)
    }
}

const getIcon = (type) => {
    const elType = ELEMENT_TYPES.find((e) => e.type === type)
    return elType?.icon || 'fas fa-cube'
}
</script>

<style lang="scss" scoped>
.tree-item-wrapper {
    display: flex;
    flex-direction: column;
    position: relative;

    &.drop-before::before {
        content: '';
        position: absolute;
        top: -2px;
        left: 0;
        right: 0;
        height: 2px;
        background-color: var(--primary-color);
        z-index: 10;
    }

    &.drop-after::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        right: 0;
        height: 2px;
        background-color: var(--primary-color);
        z-index: 10;
    }

    &.drop-inside > .tree-item-content {
        background-color: var(--bg-color-selected);
        outline: 1px solid var(--primary-color);
    }
}

.tree-item-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.4rem 0.6rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.75rem;
    color: var(--text-color);
    position: relative;

    &:hover {
        .item-actions {
            opacity: 1;
        }
    }

    &.selected {
        background-color: var(--bg-color-selected);
        color: var(--primary-color);
    }

    &.is-hovered {
        outline: 1px dashed var(--primary-color);
    }
}

.item-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    i {
        color: var(--text-color2);
        width: 14px;
        text-align: center;
    }

    .expand-arrow {
        // width: 10px;
        cursor: pointer;
        color: var(--text-color2);
    }

    .expand-placeholder {
        width: 10px;
    }
}

.item-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 180px;
}

.item-dropdown {
    position: fixed;
    background-color: var(--bg-color);
    border: var(--border);
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 9999;
    min-width: 140px;
    padding: 0.4rem 0;
    overflow: hidden;

    .dropdown-item {
        padding: 0.6rem 1rem;
        display: flex;
        align-items: center;
        gap: 0.6rem;
        font-size: 0.75rem;
        color: var(--text-color);
        transition: all 0.2s;
        cursor: pointer;

            i {
                width: 14px;
                text-align: center;
                font-size: 0.8rem;
            }

            &:hover {
                background-color: var(--bg-color-hover);
                color: var(--primary-color);
            }

            &.delete {
                color: var(--rojo);
                &:hover {
                    background-color: rgba(233, 67, 67, 0.1);
                }
        }
    }
}

.tree-children {
    padding-left: 1rem;
    border-left: var(--border);
    margin-left: 0.4rem;
}
</style>
