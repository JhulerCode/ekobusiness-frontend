<template>
    <VistaDetalleLayout
        v-if="vista"
        :config="VIEW_CONFIG"
        :loadNewData="loadNewData"
        :loadExistingData="loadExistingData"
        @runMethod="runMethod"
    >
        <template #principal-datos>
            <JdInput
                v-model="vista.data.codigo"
                label="Código"
                :nec="true"
                :disabled="vista.mode !== 'edit'"
            />
            <JdInput
                v-model="vista.data.nombre"
                label="Nombre"
                :nec="true"
                :disabled="vista.mode !== 'edit'"
                style="grid-column: 2/4"
            />
            <div style="display: flex; gap: 0.25rem">
                <!-- <JdButton tipo="2" text="nuevo" @click="loadNewData" /> -->
                <JdButton
                    tipo="2"
                    :text="verInputs ? 'ver final' : 'ver inputs'"
                    @click="toggleVerInputs"
                    v-if="vista.mode == 'edit'"
                />
            </div>
        </template>

        <div class="editor-layout">
            <!-- LEFT SIDEBAR: Structure & Toolbox -->
            <EditorSidebarLeft
                v-model:activeTab="activeSideTab"
                :orderElementTypes="ORDER_ELEMENT_TYPES"
                :elementTypes="ELEMENT_TYPES"
                :structure="vista.data.structure"
                :selectedId="selectedId"
                :hoveredId="hoveredId"
                :vista="vista"
                @addBlock="addBlockToSelected"
                @addPattern="addPattern"
                @select="handleSelect"
                @hover="(id) => (hoveredId = id)"
                @delete="deleteBlock"
                @duplicate="duplicateBlock"
                @move="handleMove"
                v-if="vista.mode == 'edit'"
            />

            <!-- MAIN RENDERER -->
            <FormatoRenderer
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
                v-if="vista.mode == 'edit'"
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
import FormatoRenderer from '@/components/formatos/FormatoRenderer.vue'
import EditorSidebarLeft from './EditorSidebarLeft.vue'
import EditorSidebarRight from './EditorSidebarRight.vue'
import {
    FLEX_DIRECTIONS,
    JUSTIFY_OPTIONS,
    ALIGN_OPTIONS,
    BORDER_STYLE_OPTIONS,
    PAPER_SIZES,
    ORIENTATIONS,
    STYLE_SECTIONS_LABELS,
    TYPOGRAPHY_STYLES,
    ORDER_ELEMENT_TYPES,
    ELEMENT_TYPES,
    TEXT_ALIGN_OPTIONS,
} from './constants'

