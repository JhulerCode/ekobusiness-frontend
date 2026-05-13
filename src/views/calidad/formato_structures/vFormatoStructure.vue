<template>
    <VistaDetalleLayout
        v-if="vista"
        :config="VIEW_CONFIG"
        :pestanas="pestanas"
        :loadNewData="loadNewData"
        :loadExistingData="loadExistingData"
        @runMethod="runMethod"
    >
        <template #principal-datos>
            <div class="header-info">
                <JdInput
                    v-model="vista.data.codigo"
                    label="Código"
                    :disabled="vista.mode !== 'edit'"
                />
                <JdInput
                    v-model="vista.data.nombre"
                    label="Nombre"
                    :disabled="vista.mode !== 'edit'"
                />
                <JdSelect
                    v-model="vista.data.tipo"
                    label="Tipo"
                    :lista="[
                        { id: 'REGISTRO', nombre: 'Registro' },
                        { id: 'FORMATO', nombre: 'Formato' },
                    ]"
                    :disabled="vista.mode !== 'edit'"
                />
            </div>
        </template>

        <template #pestanas-body>
            <div v-if="vista.pestana === 1" class="editor-layout">
                <!-- LEFT SIDEBAR: Structure & Toolbox -->
                <div class="editor-side">
                    <div class="editor-section">
                        <div
                            class="editor-header clickable"
                            @click="collapsedSections.toolbox = !collapsedSections.toolbox"
                        >
                            <strong>Componentes</strong>
                            <i
                                :class="[
                                    'fas fa-sm',
                                    collapsedSections.toolbox
                                        ? 'fa-chevron-right'
                                        : 'fa-chevron-down',
                                ]"
                            ></i>
                        </div>
                        <div v-show="!collapsedSections.toolbox" class="editor-content toolbox">
                            <button
                                v-for="el in ELEMENT_TYPES"
                                :key="el.type"
                                @click="addBlockToSelected(el.type)"
                            >
                                <i :class="el.icon"></i> {{ el.label }}
                            </button>
                        </div>
                    </div>

                    <div class="editor-section">
                        <div
                            class="editor-header clickable"
                            @click="collapsedSections.tree = !collapsedSections.tree"
                        >
                            <strong>Estructura / Esquema</strong>
                            <i
                                :class="[
                                    'fas fa-sm',
                                    collapsedSections.tree ? 'fa-chevron-right' : 'fa-chevron-down',
                                ]"
                            ></i>
                        </div>
                        <div v-show="!collapsedSections.tree" class="editor-content">
                            <div class="tree-container">
                                <TreeItem
                                    v-if="vista.data.structure"
                                    :item="vista.data.structure"
                                    :selectedId="selectedId"
                                    :hoveredId="hoveredId"
                                    @select="handleSelect"
                                    @hover="(id) => (hoveredId = id)"
                                    @delete="deleteBlock"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- MAIN RENDERER -->
                <div class="renderer-side">
                    <FormatoDocument
                        ref="documentRef"
                        :estructura="vista.data"
                        :values="{}"
                        :listas="{}"
                        :mode="3"
                        :editable="true"
                        :selectedId="selectedId"
                        :hoveredId="hoveredId"
                        @select="handleSelectDirect"
                        @hover="(id) => (hoveredId = id)"
                    />
                </div>

                <!-- RIGHT SIDEBAR: Properties & Metadata -->
                <div class="editor-side">
                    <template v-if="selectedId && selectedElement">
                        <div class="element-header">
                            <strong>{{ selectedElement.type }}</strong>
                            <JdInput
                                v-model="selectedElement.name"
                                :placeholder="selectedElement.id"
                            />
                            <i
                                class="fas fa-times-circle btn"
                                @click="((selectedId = null), (selectedElement = null))"
                            ></i>
                        </div>

                        <!-- DYNAMIC PROPS SECTION -->
                        <div
                            class="editor-section"
                            v-if="selectedElementTypeConfig?.propsFields?.length"
                        >
                            <div class="editor-header clickable" @click="toggleSection('props')">
                                <strong>Propiedades</strong>
                                <i
                                    :class="[
                                        'fas fa-sm',
                                        collapsedSections.props
                                            ? 'fa-chevron-right'
                                            : 'fa-chevron-down',
                                    ]"
                                ></i>
                            </div>
                            <div v-show="!collapsedSections.props" class="editor-content">
                                <template
                                    v-for="field in selectedElementTypeConfig.propsFields"
                                    :key="field.key"
                                >
                                    <JdSelect
                                        v-if="field.type === 'select'"
                                        v-model="selectedElement.props[field.key]"
                                        :label="field.label"
                                        :lista="field.list === 'fieldList' ? fieldList : field.list"
                                    />
                                    <JdInput
                                        v-else
                                        v-model="selectedElement.props[field.key]"
                                        :label="field.label"
                                        :textarea="field.textarea"
                                        :placeholder="field.placeholder"
                                    />
                                </template>
                            </div>
                        </div>

                        <!-- DYNAMIC STYLE SECTIONS -->
                        <template
                            v-for="(fields, sectionKey) in selectedElementGroupedStyles"
                            :key="sectionKey"
                        >
                            <div class="editor-section">
                                <div
                                    class="editor-header clickable"
                                    @click="toggleSection(sectionKey)"
                                >
                                    <strong>{{ STYLE_SECTIONS_LABELS[sectionKey] }}</strong>
                                    <i
                                        :class="[
                                            'fas fa-sm',
                                            collapsedSections[sectionKey]
                                                ? 'fa-chevron-right'
                                                : 'fa-chevron-down',
                                        ]"
                                    ></i>
                                </div>
                                <div v-show="!collapsedSections[sectionKey]" class="editor-content">
                                    <div class="style-grid">
                                        <template v-for="fieldKey in fields" :key="fieldKey">
                                            <div
                                                :class="{
                                                    'full-width': !STYLE_FIELDS_DEF[fieldKey].grid,
                                                }"
                                            >
                                                <JdSelect
                                                    v-if="
                                                        STYLE_FIELDS_DEF[fieldKey].type === 'select'
                                                    "
                                                    v-model="selectedElement.style[fieldKey]"
                                                    :label="STYLE_FIELDS_DEF[fieldKey].label"
                                                    :lista="STYLE_FIELDS_DEF[fieldKey].list"
                                                />
                                                <JdInput
                                                    v-else
                                                    v-model="selectedElement.style[fieldKey]"
                                                    :label="STYLE_FIELDS_DEF[fieldKey].label"
                                                />
                                            </div>
                                        </template>
                                    </div>
                                </div>
                            </div>
                        </template>

                        <!-- OTHER SECTIONS -->
                        <div class="editor-section" v-if="hasConfig('settings')">
                            <div class="editor-header clickable" @click="toggleSection('settings')">
                                <strong>Configuraciones</strong>
                                <i
                                    :class="[
                                        'fas fa-sm',
                                        collapsedSections.settings
                                            ? 'fa-chevron-right'
                                            : 'fa-chevron-down',
                                    ]"
                                ></i>
                            </div>
                            <div v-show="!collapsedSections.settings" class="editor-content">
                                <p class="text-tiny">No hay configuraciones extras.</p>
                            </div>
                        </div>

                        <div class="editor-section" v-if="hasConfig('visibility')">
                            <div
                                class="editor-header clickable"
                                @click="toggleSection('visibility')"
                            >
                                <strong>Visibilidad</strong>
                                <i
                                    :class="[
                                        'fas fa-sm',
                                        collapsedSections.visibility
                                            ? 'fa-chevron-right'
                                            : 'fa-chevron-down',
                                    ]"
                                ></i>
                            </div>
                            <div v-show="!collapsedSections.visibility" class="editor-content">
                                <JdInput
                                    v-model="selectedElement.visibility.condition"
                                    label="Condición (JS)"
                                />
                            </div>
                        </div>
                    </template>
                </div>
            </div>

            <div v-if="vista.pestana === 2" class="json-editor">
                <pre>{{ JSON.stringify(vista.data, null, 8) }}</pre>
            </div>
        </template>
    </VistaDetalleLayout>
