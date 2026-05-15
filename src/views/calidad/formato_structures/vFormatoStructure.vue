<template>
    <VistaDetalleLayout
        v-if="vista"
        :config="VIEW_CONFIG"
        :loadNewData="loadNewData"
        :loadExistingData="loadExistingData"
        @runMethod="runMethod"
    >
        <template #principal-datos>
            <JdInput v-model="vista.data.codigo" label="Código" :disabled="vista.mode !== 'edit'" />
            <JdInput v-model="vista.data.nombre" label="Nombre" :disabled="vista.mode !== 'edit'" />
            <!-- <JdSelect
                v-model="vista.data.tipo"
                label="Tipo"
                :lista="[
                    { id: 'REGISTRO', nombre: 'Registro' },
                    { id: 'FORMATO', nombre: 'Formato' },
                ]"
                :disabled="vista.mode !== 'edit'"
            /> -->
            <div style="display: flex; gap: 0.25rem">
                <JdButton tipo="2" text="nuevo" @click="loadNewData" />
                <JdButton
                    tipo="2"
                    :text="verInputs ? 'ver final' : 'ver inputs'"
                    @click="toggleVerInputs"
                />
            </div>
        </template>

        <div class="editor-layout">
            <!-- LEFT SIDEBAR: Structure & Toolbox -->
            <EditorSidebarLeft
                v-model:activeTab="activeSideTab"
                :elementTypes="ELEMENT_TYPES"
                :structure="vista.data.structure"
                :selectedId="selectedId"
                :hoveredId="hoveredId"
                @addBlock="addBlockToSelected"
                @select="handleSelect"
                @hover="(id) => (hoveredId = id)"
                @delete="deleteBlock"
                @duplicate="duplicateBlock"
                @move="handleMove"
            />

            <!-- MAIN RENDERER -->
            <FormatoDocument
                ref="documentRef"
                :estructura="vista.data"
                :values="formato_value.values"
                :listas="system.data"
                :mode="verInputs ? 1 : 3"
                :editable="true"
                :selectedId="selectedId"
                :hoveredId="hoveredId"
                @select="handleSelectDirect"
                @hover="(id) => (hoveredId = id)"
            />

            <!-- RIGHT SIDEBAR: Properties & Metadata -->
            <EditorSidebarRight
                :selectedId="selectedId"
                :selectedElement="selectedElement"
                :config="selectedElementTypeConfig"
                :groupedStyles="selectedElementGroupedStyles"
                :collapsedSections="collapsedSections"
                :styleFieldsDef="STYLE_FIELDS_DEF"
                :styleSectionsLabels="STYLE_SECTIONS_LABELS"
                :paperSizes="PAPER_SIZES"
                :typographyStyles="TYPOGRAPHY_STYLES"
                :fieldList="fieldList"
                :vista="vista"
                @toggleSection="toggleSection"
            />
        </div>
    </VistaDetalleLayout>
</template>

<script>
import { useVistas } from '@/pinia/vistas'
import { useAuth } from '@/pinia/auth'
import { useSystem } from '@/pinia/system'
import { get, post, patch } from '@/utils/crud'
import { incompleteData } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

import VistaDetalleLayout from '@/components/VistaDetalleLayout.vue'
import FormatoDocument from '@/components/formatos/FormatoDocument.vue'
import EditorSidebarLeft from './EditorSidebarLeft.vue'
import EditorSidebarRight from './EditorSidebarRight.vue'

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
    { id: 'solid', nombre: 'Sólido' },
    { id: 'dashed', nombre: 'Guiones' },
    { id: 'dotted', nombre: 'Puntos' },
    { id: 'double', nombre: 'Doble' },
]

const PAPER_SIZES = [
    { id: 'A4', nombre: 'A4 (210 x 297 mm)' },
    { id: 'LETTER', nombre: 'Carta (215.9 x 279.4 mm)' },
    { id: 'LEGAL', nombre: 'Oficio (215.9 x 355.6 mm)' },
]

const ORIENTATIONS = [
    { id: 'portrait', nombre: 'Vertical' },
    { id: 'landscape', nombre: 'Horizontal' },
]

