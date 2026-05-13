<template>
    <JdModal
        modal="mFormatoStructure"
        :buttons="buttons"
        @button-click="(action) => actions[action]()"
    >
        <div class="modal-layout">
            <!-- LEFT SIDEBAR: Structure & Toolbox -->
            <div class="editor-side left">
                <div class="editor-header primary">
                    <strong>Componentes</strong>
                </div>
                <div class="sidebar-padding">
                    <div class="toolbox-mini">
                        <button @click="addBlockToSelected('group')">
                            <i class="fas fa-layer-group"></i> Grupo
                        </button>
                        <button @click="addBlockToSelected('field')">
                            <i class="fas fa-keyboard"></i> Campo
                        </button>
                        <button @click="addBlockToSelected('p')">
                            <i class="fas fa-paragraph"></i> Párrafo
                        </button>
                        <button @click="addBlockToSelected('h1')">
                            <i class="fas fa-heading"></i> H1
                        </button>
                        <button @click="addBlockToSelected('image')">
                            <i class="fas fa-image"></i> Imagen
                        </button>
                    </div>
                </div>

                <div class="editor-header">
                    <strong>Estructura / Esquema</strong>
                </div>
                <div class="sidebar-content scroll-tiny">
                    <div class="tree-container">
                        <TreeItem
                            v-if="modal.estructura.structure"
                            :item="modal.estructura.structure"
                            :selectedId="selectedId"
                            :hoveredId="hoveredId"
                            @select="handleSelect"
                            @hover="(id) => (hoveredId = id)"
                            @delete="deleteBlock"
                        />
                    </div>
                </div>
            </div>

            <!-- MAIN RENDERER -->
            <div class="renderer-side">
                <FormatoDocument
                    ref="documentRef"
                    :estructura="modal.estructura"
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
            <!-- RIGHT SIDEBAR: General & Properties -->
            <div class="editor-side right">
                <div class="sidebar-content scroll-tiny">
                    <!-- ELEMENT PROPERTIES (Visible only if selected) -->
                    <div v-if="selectedId && selectedElement" class="properties-box">
                        <div class="editor-header primary">
                            <strong>Propiedades: {{ selectedElement.type }}</strong>
                            <i
                                class="fas fa-times-circle close-btn"
                                @click="selectedId = null; selectedElement = null"
                            ></i>
                        </div>
                        <div class="sidebar-padding">
                            <!-- PROPS -->
                            <template v-if="selectedElement.type === 'group'">
                                <JdInput v-model="selectedElement.name" label="Nombre/Etiqueta" />
                                <div class="editor-header sub-header mini"><strong>Layout (Flex)</strong></div>
                                <JdSelect v-model="selectedElement.props.direction" label="Dirección" :lista="[{id:'column',nombre:'Vertical'},{id:'row',nombre:'Horizontal'}]" />
                                <JdInput v-model="selectedElement.props.gap" label="Gap" />
                            </template>

                            <template v-else-if="selectedElement.type === 'field'">
                                <JdSelect v-model="selectedElement.props.fieldId" label="Campo" :lista="fieldList" />
                            </template>

                            <template v-else-if="['p', 'h1', 'h2', 'text'].includes(selectedElement.type)">
                                <JdInput v-model="selectedElement.props.content" label="Contenido" textarea />
                            </template>

                            <!-- STYLES -->
                            <div class="editor-header sub-header"><strong>Estilos</strong></div>
                            <div class="sidebar-padding" style="padding:0">
                                <JdInput v-model="selectedElement.style.margin" label="Margin" />
                                <JdInput v-model="selectedElement.style.padding" label="Padding" />
                                <JdInput v-model="selectedElement.style.fontSize" label="Tamaño Letra" />
                                <JdInput v-model="selectedElement.style.color" label="Color" />
                            </div>
                        </div>
                    </div>

                    <!-- GENERAL METADATA (Always visible at bottom or if nothing selected) -->
                    <div class="metadata-box">
                        <div class="editor-header" :class="{ 'primary': !selectedId }">
                            <strong>Metadatos del Formato</strong>
                        </div>
                        <div class="sidebar-padding">
                            <JdInput v-model="modal.estructura.codigo" label="Código" required />
                            <JdInput v-model="modal.estructura.nombre" label="Nombre" required />
                            <JdSelect
                                v-model="modal.estructura.tipo"
                                label="Tipo"
                                :lista="[{ id: 'REGISTRO', nombre: 'Registro' }, { id: 'FORMATO', nombre: 'Formato' }]"
                            />
                            <div class="sub-section-title">
                                <span>Listas Globales</span>
                                <i class="fas fa-plus-circle add-btn" @click="addSystemList"></i>
                            </div>
                            <div v-for="(list, idx) in modal.estructura.system_lists" :key="idx" class="field-card">
                                <div class="card-header">
                                    <strong>{{ list.nombre || 'Lista' }}</strong>
                                    <i class="fas fa-trash delete-btn" @click="removeSystemList(idx)"></i>
                                </div>
                                <div class="card-body">
                                    <JdInput v-model="list.nombre" label="Nombre" />
                                    <JdInput v-model="list.query" label="Query" textarea />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </JdModal>