</template>

<script>
import { useVistas } from '@/pinia/vistas'
import { useAuth } from '@/pinia/auth'
import { get } from '@/utils/crud'

import VistaDetalleLayout from '@/components/VistaDetalleLayout.vue'
import TreeItem from '@/components/formatos/TreeItem.vue'
import FormatoDocument from '@/components/formatos/FormatoDocument.vue'
import JdInput from '@/components/inputs/JdInput.vue'
import JdSelect from '@/components/inputs/JdSelect.vue'

const TEXT_ALIGN_OPTIONS = [
    { id: 'left', nombre: 'Izquierda' },
    { id: 'center', nombre: 'Centro' },
    { id: 'right', nombre: 'Derecha' },
    { id: 'justify', nombre: 'Justificado' },
]

const FLEX_DIRECTIONS = [
    { id: 'column', nombre: 'Vertical' },
    { id: 'row', nombre: 'Horizontal' },
]

const JUSTIFY_OPTIONS = [
    { id: 'flex-start', nombre: 'Inicio' },
    { id: 'center', nombre: 'Centro' },
    { id: 'flex-end', nombre: 'Fin' },
    { id: 'space-between', nombre: 'Espaciado' },
]

const ALIGN_OPTIONS = [
    { id: 'stretch', nombre: 'Estirar' },
    { id: 'flex-start', nombre: 'Inicio' },
    { id: 'center', nombre: 'Centro' },
    { id: 'flex-end', nombre: 'Fin' },
]

