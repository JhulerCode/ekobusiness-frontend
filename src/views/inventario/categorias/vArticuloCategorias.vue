<template>
    <VistaLayout :vista="vista">
        <JdTable
            :name="vista.name"
            :columns="vista.tableColumns"
            :datos="vista.tableData || []"
            :colAct="true"
            :rowOptions="vista.tableRowActions"
            @rowOptionSelected="vista.runMethod"
        />
    </VistaLayout>

    <!-- Modales -->
    <mArticuloCategoria v-if="modals.show.mArticuloCategoria" />
    <mUploadFiles v-if="modals.show.mUploadFiles" />
</template>

<script>
// Componentes base y utilidades
import VistaLayout from '@/components/VistaLayout/VistaLayout.vue'
import JdTable from '@/components/JdTable/JdTable.vue'

// Modales específicos
import mArticuloCategoria from '@/views/inventario/categorias/mArticuloCategoria.vue'
import mUploadFiles from '@/components/mUploadFiles.vue'

// Configuración de la vista
import VIEW_CONFIG from './articuloCategorias.config.js'

// Pinia y Utils
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls, get } from '@/utils/crud'

export default {
    name: 'vArticuloCategorias',
    components: {
        VistaLayout,
        JdTable,
        mArticuloCategoria,
        mUploadFiles,
    },
    computed: {
        auth: () => useAuth(),
        vistas: () => useVistas(),
        modals: () => useModals(),
        vista() {
            return this.vistas[VIEW_CONFIG.name]
        },
    },
    created() {
        // 1. Inicialización de la vista
        this.vistas.initVista(VIEW_CONFIG.name, {
            ...JSON.parse(JSON.stringify(VIEW_CONFIG)),
            apiUrl: urls[VIEW_CONFIG.apiPath],
            runMethod: this.runMethod,
        })

        // 2. Carga inicial
        this.auth.setColumns(this.vista.name, this.vista.tableColumns)
        if (!this.vista.loaded && this.auth.verifyPermiso(`${VIEW_CONFIG.name}:listar`)) {
            this.vista.loadTableData()
        }
    },
    unmounted() {
        if (this.vista) this.vista.runMethod = null
    },
    methods: {
        runMethod(method, item) {
            this.vistas.runMethod(this, method, item)
        },
        setQuery() {
            this.vista.qry = {
                fltr: {},
                ordr: [['nombre', 'ASC']],
                page: this.vista.table_page,
            }
            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
            if (!this.vista.qry.cols) this.vista.qry.cols = []
            this.vista.qry.cols.push('fotos')
        },

        // Header actions
        nuevo() {
            const send = { articulo_categoria: { activo: true } }
            this.modals.setModal('mArticuloCategoria', 'Nueva categoría', 1, send, true)
        },

        // Table row actions
        async editar(item) {
            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${item.id}`)
            this.auth.setLoading(false)
            if (res.code != 0) return
            const send = {
                articulo_categoria: res.data,
            }
            this.modals.setModal('mArticuloCategoria', 'Editar categoría', 2, send, true)
        },
        openUploadFiles(item) {
            const send = {
                item: { id: item.id, nombre: item.nombre, archivos: item.fotos || [] },
                accept: 'image/*',
                cantidad: 2,
                url: `${this.vista.apiUrl}/fotos`,
                vista: this.vista.name,
                tabla: 'tableData',
                prop: 'fotos',
            }
            this.modals.setModal('mUploadFiles', 'Actualizar fotos', 2, send, true)
        },
    },
}
</script>