</template>

<script setup>
import { ref, reactive, computed, onMounted, inject } from 'vue'
import TreeItem from '@/components/formatos/TreeItem.vue'
import FormatoDocument from '@/components/formatos/FormatoDocument.vue'
import JdModal from '@/components/modals/JdModal.vue'
import JdInput from '@/components/inputs/JdInput.vue'
import JdSelect from '@/components/inputs/JdSelect.vue'
import JdTextArea from '@/components/inputs/JdTextArea.vue'
import { useAuthStore } from '@/pinia/auth'

const useAuth = useAuthStore()
const auth = useAuth
const modal = inject('modal')

// Editor State
const selectedId = ref(null)
const hoveredId = ref(null)
const selectedElement = ref(null)
const documentRef = ref(null)

const stylePanels = reactive({
    spacing: false,
    typography: false,
})

const toggleStylePanel = (panel) => {
    stylePanels[panel] = !stylePanels[panel]
}

const fieldList = computed(() => {
    return (modal.estructura.fields || []).map((f) => ({
        id: f.id,
        nombre: `${f.label} (${f.id})`,
    }))
})

// ACTIONS
const actions = {
    grabar: async () => {
        if (!checkDatos()) return
        modal.runMethod('grabar', modal.estructura)
    },
    modificar: async () => {
        if (!checkDatos()) return
        modal.runMethod('modificar', modal.estructura)
    },
    cerrar: () => modal.cerrar(),
}

const buttons = computed(() => {
    if (modal.mode === 1) return ['grabar', 'cerrar']
    return ['modificar', 'cerrar']
})

const checkDatos = () => {
    if (!modal.estructura.nombre || !modal.estructura.codigo) {
        alert('Nombre y Código son requeridos')
        return false
    }
    return true
}

// BLOCK MANAGEMENT
const handleSelect = (id, element) => {
    selectedId.value = id
    selectedElement.value = element
}

const handleSelectDirect = ({ id, element }) => {
    selectedId.value = id
    selectedElement.value = element
}

const addBlockToSelected = (type) => {
    const newBlock = {
        id: type + '_' + Date.now().toString().slice(-6),
        type: type,
        name: 'Nuevo ' + type,
        style: { margin: '0', padding: '0' },
        classList: [],
        visible: true,
        props: {},
        children: [],
    }

    // Initialize defaults
    if (type === 'group') {
        newBlock.props = { direction: 'column', justify: 'flex-start', align: 'stretch', gap: '0' }
    }
    if (['p', 'h1', 'h2', 'text'].includes(type)) newBlock.props.content = 'Nuevo contenido...'
    if (type === 'field') newBlock.props.fieldId = ''

    if (selectedId.value && selectedElement.value && selectedElement.value.children) {
        selectedElement.value.children.push(newBlock)
    } else {
        modal.estructura.structure.children.push(newBlock)
    }
}

const deleteBlock = (id) => {
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
    removeRecursive(modal.estructura.structure.children)
    if (selectedId.value === id) {
        selectedId.value = null
        selectedElement.value = null
    }
}

// SYSTEM LISTS
const addSystemList = () => {
    if (!modal.estructura.system_lists) modal.estructura.system_lists = []
    modal.estructura.system_lists.push({ nombre: '', query: '' })
}
const removeSystemList = (idx) => {
    modal.estructura.system_lists.splice(idx, 1)
}