const BORDER_STYLE_OPTIONS = [
    { id: 'none', nombre: 'Ninguno' },
    { id: 'solid', nombre: 'Sólido' },
    { id: 'dashed', nombre: 'Guiones' },
    { id: 'dotted', nombre: 'Puntos' },
    { id: 'double', nombre: 'Doble' },
]

const STYLE_SECTIONS_LABELS = {
    layout: 'Layout / Flex',
    box: 'Dimensiones y Espaciado',
    border: 'Bordes y Fondo',
    typography: 'Tipografía',
    other: 'Otros',
}

const STYLE_FIELDS_DEF = {
    // Layout (Flex)
    flexDirection: { label: 'Dirección', type: 'select', list: FLEX_DIRECTIONS, section: 'layout' },
    justifyContent: {
        label: 'Distribución',
        type: 'select',
        list: JUSTIFY_OPTIONS,
        section: 'layout',
    },
    alignItems: { label: 'Alineación', type: 'select', list: ALIGN_OPTIONS, section: 'layout' },
    gap: { label: 'Gap', section: 'layout' },
    flex: { label: 'Flex (Ancho)', section: 'layout' },

    // Dimensiones y espaciado
    width: { label: 'Ancho', grid: 2, section: 'box' },
    height: { label: 'Alto', grid: 2, section: 'box' },
    marginTop: { label: 'Margin Top', section: 'box' },
    marginRight: { label: 'Margin Right', section: 'box' },
    marginBottom: { label: 'Margin Bottom', section: 'box' },
    marginLeft: { label: 'Margin Left', section: 'box' },
    paddingTop: { label: 'Padding Top', section: 'box' },
    paddingRight: { label: 'Padding Right', section: 'box' },
    paddingBottom: { label: 'Padding Bottom', section: 'box' },
    paddingLeft: { label: 'Padding Left', section: 'box' },

    // Fondo y bordes
    backgroundColor: { label: 'Color Fondo', section: 'border' },
    borderStyle: {
        label: 'Estilo Borde',
        type: 'select',
        list: BORDER_STYLE_OPTIONS,
        section: 'border',
    },
    borderWidth: { label: 'Grosor Borde', section: 'border' },
    borderColor: { label: 'Color Borde', section: 'border' },
    borderRadius: { label: 'Radio Borde', section: 'border' },

    // Typography
    fontSize: { label: 'Tamaño Fuente', section: 'typography' },
    fontWeight: { label: 'Grosor Fuente', section: 'typography' },
    color: { label: 'Color Texto', section: 'typography' },
    textAlign: {
        label: 'Alineación',
        type: 'select',
        list: TEXT_ALIGN_OPTIONS,
        section: 'typography',
    },
}

