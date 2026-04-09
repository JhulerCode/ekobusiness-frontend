<template>
    <VistaLayout
        :config="VIEW_CONFIG"
        :initFiltros="initFiltros"
        :setQuery="setQuery"
        :loadDataPers="loadTableData"
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
            return this.vistas[this.$route.name]
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
                incl: ['categoria1', 'kardexes_for_sqls'],
                iccl: {
                    kardexes: {
                        incl: ['lote2'],
                    },
                },
                sqls: ['articulo_stock', 'articulo_stock_valor'],
                fltr: {},
                grop: ['id'],
                ordr: [['nombre', 'ASC']],
                page: this.vista.table_page,
            }

            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
        },
        async loadTableData(init_page) {
            if (this.checkFiltros()) return
            if (init_page) this.vista.table_page = 1

            if (!this.vista.dwal) this.vista.tableData = []
            this.setQuery()

            if (this.vista.dwal == true) this.vista.qry.dwal = true

            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.kardex}/inventario?qry=${JSON.stringify(this.vista.qry)}`)
            this.auth.setLoading(false)

            this.vista.last_path = this.$route.fullPath
            if (res.code === 0) {
                if (this.vista.dwal == true) {
                    this.vista.dwal = false
                    this.vista.qry.dwal = false
                    this.vista.all_data_res = res
                    return
                }

                this.vista.tableData = res.data
                this.vista.table_meta = res.meta
            }
        },
    },
}
</script>