const STYLE_SECTIONS_LABELS = {
    layout: 'Layout / Flex',
    box: 'Dimensiones y Espaciado',
    border: 'Bordes y Fondo',
    typography: 'Tipografía',
    other: 'Otros',
    inputLabel: 'Estilo de Etiqueta (PDF)',
    inputValue: 'Estilo de Valor (PDF)',
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
        type: 'page',
        group: 'DESIGN',
        label: 'Página',
        icon: 'fas fa-file-alt',
        defaultProps: {
            orientation: 'portrait',
            paddingTop: '0.5in',
            paddingRight: '0.5in',
            paddingBottom: '0.5in',
            paddingLeft: '0.5in',
            headerId: '',
        },
        defaultStyle: {
            backgroundColor: '#ffffff',
        },
        hasChildren: true,
        propsFields: [
            { key: 'orientation', label: 'Orientación', type: 'select', list: ORIENTATIONS },
            {
                key: 'headerId',
                label: 'ID Encabezado Reutilizable',
                placeholder: 'Ej: header_group',
            },
            { key: 'paddingTop', label: 'Padding Sup.' },
            { key: 'paddingRight', label: 'Padding Der.' },
            { key: 'paddingBottom', label: 'Padding Inf.' },
            { key: 'paddingLeft', label: 'Padding Izq.' },
        ],
        styleFields: ['backgroundColor'],
    },
    {
        type: 'group',
        group: 'DESIGN',
        label: 'Grupo',
        icon: 'fas fa-layer-group',
        defaultProps: {},
        defaultStyle: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'stretch',
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
        type: 'h1',
        group: 'TEXT',
        label: 'Título 1',
        icon: 'fas fa-heading',
        defaultProps: { content: 'Título 1' },
        defaultStyle: {},
        propsFields: [{ key: 'content', label: 'Contenido', textarea: true }],
        styleFields: [...TYPOGRAPHY_STYLES, ...COMMON_STYLES],
    },
    {
        type: 'h2',
        group: 'TEXT',
        label: 'Título 2',
        icon: 'fas fa-heading',
        defaultProps: { content: 'Título 2' },
        defaultStyle: {},
        propsFields: [{ key: 'content', label: 'Contenido', textarea: true }],
        styleFields: [...TYPOGRAPHY_STYLES, ...COMMON_STYLES],
    },
    {
        type: 'h3',
        group: 'TEXT',
        label: 'Título 3',
        icon: 'fas fa-heading',
        defaultProps: { content: 'Título 3' },
        defaultStyle: {},
        propsFields: [{ key: 'content', label: 'Contenido', textarea: true }],
        styleFields: [...TYPOGRAPHY_STYLES, ...COMMON_STYLES],
    },
    {
        type: 'p',
        group: 'TEXT',
        label: 'Párrafo',
        icon: 'fas fa-paragraph',
        defaultProps: { content: 'Nuevo contenido...' },
        defaultStyle: {},
        propsFields: [{ key: 'content', label: 'Contenido', textarea: true }],
        styleFields: [...TYPOGRAPHY_STYLES, ...COMMON_STYLES],
    },
    {
        type: 'small',
        group: 'TEXT',
        label: 'Small',
        icon: 'fas fa-minus',
        defaultProps: { content: 'Nota al pie...' },
        defaultStyle: {},
        propsFields: [{ key: 'content', label: 'Contenido' }],
        styleFields: [...TYPOGRAPHY_STYLES, ...COMMON_STYLES],
    },
    {
        type: 'image',
        group: 'MEDIA',
        label: 'Imagen',
        icon: 'fas fa-image',
        defaultProps: { src: '' },
        defaultStyle: { width: '100%' },
        propsFields: [{ key: 'src', label: 'URL Imagen' }],
        styleFields: COMMON_STYLES,
    },
    {
        type: 'input_text',
        group: 'INPUTS',
        label: 'Input Texto',
        icon: 'fas fa-font',
        defaultProps: { fieldId: '', inputType: 'text', label: 'Nuevo Campo' },
        defaultStyle: { margin: '0', padding: '0' },
        propsFields: [
            { key: 'fieldId', label: 'ID del Campo (v-model)' },
            { key: 'label', label: 'Etiqueta' },
            {
                key: 'relatedPath',
                label: 'Propiedad Relacionada (Entidad)',
                placeholder: 'socio1.nombres',
            },
        ],
        styleFields: [...TYPOGRAPHY_STYLES, ...COMMON_STYLES],
    },
    {
        type: 'input_number',
        group: 'INPUTS',
        label: 'Input Número',
        icon: 'fas fa-hashtag',
        defaultProps: { fieldId: '', inputType: 'number', label: 'Nuevo Número' },
        defaultStyle: { margin: '0', padding: '0' },
        propsFields: [
            { key: 'fieldId', label: 'ID del Campo (v-model)' },
            { key: 'label', label: 'Etiqueta' },
            { key: 'relatedPath', label: 'Propiedad Relacionada (Entidad)' },
        ],
        styleFields: [...TYPOGRAPHY_STYLES, ...COMMON_STYLES],
    },
    {
        type: 'input_date',
        group: 'INPUTS',
        label: 'Input Fecha',
        icon: 'fas fa-calendar-alt',
        defaultProps: { fieldId: '', inputType: 'date', label: 'Fecha' },
        defaultStyle: { margin: '0', padding: '0' },
        propsFields: [
            { key: 'fieldId', label: 'ID del Campo (v-model)' },
            { key: 'label', label: 'Etiqueta' },
            { key: 'relatedPath', label: 'Propiedad Relacionada (Entidad)' },
        ],
        styleFields: [...TYPOGRAPHY_STYLES, ...COMMON_STYLES],
    },
    {
        type: 'input_longtext',
        group: 'INPUTS',
        label: 'Texto Largo',
        icon: 'fas fa-align-left',
        defaultProps: { fieldId: '', inputType: 'longtext', label: 'Observaciones' },
        defaultStyle: { margin: '0', padding: '0' },
        propsFields: [
            { key: 'fieldId', label: 'ID del Campo (v-model)' },
            { key: 'label', label: 'Etiqueta' },
            { key: 'relatedPath', label: 'Propiedad Relacionada (Entidad)' },
        ],
        styleFields: [...TYPOGRAPHY_STYLES, ...COMMON_STYLES],
    },
    {
        type: 'input_select',
        group: 'INPUTS',
        label: 'Selector',
        icon: 'fas fa-list',
        defaultProps: { fieldId: '', inputType: 'select', label: 'Opción' },
        defaultStyle: { margin: '0', padding: '0' },
        propsFields: [
            { key: 'fieldId', label: 'ID del Campo (v-model)' },
            { key: 'label', label: 'Etiqueta' },
            { key: 'optionsKey', label: 'Key de Lista (Pinia)' },
        ],
        styleFields: [...TYPOGRAPHY_STYLES, ...COMMON_STYLES],
        styleLabelFields: TYPOGRAPHY_STYLES,
        styleValueFields: TYPOGRAPHY_STYLES,
    },
    {
        type: 'input_ref',
        group: 'INPUTS',
        label: 'Buscador',
        icon: 'fas fa-search',
        defaultProps: { fieldId: '', inputType: 'ref', label: 'Referencia' },
        defaultStyle: { margin: '0', padding: '0' },
        propsFields: [
            { key: 'fieldId', label: 'ID del Campo (v-model)' },
            { key: 'label', label: 'Etiqueta' },
            { key: 'searchUrl', label: 'URL de Búsqueda' },
            { key: 'searchField', label: 'Columna de Búsqueda', placeholder: 'nombre' },
            { key: 'mostrar', label: 'Propiedad a mostrar', placeholder: 'nombre' },
            { key: 'searchFltr', label: 'Filtros Extra (JSON)', placeholder: '{"activo":1}' },
            { key: 'searchCols', label: 'Columnas Extra (JSON)', placeholder: '["id", "nombre"]' },
            { key: 'searchOrdr', label: 'Orden (JSON)', placeholder: '[["id", "DESC"]]' },
            { key: 'searchLimt', label: 'Límite', placeholder: '25' },
        ],
        styleFields: [...TYPOGRAPHY_STYLES, ...COMMON_STYLES],
        styleLabelFields: TYPOGRAPHY_STYLES,
        styleValueFields: TYPOGRAPHY_STYLES,
    },
]