const COMMON_STYLES = [
    'width',
    'height',
    'marginTop',
    'marginRight',
    'marginBottom',
    'marginLeft',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'backgroundColor',
    'borderStyle',
    'borderWidth',
    'borderColor',
    'borderRadius',
]

const TYPOGRAPHY_STYLES = ['fontSize', 'fontWeight', 'color', 'textAlign']

const ELEMENT_TYPES = [
    {
        type: 'group',
        label: 'Grupo',
        icon: 'fas fa-layer-group',
        defaultProps: {},
        defaultStyle: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'stretch',
            gap: '0',
            marginTop: '0',
            marginRight: '0',
            marginBottom: '0',
            marginLeft: '0',
            paddingTop: '0',
            paddingRight: '0',
            paddingBottom: '0',
            paddingLeft: '0',
        },
        hasChildren: true,
        propsFields: [],
        styleFields: [
            'flexDirection',
            'justifyContent',
            'alignItems',
            'gap',
            'flex',
            ...COMMON_STYLES,
        ],
    },
    {
        type: 'p',
        label: 'Párrafo',
        icon: 'fas fa-paragraph',
        defaultProps: { content: 'Nuevo contenido...' },
        defaultStyle: { margin: '0', padding: '0' },
        propsFields: [{ key: 'content', label: 'Contenido', textarea: true }],
        styleFields: [...TYPOGRAPHY_STYLES, ...COMMON_STYLES],
    },
    {
        type: 'h1',
        label: 'Título H1',
        icon: 'fas fa-heading',
        defaultProps: { content: 'Título' },
        defaultStyle: { margin: '0', padding: '0', fontSize: '1.5rem', fontWeight: 'bold' },
        propsFields: [{ key: 'content', label: 'Contenido', textarea: true }],
        styleFields: [...TYPOGRAPHY_STYLES, ...COMMON_STYLES],
    },
    {
        type: 'image',
        label: 'Imagen',
        icon: 'fas fa-image',
        defaultProps: { src: '' },
        defaultStyle: { width: '100%' },
        propsFields: [{ key: 'src', label: 'URL Imagen' }],
        styleFields: COMMON_STYLES,
    },
    {
        type: 'input',
        label: 'Input',
        icon: 'fas fa-keyboard',
        defaultProps: { fieldId: '' },
        defaultStyle: { margin: '0', padding: '0' },
        propsFields: [{ key: 'fieldId', label: 'Campo', type: 'select', list: 'fieldList' }],
        styleFields: [...TYPOGRAPHY_STYLES, ...COMMON_STYLES],
    },
]

