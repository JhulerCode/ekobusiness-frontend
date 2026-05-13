<template>
    <div class="tree-item-wrapper">
        <div
            class="tree-item-content"
            :class="{
                selected: selectedId === item.id,
                'is-hovered': hoveredId === item.id,
            }"
            @click.stop="$emit('select', item.id, item)"
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
            <div class="item-actions">
                <i
                    v-if="item.id !== 'root'"
                    class="fas fa-trash-alt delete-btn"
                    @click.stop="$emit('delete', item.id)"
                ></i>
            </div>
        </div>

        <div v-if="item.children?.length" v-show="!collapsed" class="tree-children">
            <TreeItem
                v-for="child in item.children"
                :key="child.id"
                :item="child"
                :selectedId="selectedId"
                :hoveredId="hoveredId"
                @select="(id, el) => $emit('select', id, el)"
                @hover="(id) => $emit('hover', id)"
                @delete="(id) => $emit('delete', id)"
            />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
    item: { type: Object, required: true },
    selectedId: { type: String, default: null },
    hoveredId: { type: String, default: null },
})

defineEmits(['select', 'hover', 'delete'])

const collapsed = ref(false)

const getIcon = (type) => {
    const icons = {
        page: 'fas fa-file',
        section: 'fas fa-folder',
        row: 'fas fa-grip-lines',
        column: 'fas fa-columns',
        field: 'fas fa-keyboard',
        text: 'fas fa-paragraph',
        p: 'fas fa-paragraph',
        h1: 'fas fa-heading',
        h2: 'fas fa-heading',
        h3: 'fas fa-heading',
        image: 'fas fa-image',
    }
    return icons[type] || 'fas fa-cube'
}
</script>

<style lang="scss" scoped>
.tree-item-wrapper {
    display: flex;
    flex-direction: column;
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

.item-actions {
    opacity: 0;
    transition: opacity 0.2s;
    .delete-btn {
        color: var(--rojo);
        opacity: 0.5;
        font-size: 0.7rem;
        &:hover {
            opacity: 1;
        }
    }
}

.tree-children {
    padding-left: 1rem;
    border-left: var(--border);
    margin-left: 0.4rem;
}
</style>
