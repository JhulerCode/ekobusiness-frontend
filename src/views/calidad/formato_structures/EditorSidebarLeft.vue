<template>
    <div class="editor-side">
        <div class="side-tabs">
            <button
                :class="{ active: activeTab === 'toolbox' }"
                @click="$emit('update:activeTab', 'toolbox')"
                title="Componentes"
            >
                Componentes
            </button>
            <button
                :class="{ active: activeTab === 'tree' }"
                @click="$emit('update:activeTab', 'tree')"
                title="Estructura"
            >
                Estructura
            </button>
        </div>

        <div v-if="activeTab === 'toolbox'" class="editor-section">
            <div class="toolbox-container">
                <div v-for="group in groupedElements" :key="group.name" class="toolbox-group">
                    <p class="group-title">{{ group.name }}</p>
                    <div class="toolbox-grid">
                        <button
                            v-for="el in group.elements"
                            :key="el.type"
                            @click="$emit('addBlock', el.type)"
                            :title="el.label"
                        >
                            <i :class="el.icon"></i>
                            <span>{{ el.label }}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="activeTab === 'tree'" class="editor-section">
            <TreeItem
                v-for="child in structure.children"
                :key="child.id"
                :item="child"
                :selectedId="selectedId"
                :hoveredId="hoveredId"
                @select="(id, el) => $emit('select', id, el)"
                @hover="(id) => $emit('hover', id)"
                @delete="(id) => $emit('delete', id)"
                @duplicate="(id) => $emit('duplicate', id)"
                @move="(dragId, targetId, pos) => $emit('move', dragId, targetId, pos)"
            />
        </div>
    </div>
</template>

<script>
import TreeItem from './TreeItem.vue'

export default {
    name: 'EditorSidebarLeft',
    components: { TreeItem },
    props: {
        activeTab: String,
        elementTypes: Array,
        structure: Object,
        selectedId: String,
        hoveredId: String,
    },
    computed: {
        groupedElements() {
            const groups = {}
            this.elementTypes.forEach((el) => {
                const groupName = el.group || 'OTROS'
                if (!groups[groupName]) groups[groupName] = []
                groups[groupName].push(el)
            })

            // Define order to match the desired UI
            const order = ['DESIGN', 'TEXT', 'MEDIA', 'INPUTS']
            return order
                .map((name) => ({
                    name,
                    elements: groups[name] || [],
                }))
                .filter((g) => g.elements.length > 0)
        },
    },
}
</script>

<style lang="scss" scoped>
.editor-side {
    flex: 0 0 25rem;
    min-width: 25rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .side-tabs {
        display: flex;
        border-bottom: var(--border);
        flex-shrink: 0;

        button {
            padding: 0.5rem 0.75rem;
            border: none;
            background: transparent;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 0.9rem;
            border-bottom: 2px solid transparent;

            &:hover {
                color: var(--primary-color);
            }

            &.active {
                border-bottom-color: var(--primary-color);
            }
        }
    }

    .editor-section {
        flex: 1;
        overflow-y: auto;
        padding: 1rem 0.5rem 0.5rem;
    }
}

.toolbox-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;

    .toolbox-group {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        .group-title {
            font-size: 0.7rem;
            color: var(--text-color2);
            letter-spacing: 0.05rem;
            text-transform: uppercase;
        }

        .toolbox-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            // gap: 0.75rem;

            button {
                padding: 0.75rem 0.25rem;
                border: 1px solid transparent;
                background: transparent;
                color: var(--text-color);
                border-radius: 0.5rem;
                cursor: pointer;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 0.6rem;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

                i {
                    font-size: 1.25rem;
                    color: var(--text-color);
                    transition: transform 0.2s;
                }

                span {
                    font-size: 0.7rem;
                    text-align: center;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    width: 100%;
                }

                &:hover {
                    background-color: var(--bg-color-hover);

                    i,
                    span {
                        color: var(--primary-color);
                    }
                }

                &:active {
                    transform: scale(0.95);
                }
            }
        }
    }
}
</style>