const STYLE_FIELDS_DEF = {
    // Layout
    flexDirection: { label: 'Dirección', type: 'select', list: FLEX_DIRECTIONS, section: 'layout' },
    justifyContent: {
        label: 'Distribución',
        type: 'select',
        list: JUSTIFY_OPTIONS,
        section: 'layout',
    },
    alignItems: { label: 'Alineación', type: 'select', list: ALIGN_OPTIONS, section: 'layout' },
    justifyItems: {
        label: 'Alineación Items (Grid)',
        type: 'select',
        list: ALIGN_OPTIONS,
        section: 'layout',
    },
    gridTemplateColumns: {
        label: 'Columnas (Grid)',
        placeholder: '1fr 1fr',
        section: 'layout',
    },
    gridTemplateRows: {
        label: 'Filas (Grid)',
        placeholder: 'auto',
        section: 'layout',
    },
    gap: { label: 'Gap', section: 'layout' },
    flex: { label: 'Flex (Ancho)', section: 'layout' },
    gridColumn: { label: 'Columnas Span', section: 'layout' },
    gridRow: { label: 'Filas Span', section: 'layout' },

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
    backgroundColor: { label: 'Color Fondo', type: 'color', section: 'border' },
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

export default {
    components: {
        VistaDetalleLayout,
        FormatoRenderer,
        EditorSidebarLeft,
        EditorSidebarRight,
    },
    provide() {
        return {
            ELEMENT_TYPES,
        }
    },
    data() {
        return {
            auth: useAuth(),
            vistas: useVistas(),
            system: useSystem(),
            VIEW_CONFIG: {
                apiPath: 'formato_structures',
                pathKey: 'formato_structure_id',
                titleKey: 'codigo',
                permisoEditar: 'vFormatoStructures:editar',
                permisoCrear: 'vFormatoStructures:crear',
                fullWidth: true,
                headerActions: [
                    {
                        text: 'Registros',
                        icon: 'fa-regular fa-file',
                        tipo: '2',
                        action: 'verRegistros',
                        permiso: 'vFormatoValues:listar',
                        ocultar: { id: 'nuevo' },
                    },
                ],
            },
            selectedId: null,
            hoveredId: null,
            selectedElement: null,
            ORDER_ELEMENT_TYPES,
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
                props: false,
                layout: true,
                box: true,
                border: true,
                typography: true,
                settings: true,
                visibility: true,
                inputLabel: true,
                inputValue: true,
                doc_general: false,
                comp_general: false,
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
        is_nuevo() {
            return this.$route.params[this.vista.pathKey] === 'nuevo'
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
                    orientation: 'portrait',
                    paddingTop: '0.5in',
                    paddingRight: '0.5in',
                    paddingBottom: '0.5in',
                    paddingLeft: '0.5in',
                    backgroundColor: '#ffffff',
                    globals: {
                        group: {
                            props: {},
                            styles: {
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-start',
                                alignItems: 'stretch',
                            },
                        },
                        grid: {
                            props: {},
                            styles: {
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1rem',
                            },
                        },
                        h1: {
                            props: { content: 'Título 1' },
                            styles: { fontSize: '12pt', fontWeight: 'bold', color: '#000000' },
                        },
                        h2: {
                            props: { content: 'Título 2' },
                            styles: { fontSize: '11pt', fontWeight: 'bold', color: '#000000' },
                        },
                        h3: {
                            props: { content: 'Título 3' },
                            styles: { fontSize: '10pt', fontWeight: 'bold', color: '#000000' },
                        },
                        p: {
                            props: { content: 'Nuevo contenido...' },
                            styles: { fontSize: '10pt', color: '#000000' },
                        },
                        small: {
                            props: { content: 'Nota al pie...' },
                            styles: { fontSize: '8pt', color: '#000000' },
                        },
                        image: {
                            props: { src: '' },
                            styles: { width: '100%' },
                        },
                        input_text: {
                            props: { fieldId: '', label: 'Texto' },
                            styles: { margin: '0', padding: '0' },
                        },
                        input_number: {
                            props: { fieldId: '', label: 'Número' },
                            styles: { margin: '0', padding: '0' },
                        },
                        input_date: {
                            props: { fieldId: '', label: 'Fecha' },
                            styles: { margin: '0', padding: '0' },
                        },
                        input_time: {
                            props: { fieldId: '', label: 'Hora' },
                            styles: { margin: '0', padding: '0' },
                        },
                        input_longtext: {
                            props: { fieldId: '', label: 'Observaciones' },
                            styles: { margin: '0', padding: '0' },
                        },
                        input_select: {
                            props: { fieldId: '', label: 'Opción' },
                            styles: { margin: '0', padding: '0' },
                        },
                        input_ref: {
                            props: { fieldId: '', label: 'Referencia' },
                            styles: { margin: '0', padding: '0' },
                        },
                        inputLabel: {
                            props: {},
                            styles: { fontSize: '10pt', fontWeight: 'bold', color: '#000000' },
                        },
                        inputValue: { props: {}, styles: { fontSize: '10pt', color: '#000000' } },
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

            // this.handleSelect(this.vista.data.structure.id, this.vista.data.structure)
            // const firstGroup = this.addBlockToSelected('group')
            // if (firstGroup) {
            //     this.handleSelect(firstGroup.id, firstGroup)
            // }
            // this.addHeader()
        },
        async loadExistingData() {
            this.auth.setLoading(true, 'Cargando formato...')
            const res = await get(
                `${this.vista.apiUrl}/uno/${this.$route.params.formato_structure_id}`,
            )
            this.auth.setLoading(false)

            if (res.code === 0 && res.data) {
                this.vista.data = res.data
            } else {
                this.auth.goBack(this.$router)
            }
        },

        //--- Header actions ---//
        async guardar() {
            if (this.checkDatos()) return

            this.handleSelect(null, null)
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
        verRegistros() {
            this.$router.push({ name: 'vFormatoStructureValues' })
        },

        //--- Methods --//
        checkDatos() {
            const props = ['nombre', 'codigo', 'structure']

            if (incompleteData(this.vista.data, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            // Validar que los IDs de los campos sean únicos
            const fieldIds = new Set()
            const duplicates = []

            const findDuplicates = (block) => {
                if (block.props?.fieldId) {
                    if (fieldIds.has(block.props.fieldId)) {
                        duplicates.push(block.props.fieldId)
                    } else {
                        fieldIds.add(block.props.fieldId)
                    }
                }
                if (block.children) {
                    block.children.forEach(findDuplicates)
                }
            }

            if (this.vista.data.structure) {
                findDuplicates(this.vista.data.structure)
            }

            if (duplicates.length > 0) {
                jmsg(
                    'warning',
                    `Hay IDs de campos duplicados: ${[...new Set(duplicates)].join(', ')}`,
                )
                return true
            }

            return false
        },
        toggleSection(key) {
            this.collapsedSections[key] = !this.collapsedSections[key]
        },
        addHeader() {
            const documentRoot = this.vista.data.structure
            if (!documentRoot || documentRoot.children.length === 0) return
            const firstGroup = documentRoot.children[0]

            this.handleSelect(firstGroup.id, firstGroup)

            // 1. Header Group
            const headerGroup = this.addBlockToSelected('grid')
            headerGroup.name = 'Encabezado'
            Object.assign(headerGroup.style, {
                display: 'grid',
                gridTemplateColumns: '1fr 2fr 1fr',
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

            this.handleSelect(firstGroup.id, firstGroup)

            // 2. Body Group
            const bodyGroup = this.addBlockToSelected('group')
            bodyGroup.name = 'Cuerpo'
            Object.assign(bodyGroup.style, {
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
            })

            this.handleSelect(bodyGroup.id, bodyGroup)
        },

        //--- History ---//
        handleGlobalKeyDown(e) {
            if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable) {
                return
            }

            if ((e.key === 'Delete' || e.key === 'Backspace') && this.vista.mode === 'edit') {
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
        addPattern(pattern) {
            const createRecursive = (node) => {
                // 1. Añadir el bloque base usando la lógica estándar (valida padres, aplica globals, genera UUID)
                const newBlock = this.addBlockToSelected(node.type)
                if (!newBlock) return null

                // 2. Sobrescribir con valores específicos del patrón si existen
                if (node.name) newBlock.name = node.name
                if (node.style) Object.assign(newBlock.style, node.style)
                if (node.props) Object.assign(newBlock.props, node.props)

                // Ensure input elements always get a unique fieldId, even from patterns
                if (newBlock.type.startsWith('input_')) {
                    newBlock.props.fieldId = crypto.randomUUID()
                }

                // 3. Crear hijos recursivamente
                if (node.children && node.children.length > 0) {
                    for (const childNode of node.children) {
                        // IMPORTANTE: Asegurar que el padre esté seleccionado antes de añadir cada hijo directo
                        this.handleSelect(newBlock.id, newBlock)
                        createRecursive(childNode)
                    }
                }

                return newBlock
            }

            createRecursive(pattern)

            // Restaurar selección original (opcional, o dejar el último elemento creado seleccionado)
            // this.handleSelect(originalSelection.id, originalSelection.element)
        },
        addBlockToSelected(type) {
            const config = ELEMENT_TYPES.find((t) => t.type === type)
            if (!config) return

            const targetElement = this.selectedElement
            const parentType = targetElement?.type || 'document'

            if (config.allowedParents && !config.allowedParents.includes(parentType)) {
                const parentConfig = ELEMENT_TYPES.find((t) => t.type === parentType)
                const parentLabel = parentConfig
                    ? parentConfig.label
                    : parentType === 'document'
                      ? 'Documento'
                      : parentType

                jmsg('warning', `No se puede añadir "${config.label}" dentro de "${parentLabel}"`)
                return
            }

            const defaults = this.vista.data.config.globals[type] || {}

            const newBlock = {
                id: crypto.randomUUID(),
                type: type,
                name: config.label,

                props: defaults.props ? { ...defaults.props } : {},
                style: defaults.styles ? { ...defaults.styles } : {},
                settings: {},
                actions: {},
                bindings: {},
                animations: {},
                visibility: { condition: '' },

                children: [],
            }

            // Auto-generate unique fieldId for input elements
            if (type.startsWith('input_')) {
                newBlock.props.fieldId = crypto.randomUUID()
            }

            if (targetElement && targetElement.children) {
                targetElement.children.push(newBlock)
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

            // 1. Encontrar el elemento que se va a mover para validar su tipo
            let draggedItemType = null
            let draggedItemLabel = ''
            const findType = (list) => {
                for (const it of list) {
                    if (it.id === dragId) {
                        draggedItemType = it.type
                        const cfg = ELEMENT_TYPES.find((t) => t.type === it.type)
                        draggedItemLabel = cfg ? cfg.label : it.type
                        return true
                    }
                    if (it.children && findType(it.children)) return true
                }
                return false
            }
            findType([this.vista.data.structure])
            if (!draggedItemType) return

            // 2. Encontrar el tipo del nuevo padre
            let newParentType = 'document'
            const findParentType = (list, pType = 'document') => {
                for (const it of list) {
                    if (it.id === targetId) {
                        newParentType = pos === 'inside' ? it.type : pType
                        return true
                    }
                    if (it.children && findParentType(it.children, it.type)) return true
                }
                return false
            }
            findParentType(this.vista.data.structure.children)

            // 3. Validar si el movimiento es permitido
            const config = ELEMENT_TYPES.find((t) => t.type === draggedItemType)
            if (config && config.allowedParents && !config.allowedParents.includes(newParentType)) {
                const parentConfig = ELEMENT_TYPES.find((t) => t.type === newParentType)
                const parentLabel = parentConfig
                    ? parentConfig.label
                    : newParentType === 'document'
                      ? 'Documento'
                      : newParentType

                jmsg(
                    'warning',
                    `No se puede mover "${draggedItemLabel}" dentro de "${parentLabel}"`,
                )
                return
            }

            // 4. Proceder con el movimiento
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
                    // Regenerate fieldId for input elements to avoid duplicates
                    if (item.type?.startsWith('input_') && item.props) {
                        item.props.fieldId = crypto.randomUUID()
                    }
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