export default {
    components: {
        VistaDetalleLayout,
        FormatoDocument,
        EditorSidebarLeft,
        EditorSidebarRight,
    },
    data() {
        return {
            auth: useAuth(),
            vistas: useVistas(),
            system: useSystem(),
            selectedId: null,
            hoveredId: null,
            selectedElement: null,
            VIEW_CONFIG: {
                apiPath: 'formato_structures',
                pathKey: 'formato_structure_id',
                permisoEditar: 'vFormatoStructures:editar',
                permisoCrear: 'vFormatoStructures:crear',
                fullWidth: true,
            },
            ELEMENT_TYPES,
            STYLE_FIELDS_DEF,
            STYLE_SECTIONS_LABELS,
            PAPER_SIZES,
            ORIENTATIONS,
            TYPOGRAPHY_STYLES,
            activeSideTab: 'tree',
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
                inputLabel: true,
                inputValue: true,
            },
            history: [],
            historyIndex: -1,
            isUndoingRedoing: false,
            verInputs: false,
            formato_value: { values: {} },
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
    watch: {
        'vista.data': {
            handler() {
                this.debouncedSaveHistory()
            },
            deep: true,
        },
        'selectedElement.props.optionsKey': {
            handler(newKey) {
                if (newKey) {
                    clearTimeout(this._optionsTimer)
                    this._optionsTimer = setTimeout(() => {
                        this.system.load([newKey])
                    }, 1000)
                }
            },
            immediate: true,
        },
    },
    mounted() {
        window.addEventListener('keydown', this.handleGlobalKeyDown)
        // Initial snapshot after potential data load
        setTimeout(() => this.saveHistory(), 1000)
    },
    beforeUnmount() {
        window.removeEventListener('keydown', this.handleGlobalKeyDown)
    },
    methods: {
        runMethod(method, item) {
            this[method](item)
        },
        loadNewData() {
            this.vista.data = {
                codigo: '',
                nombre: '',
                tipo: 'REGISTRO',
                entity: '',
                config: {
                    paperSize: 'A4',
                    globals: {
                        h1: { fontSize: '12pt', fontWeight: 'bold', color: '#000000' },
                        h2: { fontSize: '11pt', fontWeight: 'bold', color: '#000000' },
                        h3: { fontSize: '10pt', fontWeight: 'bold', color: '#000000' },
                        p: { fontSize: '10pt', color: '#000000' },
                        small: { fontSize: '8pt', color: '#000000' },
                        inputLabel: { fontSize: '10pt', fontWeight: 'bold', color: '#000000' },
                        inputValue: { fontSize: '10pt', color: '#000000' },
                    },
                },
                structure: {
                    id: 'root',
                    type: 'document',
                    name: 'Documento',
                    props: {},
                    style: {},
                    children: [],
                },
            }

            this.handleSelect(this.vista.data.structure.id, this.vista.data.structure)
            this.addBlockToSelected('page')
            this.addHeader()
        },
        addHeader() {
            const page = this.vista.data.structure.children[0]
            if (!page) return

            this.handleSelect(page.id, page)

            // 1. Header Group
            const headerGroup = this.addBlockToSelected('group')
            headerGroup.name = 'Encabezado'
            Object.assign(headerGroup.style, {
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '20px',
            })

            this.handleSelect(headerGroup.id, headerGroup)

            // 1.1 Left (Logo)
            const headerLeft = this.addBlockToSelected('group')
            headerLeft.name = 'Logo'
            Object.assign(headerLeft.style, {
                display: 'flex',
                flexDirection: 'column',
                flex: '25%',
            })

            this.handleSelect(headerLeft.id, headerLeft)
            const logo = this.addBlockToSelected('image')
            logo.name = 'Logo'
            logo.props.src = this.auth.empresa?.logo?.url || ''
            logo.style.width = '100%'

            // 1.2 Center (Título)
            this.handleSelect(headerGroup.id, headerGroup)
            const headerCenter = this.addBlockToSelected('group')
            headerCenter.name = 'Título'
            Object.assign(headerCenter.style, {
                display: 'flex',
                flexDirection: 'column',
                flex: '50%',
                alignItems: 'center',
                textAlign: 'center',
                gap: '0.5rem',
            })

            this.handleSelect(headerCenter.id, headerCenter)
            const hTitle = this.addBlockToSelected('h1')
            hTitle.props.content = 'TITULO DEL FORMATO'
            hTitle.id = 'h_title'
            const hSubtitle = this.addBlockToSelected('p')
            hSubtitle.props.content = 'SUBTITULO'
            hSubtitle.id = 'h_subtitle'

            // 1.3 Right (Metadatos)
            this.handleSelect(headerGroup.id, headerGroup)
            const headerRight = this.addBlockToSelected('group')
            headerRight.name = 'Metadatos'
            Object.assign(headerRight.style, {
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
            })

            this.handleSelect(headerRight.id, headerRight)
            const hCod = this.addBlockToSelected('small')
            hCod.props.content = 'CÓDIGO: XX-YYY-ZZ'
            hCod.id = 'h_cod'
            const hVer = this.addBlockToSelected('small')
            hVer.props.content = 'VERSIÓN: 1.0'
            hVer.id = 'h_ver'
            const hFec = this.addBlockToSelected('small')
            hFec.props.content = 'FECHA: Ene-26'
            hFec.id = 'h_fec'
            const hAprov = this.addBlockToSelected('small')
            hAprov.props.content = 'APROBADO POR: GG'
            hAprov.id = 'h_aprov'

            this.handleSelect(page.id, page)

            // 2. Body Group
            const bodyGroup = this.addBlockToSelected('group')
            bodyGroup.name = 'Cuerpo'
            Object.assign(bodyGroup.style, {
                display: 'flex',
                flexDirection: 'row',
                gap: '20px',
            })

            this.handleSelect(bodyGroup.id, bodyGroup)
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

        //--- Header actions ---//
        async guardar() {
            if (this.checkDatos()) return

            this.auth.setLoading(true, 'Guardando...')
            let res
            if (this.is_nuevo) {
                res = await post(this.vista.apiUrl, this.vista.data)
            } else {
                res = await patch(this.vista.apiUrl, this.vista.data)
            }
            this.auth.setLoading(false)

            if (res.code != 0) return

            if (this.is_nuevo) {
                this.vista.data.id = res.data.id

                this.$router.replace({
                    name: this.$route.name,
                    params: { [this.vista.pathKey]: res.data.id },
                })

                this.vista.data = {
                    ...res.data,
                    transaccion_items: this.vista.data.transaccion_items,
                }
            }

            this.vista.mode = 'view'
        },

        //--- Methods --//
        checkDatos() {
            const props = ['nombre', 'codigo', 'structure']

            if (incompleteData(this.vista.data, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },

        //--- History ---//
        handleGlobalKeyDown(e) {
            if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable) {
                return
            }

            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (this.selectedId && this.selectedId !== 'root') {
                    e.preventDefault()
                    this.deleteBlock(this.selectedId)
                }
            }

            if (e.ctrlKey && e.key.toLowerCase() === 'z') {
                e.preventDefault()
                this.undo()
            }

            if (
                e.ctrlKey &&
                (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))
            ) {
                e.preventDefault()
                this.redo()
            }
        },
        saveHistory() {
            if (this.isUndoingRedoing || !this.vista.data?.structure) return

            const snapshot = JSON.stringify({
                structure: this.vista.data.structure,
                config: this.vista.data.config,
            })

            // Don't save if it's the same as the current top of history
            if (this.historyIndex >= 0 && this.history[this.historyIndex] === snapshot) return

            // If we have a redo branch, cut it
            this.history = this.history.slice(0, this.historyIndex + 1)
            this.history.push(snapshot)

            // Limit history to 50 steps
            if (this.history.length > 50) {
                this.history.shift()
            } else {
                this.historyIndex++
            }
        },
        debouncedSaveHistory() {
            clearTimeout(this._historyTimer)
            this._historyTimer = setTimeout(() => {
                this.saveHistory()
            }, 500)
        },
        undo() {
            if (this.historyIndex > 0) {
                this.isUndoingRedoing = true
                this.historyIndex--
                const state = JSON.parse(this.history[this.historyIndex])
                this.vista.data.structure = state.structure
                this.vista.data.config = state.config
                this.$nextTick(() => (this.isUndoingRedoing = false))
            }
        },
        redo() {
            if (this.historyIndex < this.history.length - 1) {
                this.isUndoingRedoing = true
                this.historyIndex++
                const state = JSON.parse(this.history[this.historyIndex])
                this.vista.data.structure = state.structure
                this.vista.data.config = state.config
                this.$nextTick(() => (this.isUndoingRedoing = false))
            }
        },

        //--- Logic to control panels ---//
        toggleSection(key) {
            this.collapsedSections[key] = !this.collapsedSections[key]
        },

        //--- Editor logic ---//
        handleSelect(id, element) {
            this.selectedId = id
            this.selectedElement = element
        },
        selectDocumentRoot() {
            if (!this.vista.data.structure) return
            this.selectedId = this.vista.data.structure.id
            this.selectedElement = this.vista.data.structure
        },
        handleSelectDirect({ id, element }) {
            this.selectedId = id
            this.selectedElement = element
        },
        addBlockToSelected(type) {
            if (type === 'page' && this.selectedElement?.type === 'page') {
                this.auth.setAlert('No se puede añadir una página dentro de otra página', 'error')
                return
            }
            const config = ELEMENT_TYPES.find((t) => t.type === type)
            if (!config) return

            const newBlock = {
                // id: type + '_' + Date.now().toString().slice(-6),
                id: crypto.randomUUID(),
                type: type,
                name: config.label,

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
            return newBlock
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
        handleMove(dragId, targetId, pos) {
            if (dragId === targetId) return

            let draggedItem = null
            const findAndRemove = (list) => {
                const idx = list.findIndex((it) => it.id === dragId)
                if (idx !== -1) {
                    draggedItem = list.splice(idx, 1)[0]
                    return true
                }
                for (const it of list) {
                    if (it.children && findAndRemove(it.children)) return true
                }
                return false
            }

            // Remove from current position
            findAndRemove(this.vista.data.structure.children)
            if (!draggedItem) return

            const insertAtTarget = (list) => {
                const idx = list.findIndex((it) => it.id === targetId)
                if (idx !== -1) {
                    const target = list[idx]

                    if (pos === 'inside' && target.children) {
                        target.children.push(draggedItem)
                    } else if (pos === 'before') {
                        list.splice(idx, 0, draggedItem)
                    } else {
                        // 'after' or fallback
                        list.splice(idx + 1, 0, draggedItem)
                    }
                    return true
                }
                for (const it of list) {
                    if (it.children && insertAtTarget(it.children)) return true
                }
                return false
            }

            insertAtTarget(this.vista.data.structure.children)
        },
        duplicateBlock(id) {
            let itemToClone = null
            const findItem = (list) => {
                for (const it of list) {
                    if (it.id === id) {
                        itemToClone = it
                        return true
                    }
                    if (it.children && findItem(it.children)) return true
                }
                return false
            }

            findItem(this.vista.data.structure.children)
            if (!itemToClone) return

            // Deep clone and generate new IDs
            const cloneWithNewIds = (obj) => {
                const newObj = JSON.parse(JSON.stringify(obj))
                const randomizeIds = (item) => {
                    item.id = crypto.randomUUID()
                    if (item.children) {
                        item.children.forEach(randomizeIds)
                    }
                }
                randomizeIds(newObj)
                return newObj
            }

            const cloned = cloneWithNewIds(itemToClone)

            // Insert after original
            const insertAfter = (list) => {
                const idx = list.findIndex((it) => it.id === id)
                if (idx !== -1) {
                    list.splice(idx + 1, 0, cloned)
                    return true
                }
                for (const it of list) {
                    if (it.children && insertAfter(it.children)) return true
                }
                return false
            }

            insertAfter(this.vista.data.structure.children)
        },
        toggleVerInputs() {
            this.verInputs = !this.verInputs
        },
    },
}
</script>

<style lang="scss" scoped>
.editor-layout {
    display: flex;
    height: calc(100vh - 250px);
    gap: 1rem;
    width: 100%;
}

.sidebar-padding {
    padding: 0.75rem;
    display: grid;
    gap: 0.75rem;
}

.text-tiny {
    font-size: 0.7rem;
    color: var(--text-color3);
    font-style: italic;
}
</style>
