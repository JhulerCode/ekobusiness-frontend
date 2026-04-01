<template>
    <VistaLayout
        :config="VIEW_CONFIG"
        :initFiltros="initFiltros"
        :setQuery="setQuery"
        :loadDataPers="loadTableData"
        @runMethod="runMethod"
    >
    </VistaLayout>
</template>

<script>
import VIEW_CONFIG from './stock.config.js'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls, get } from '@/utils/crud'
import dayjs from 'dayjs'
import { jmsg } from '@/utils/swal'

export default {
    name: 'vStock',
    components: {},
    computed: {
        auth: () => useAuth(),
        vistas: () => useVistas(),
        modals: () => useModals(),
        vista() {
            return this.vistas[VIEW_CONFIG.name]
        },
    },
    data: () => ({
        VIEW_CONFIG,
    }),
    methods: {
        runMethod(method, item) {
            this[method](item)
        },
        initFiltros() {
            if (!this.vista.tableColumns[0].val) {
                this.vista.tableColumns[0].op = 'Es igual o anterior a'
                this.vista.tableColumns[0].val = dayjs().format('YYYY-MM-DD')
            }
        },
        checkFiltros() {
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
                        incl: ['lote2'],
                    },
                },
                sqls: ['articulo_movimientos_cantidad'],
                fltr: {},
                grop: ['id'],
                ordr: [['nombre', 'ASC']],
                // page: this.vista.table_page,
            }

            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
        },
        async loadTableData(init_page) {
            if (this.checkFiltros()) return
            if (init_page) this.vista.table_page = 1
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
