<template>
    <VistaLayout :vista="vista">
        <JdTable :name="vista.name" :columns="vista.tableColumns" :datos="vista.tableData || []" />
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
        this.initFiltros()
        this.vista.loadTableData = this.loadTableData

        // 2. Carga inicial
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
        initFiltros() {
            if (!this.vista.tableColumns[0].val) {
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
                // page: this.vista.table_page,
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
    },
}
</script>