export default {
    components: {
        VistaDetalleLayout,
        TreeItem,
        FormatoDocument,
        JdInput,
        JdSelect,
    },
    data() {
        return {
            auth: useAuth(),
            vistas: useVistas(),
            selectedId: null,
            hoveredId: null,
            selectedElement: null,
            VIEW_CONFIG: {
                apiPath: 'formato_structures',
                pathKey: 'formato_structure_id',
                permisoEditar: 'vFormatoStructures:editar',
                permisoCrear: 'vFormatoStructures:crear',
            },
            pestanas: [
                { id: 1, label: 'Editor Visual', show: true },
                { id: 2, label: 'JSON / Datos', show: true },
            ],
            ELEMENT_TYPES,
            STYLE_FIELDS_DEF,
            STYLE_SECTIONS_LABELS,
            collapsedSections: {
                toolbox: false,
                tree: false,
                props: true,
                layout: true,
                box: true,
                border: true,
                typography: true,
                settings: true,
                visibility: true,
            },
        }
    },
    computed: {
        vista() {
            return this.vistas[this.$route.name]
        },
        fieldList() {
            return (this.vista.data.fields || []).map((f) => ({
                id: f.id,
                nombre: `${f.label} (${f.id})`,
            }))
        },
        selectedElementTypeConfig() {
            if (!this.selectedElement) return null
            return ELEMENT_TYPES.find((t) => t.type === this.selectedElement.type)
        },
        selectedElementGroupedStyles() {
            if (!this.selectedElementTypeConfig?.styleFields) return {}
            const groups = {}
            this.selectedElementTypeConfig.styleFields.forEach((key) => {
                const field = STYLE_FIELDS_DEF[key]
                if (!field) return
                const section = field.section || 'other'
                if (!groups[section]) groups[section] = []
                groups[section].push(key)
            })
            return groups
        },
    },
    methods: {
        runMethod(action) {
            this[action]()
        },
        loadNewData() {
            this.vista.data = {
                codigo: '',
                nombre: '',
                tipo: 'REGISTRO',
                system_lists: [],
                fields: [],
                structure: {
                    id: 'root',
                    type: 'page',
                    name: 'Página Principal',
                    style: {
                        backgroundColor: '#ffffff',
                        padding: '0.5in',
                        flexDirection: 'column',
                    },
                    children: [
                        {
                            id: 'header_group',
                            type: 'group',
                            name: 'Encabezado',
                            props: {},
                            style: {
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '20px',
                            },
                            children: [
                                {
                                    id: 'header_left',
                                    type: 'group',
                                    name: 'Logo',
                                    props: {},
                                    style: {
                                        display: 'flex',
                                        flexDirection: 'column',
                                        flex: '25%',
                                    },
                                    children: [
                                        {
                                            id: 'logo_img',
                                            type: 'image',
                                            name: 'Logo',
                                            props: { src: this.auth.empresa?.logo?.url },
                                            style: { width: '100%' },
                                        },
                                    ],
                                },
                                {
                                    id: 'header_center',
                                    type: 'group',
                                    name: 'Título',
                                    props: {},
                                    style: {
                                        display: 'flex',
                                        flexDirection: 'column',
                                        flex: '50%',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        gap: '0.5rem',
                                    },
                                    children: [
                                        {
                                            id: 'h_title',
                                            type: 'h1',
                                            props: { content: 'TITULO DEL FORMATO' },
                                            style: { fontSize: '1.2rem', fontWeight: 'bold' },
                                        },
                                        {
                                            id: 'h_subtitle',
                                            type: 'p',
                                            props: { content: 'SUBTITULO' },
                                            style: { fontSize: '0.8rem' },
                                        },
                                    ],
                                },
                                {
                                    id: 'header_right',
                                    type: 'group',
                                    name: 'Metadatos',
                                    props: {},
                                    style: {
                                        display: 'flex',
                                        flexDirection: 'column',
                                        flex: '25%',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderWidth: '1px',
                                        borderStyle: 'solid',
                                        borderColor: '#dfdfdf',
                                        borderRadius: '15px',
                                        paddingTop: '0.5rem',
                                        paddingRight: '0.5rem',
                                        paddingBottom: '0.5rem',
                                        paddingLeft: '0.5rem',
                                    },
                                    children: [
                                        {
                                            id: 'h_cod',
                                            type: 'p',
                                            props: { content: 'CÓDIGO: XX-YYY-ZZ' },
                                            style: { fontSize: '0.8rem' },
                                        },
                                        {
                                            id: 'h_ver',
                                            type: 'p',
                                            props: { content: 'VERSIÓN: 1.0' },
                                            style: { fontSize: '0.8rem' },
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            id: 'main_content',
                            type: 'group',
                            name: 'Contenido Principal',
                            props: {},
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem',
                            },
                            children: [],
                        },
                    ],
                },
            }
        },
        async loadExistingData() {
            this.auth.setLoading(true, 'Cargando formato...')
            const res = await get(`${this.vista.apiUrl}/uno/${this.$route.params.id}`)
            this.auth.setLoading(false)
            if (res.code === 0) {
                this.vista.data = res.data
                if (!this.vista.data.structure) this.loadNewData() // Fallback if no structure
            }
        },

        toggleSection(key) {
            this.collapsedSections[key] = !this.collapsedSections[key]
        },

        //--- Editor logic ---//
        handleSelect(id, element) {
            this.selectedId = id
            this.selectedElement = element
        },
        handleSelectDirect({ id, element }) {
            this.selectedId = id
            this.selectedElement = element
        },
        addBlockToSelected(type) {
            const config = ELEMENT_TYPES.find((t) => t.type === type)
            if (!config) return

            const newBlock = {
                id: type + '_' + Date.now().toString().slice(-6),
                type: type,
                name: 'Nuevo ' + config.label,

                props: config.defaultProps ? { ...config.defaultProps } : {},
                style: config.defaultStyle ? { ...config.defaultStyle } : {},
                settings: config.defaultSettings ? { ...config.defaultSettings } : {},
                actions: config.defaultActions ? { ...config.defaultActions } : {},
                bindings: config.defaultBindings ? { ...config.defaultBindings } : {},
                animations: config.defaultAnimations ? { ...config.defaultAnimations } : {},
                visibility: config.defaultVisibility ? { ...config.defaultVisibility } : {},

                children: [],
            }

            if (this.selectedId && this.selectedElement && this.selectedElement.children) {
                this.selectedElement.children.push(newBlock)
            } else {
                this.vista.data.structure.children.push(newBlock)
            }
        },
        hasConfig(key) {
            if (!this.selectedElement) return false
            // Check if the property exists in the object
            return this.selectedElement[key] !== undefined
        },
        deleteBlock(id) {
            const removeRecursive = (list) => {
                const idx = list.findIndex((item) => item.id === id)
                if (idx !== -1) {
                    list.splice(idx, 1)
                    return true
                }
                for (const item of list) {
                    if (item.children && removeRecursive(item.children)) return true
                }
                return false
            }
            removeRecursive(this.vista.data.structure.children)
            if (this.selectedId === id) {
                this.selectedId = null
                this.selectedElement = null
            }
        },
    },
}
</script>

<style lang="scss" scoped>
.header-info {
    display: grid;
    grid-template-columns: 10rem 20rem 15rem;
    gap: 1rem;
    padding: 0.5rem 0;
}

.editor-layout {
    display: flex;
    height: calc(100vh - 250px);
    gap: 1rem;

    .editor-side {
        width: 20rem;
        max-height: calc(100vh - 250px);
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        .editor-header {
            padding: 0.6rem 1rem;
            background-color: var(--bg-color2);
            display: flex;
            justify-content: space-between;
            align-items: center;
            user-select: none;

            &.clickable {
                cursor: pointer;
                &:hover {
                    background-color: var(--bg-color-hover);
                }
            }

            i {
                color: var(--text-color2);
            }

            strong {
                font-size: 0.8rem;
                text-transform: uppercase;
                color: var(--text-color2);
            }
        }

        .editor-content {
            overflow-y: auto;
            padding: 0.75rem;
            display: grid;
            gap: 0.75rem;
        }
    }

    .renderer-side {
        flex: 1;
        overflow-y: auto;
        padding: 2rem;
        background-color: #333;
        display: flex;
        justify-content: center;
    }
}

.sidebar-padding {
    padding: 0.75rem;
    display: grid;
    gap: 0.75rem;
}

.toolbox {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.4rem;

    button {
        padding: 0.4rem;
        font-size: 0.7rem;
        border: var(--border);
        background: var(--bg-color);
        color: var(--text-color);
        border-radius: 0.25rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.3rem;
        i {
            color: var(--primary-color);
        }
        &:hover {
            border-color: var(--primary-color);
            background: var(--bg-color-hover);
        }
    }
}

.element-header {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    margin-bottom: 0.5rem;

    strong {
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        background-color: var(--primary-color);
        text-transform: uppercase;
        font-size: 0.8rem;
    }

    .btn {
        cursor: pointer;
        color: var(--text-color2);
    }
}

.json-editor {
    padding: 2rem;
    background: #1e1e1e;
    color: #d4d4d4;
    font-family: monospace;
    overflow: auto;
}

.grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
}

.style-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;

    & > div {
        flex: 1 1 45%;
        &.full-width {
            flex: 1 1 100%;
        }
    }
}

.text-tiny {
    font-size: 0.7rem;
    color: var(--text-color3);
    font-style: italic;
}
</style>
