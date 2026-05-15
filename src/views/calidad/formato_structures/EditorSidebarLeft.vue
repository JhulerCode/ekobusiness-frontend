<template>
    <div class="editor-side">
        <div class="side-tabs">
            <button
                v-if="vista.mode === 'edit'"
                :class="{ active: activeTab === 'toolbox' }"
                @click="$emit('update:activeTab', 'toolbox')"
                title="Componentes"
            >
                Componentes
            </button>
            <button
                v-if="vista.mode === 'edit'"
                :class="{ active: activeTab === 'patterns' }"
                @click="$emit('update:activeTab', 'patterns')"
                title="Patrones"
            >
                Patrones
            </button>
            <button
                :class="{ active: activeTab === 'tree' }"
                @click="$emit('update:activeTab', 'tree')"
                title="Estructura"
            >
                Estructura
            </button>
        </div>

        <div v-show="activeTab === 'toolbox'" class="editor-section">
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

        <div v-show="activeTab === 'patterns'" class="editor-section">
            <div class="toolbox-container">
                <div class="toolbox-group">
                    <p class="group-title">DISEÑOS PREDEFINIDOS</p>
                    <div class="toolbox-grid">
                        <button
                            v-for="pat in patterns"
                            :key="pat.id"
                            @click="$emit('addPattern', pat)"
                            :title="pat.label"
                        >
                            <i :class="pat.icon"></i>
                            <span>{{ pat.label }}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div v-show="activeTab === 'tree'" class="editor-section">
            <TreeItem
                v-for="child in structure.children"
                :key="child.id"
                :item="child"
                :selectedId="selectedId"
                :hoveredId="hoveredId"
                :mode="vista.mode"
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
        orderElementTypes: Array,
        elementTypes: Array,
        structure: { type: Object, default: () => ({}) },
        selectedId: String,
        hoveredId: String,
        vista: Object,
    },
    data() {
        return {
            patterns: [
                {
                    id: 'pattern_header',
                    label: 'Encabezado',
                    icon: 'fas fa-id-card',
                    type: 'grid',
                    name: 'Encabezado',
                    style: {
                        gridTemplateColumns: '1fr 2fr 1fr',
                        alignItems: 'center',
                        gap: '20px',
                        marginBottom: '1rem',
                    },
                    children: [
                        {
                            type: 'group',
                            name: 'Logo',
                            children: [
                                {
                                    type: 'image',
                                    name: 'Logo',
                                    props: { src: '' },
                                    style: { width: '100%' },
                                },
                            ],
                        },
                        {
                            type: 'group',
                            name: 'Título',
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                gap: '0.5rem',
                            },
                            children: [
                                { type: 'h1', props: { content: 'TITULO DEL FORMATO' } },
                                { type: 'p', props: { content: 'SUBTITULO' } },
                            ],
                        },
                        {
                            type: 'group',
                            name: 'Metadatos',
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderWidth: '1px',
                                borderStyle: 'solid',
                                borderColor: '#dfdfdf',
                                borderRadius: '1rem',
                                padding: '0.5rem',
                            },
                            children: [
                                { type: 'small', props: { content: 'CÓDIGO: XX-YYY-ZZ' } },
                                { type: 'small', props: { content: 'VERSIÓN: 1.0' } },
                                { type: 'small', props: { content: 'FECHA: Ene-26' } },
                                { type: 'small', props: { content: 'APROBADO POR: GG' } },
                            ],
                        },
                    ],
                },
                {
                    id: 'group_2_cols',
                    label: '2 Columnas',
                    icon: 'fas fa-columns',
                    type: 'group',
                    name: 'Fila (2 Col)',
                    style: { flexDirection: 'row', gap: '1rem' },
                    children: [
                        {
                            type: 'group',
                            name: 'Columna 1',
                            style: { flex: '1' },
                            children: [],
                        },
                        {
                            type: 'group',
                            name: 'Columna 2',
                            style: { flex: '1' },
                            children: [],
                        },
                    ],
                },
                {
                    id: 'group_3_cols',
                    label: '3 Columnas',
                    icon: 'fas fa-th-large',
                    type: 'group',
                    name: 'Fila (3 Col)',
                    style: { flexDirection: 'row', gap: '1rem' },
                    children: [
                        {
                            type: 'group',
                            name: 'Columna 1',
                            style: { flex: '1' },
                            children: [],
                        },
                        {
                            type: 'group',
                            name: 'Columna 2',
                            style: { flex: '1' },
                            children: [],
                        },
                        {
                            type: 'group',
                            name: 'Columna 3',
                            style: { flex: '1' },
                            children: [],
                        },
                    ],
                },
                {
                    id: 'grid_2x2',
                    label: 'Cuadrícula 2x2',
                    icon: 'fas fa-th-large',
                    type: 'grid',
                    name: 'Grid 2x2',
                    style: { gridTemplateColumns: '1fr 1fr', gap: '1rem' },
                    children: [
                        { type: 'group', name: 'Celda 1', children: [] },
                        { type: 'group', name: 'Celda 2', children: [] },
                        { type: 'group', name: 'Celda 3', children: [] },
                        { type: 'group', name: 'Celda 4', children: [] },
                    ],
                },
                {
                    id: 'grid_section_2',
                    label: 'Sección Grid (2)',
                    icon: 'fas fa-th-list',
                    type: 'group',
                    name: 'Sección',
                    style: { marginBottom: '1rem' },
                    children: [
                        {
                            type: 'p',
                            name: 'Cabecera',
                            props: { content: 'Contenedor' },
                            style: {
                                backgroundColor: '#f2f2f2',
                                padding: '4px 8px',
                                fontWeight: 'bold',
                                fontSize: '10pt',
                                color: 'rgba(60, 60, 60, .66)',
                            },
                        },
                        {
                            type: 'grid',
                            name: 'Cuadrícula',
                            style: {
                                gridTemplateColumns: '1fr 1fr',
                                gap: '8px',
                                padding: '8px',
                            },
                            children: [
                                { type: 'input_text', props: { label: 'Campo 1' } },
                                { type: 'input_text', props: { label: 'Campo 2' } },
                            ],
                        },
                    ],
                },
            ],
        }
    },
    computed: {
        groupedElements() {
            const groups = {}
            this.elementTypes.forEach((el) => {
                const groupName = el.group || 'OTROS'
                if (!groups[groupName]) groups[groupName] = []
                groups[groupName].push(el)
            })

            return this.orderElementTypes
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
    flex: 0 0 20rem;
    min-width: 20rem;
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
            font-size: 0.85rem;
            color: var(--text-color2);
            border-bottom: 2px solid transparent;

            &:hover {
                color: var(--primary-color) !important;
            }

            &.active {
                color: var(--text-color);
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