// INITIALIZATION
const initEstructura = () => {
    if (!modal.estructura) modal.estructura = {}
    if (!modal.estructura.system_lists) modal.estructura.system_lists = []
    if (!modal.estructura.fields) modal.estructura.fields = []

    if (!modal.estructura.structure) {
        modal.estructura.structure = {
            id: 'root',
            type: 'page',
            name: 'Página Principal',
            style: { minHeight: '11in', backgroundColor: '#ffffff', padding: '0.5in' },
            children: [
                {
                    id: 'header_group',
                    type: 'group',
                    name: 'Encabezado',
                    style: { marginBottom: '2rem', borderBottom: '1px solid #eee' },
                    props: { direction: 'row', justify: 'space-between', align: 'center', gap: '20px' },
                    children: [
                        {
                            id: 'header_left',
                            type: 'group',
                            name: 'Logo',
                            props: { direction: 'column', width: 0.25 },
                            children: [{ id: 'logo_img', type: 'image', name: 'Logo', props: { src: auth.empresa?.logo?.url }, style: { maxWidth: '150px' } }],
                        },
                        {
                            id: 'header_center',
                            type: 'group',
                            name: 'Título',
                            style: { textAlign: 'center' },
                            props: { direction: 'column', width: 0.5, align: 'center' },
                            children: [
                                { id: 'h_title', type: 'h1', props: { content: 'TÍTULO DEL FORMATO' }, style: { fontSize: '1.2rem' } },
                                { id: 'h_subtitle', type: 'p', props: { content: 'Subtítulo o código' }, style: { fontSize: '0.8rem', color: '#666' } }
                            ],
                        },
                        {
                            id: 'header_right',
                            type: 'group',
                            name: 'Metadatos',
                            style: { border: '1px solid #dfdfdf', borderRadius: '15px', padding: '8px 15px' },
                            props: { direction: 'column', width: 0.25, align: 'center', justify: 'center' },
                            children: [
                                { id: 'h_cod', type: 'p', props: { content: 'CÓDIGO: RE-BPM-24' }, style: { fontSize: '0.7rem', fontWeight: 'bold' } },
                                { id: 'h_ver', type: 'p', props: { content: 'VERSIÓN: 1.0' }, style: { fontSize: '0.7rem', fontWeight: 'bold' } }
                            ]
                        }
                    ]
                },
                { id: 'main_content', type: 'group', name: 'Contenido Principal', props: { direction: 'column', gap: '1rem' }, children: [] }
            ]
        }
    }
}

onMounted(() => {
    initEstructura()
})
</script>

<style lang="scss" scoped>
.modal-layout {
    display: flex;
    background-color: var(--bg-color2);
    height: 85vh;
}

.editor-side {
    width: 22rem;
    background-color: var(--bg-color);
    display: flex;
    flex-direction: column;
    
    &.left { border-right: var(--border); }
    &.right { border-left: var(--border); }
}

.sidebar-content {
    flex: 1;
    overflow-y: auto;
    background-color: var(--bg-color);
}

.sidebar-padding {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.editor-header {
    padding: 0.6rem 1rem;
    background-color: var(--bg-color2);
    border-bottom: var(--border);
    border-top: var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;

    strong {
        font-size: 0.7rem;
        text-transform: uppercase;
        color: var(--text-color2);
    }

    &.primary {
        background-color: var(--primary-color);
        strong { color: white; }
        .close-btn { color: white; cursor: pointer; }
    }
    
    &.mini {
        padding: 0.4rem 1rem;
        background: var(--bg-color2);
        opacity: 0.8;
    }
}

.toolbox-mini {
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
        i { color: var(--primary-color); }
        &:hover { border-color: var(--primary-color); background: var(--bg-color-hover); }
    }
}

.tree-container {
    padding: 0.5rem;
}

.renderer-side {
    flex: 1;
    overflow-y: auto;
    padding: 2rem;
    background-color: #333;
    display: flex;
    justify-content: center;
}

.field-card {
    border: var(--border);
    border-radius: 0.25rem;
    margin-bottom: 0.5rem;
    .card-header {
        padding: 0.4rem 0.6rem;
        display: flex;
        justify-content: space-between;
        font-size: 0.75rem;
        color: var(--text-color);
        cursor: pointer;
        &:hover { background: var(--bg-color-hover); }
    }
    .card-body {
        padding: 0.6rem;
        border-top: var(--border);
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
}

.sub-section-title {
    font-size: 0.75rem;
    font-weight: bold;
    color: var(--text-color);
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
    .add-btn { color: var(--primary-color); cursor: pointer; }
}

.list-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
}

.delete-btn { color: var(--rojo); cursor: pointer; }

.properties-box, .metadata-box {
    display: flex;
    flex-direction: column;
    height: 100%;
}
</style>
