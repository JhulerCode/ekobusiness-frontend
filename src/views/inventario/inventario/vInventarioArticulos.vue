<template>
    <VistaLayout :vista="vista">
        <JdTable
            :name="vista.name"
            :columns="vista.tableColumns"
            :datos="vista.tableData || []"
            :colAct="false"
        />
    </VistaLayout>
</template>

<script>
// Componentes base y utilidades
import VistaLayout from '@/components/VistaLayout/VistaLayout.vue'
import JdTable from '@/components/JdTable/JdTable.vue'

// Configuración de la vista
import VIEW_CONFIG from './inventario.config.js'

// Pinia y Utils
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls, get } from '@/utils/crud'
import dayjs from 'dayjs'
import { jmsg } from '@/utils/swal'

export default {
    name: 'vInventarioArticulos',
    components: {
        VistaLayout,
        JdTable,
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

        // 2. Override de métodos de carga
        this.vista.loadTableData = this.loadTableData
        this.vista.openConfigFiltros = this.openConfigFiltros

        // 3. Carga inicial
        this.initFiltros()
        this.auth.setColumns(this.vista.name, this.vista.tableColumns)

        if (!this.vista.loaded) {
            this.loadTableData()
        }
    },
    unmounted() {
        if (this.vista) this.vista.runMethod = null
    },
    methods: {
        runMethod(method, item) {
            this.vistas.runMethod(this, method, item)
        },
        initFiltros() {
            if (this.vista.tableColumns && this.vista.tableColumns.length > 0) {
                this.vista.tableColumns[0].op = 'Es igual o anterior a'
                this.vista.tableColumns[0].val = dayjs().format('YYYY-MM-DD')
            }
        },
        checkDatos() {
            if (!this.vista.tableColumns[0].val) {
                jmsg('error', 'Ingrese la fecha límite')
                return true
            }
            return false
        },
        setQuery() {
            this.vista.qry = {
                incl: ['categoria1', 'kardexes'],
                iccl: {
                    kardexes: {
                        incl: ['lote_padre2'],
                    },
                },
                sqls: ['articulo_movimientos_cantidad', 'articulo_movimientos_valorizado'],
                fltr: {},
                grop: ['id'],
                ordr: [['nombre', 'ASC']],
                page: this.vista.table_page,
            }

            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
        },
        async loadTableData(init_page) {
            if (init_page) this.vista.table_page = 1
            if (this.checkDatos()) return

            this.setQuery()

            this.vista.tableData = []
            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.kardex}/inventario?qry=${JSON.stringify(this.vista.qry)}`)
            this.auth.setLoading(false)
            this.vista.loaded = true

            if (res.code === 0) {
                this.vista.tableData = res.data
                this.vista.table_meta = res.meta
            }
        },

        async openConfigFiltros() {
            await this.loadDatosSistema()

            const cols = this.vista.tableColumns
            for (const a of cols) {
                if (a.id == 'categoria') a.reload = this.loadCategorias
                if (a.id == 'purchase_ok') a.lista = this.vista.estados
                if (a.id == 'sale_ok') a.lista = this.vista.estados
                if (a.id == 'produce_ok') a.lista = this.vista.estados
            }

            const send = {
                table: this.vista.name,
                cols,
                reload: this.loadTableData,
            }

            this.modals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },
        async loadDatosSistema() {
            const qry = ['igv_afectaciones', 'unidades', 'estados', 'articulo_tipos']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.vista, res.data)
        },
        async loadCategorias() {
            const qry = {
                cols: ['nombre'],
                fltr: {
                    tipo: { op: 'Es', val: 1 },
                    activo: { op: 'Es', val: true },
                },
                ordr: [['nombre', 'ASC']],
            }

            this.vista.articulo_categorias = []
            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulo_categorias}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)

            if (res.code != 0) return

            this.vista.articulo_categorias = res.data
            return res.data
        },
    },
}
</script>
