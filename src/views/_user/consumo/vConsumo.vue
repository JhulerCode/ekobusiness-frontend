<template>
    <VistaLayout
        :config="VIEW_CONFIG"
        :initFiltros="initFiltros"
        :loadDataPers="loadTableData"
        :showBuscadorSimple="true"
        :showBuscador="false"
        :showPaginacion="false"
        :showConfigCols="false"
    >
        <template #header-right>
            <JdSelect
                v-model="column_fecha.val"
                :lista="anios"
                @elegir="setYear"
                style="width: 10rem"
                v-if="column_fecha"
            />

            <JdButton
                title="Recargar"
                icon="fa-solid fa-rotate"
                tipo="2"
                @click="loadTableData"
                v-if="auth.verifyPermiso('vConsumo:listar')"
            />
        </template>
    </VistaLayout>
</template>

<script>
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
        anios() {
            const currentYear = new Date().getFullYear()

            return Array.from({ length: 5 }, (_, i) => ({
                id: `${currentYear - i}-01-01`,
                nombre: currentYear - i,
            }))
        },
        column_fecha() {
            return this.vista.tableColumns.find((a) => a.id == 'fecha')
        },
    },
    data: () => ({
        VIEW_CONFIG: {
            tableColumns: [
                {
                    id: 'fecha',
                    title: 'Año',
                    show: false,
                    filtrable: false,
                },
                {
                    id: 'articulo',
                    title: 'Artículo',
                    prop: 'articulo1.nombre',
                    width: '30rem',
                    show: true,
                    seek: true,
                    filtrable: false,
                },
                {
                    id: 'enero',
                    title: 'Enero',
                    width: '8rem',
                    show: true,
                    align: 'right',
                    type: 'number',
                    format: {},
                    filtrable: true,
                },
                {
                    id: 'febrero',
                    title: 'Febrero',
                    width: '8rem',
                    show: true,
                    align: 'right',
                    type: 'number',
                    format: {},
                    filtrable: true,
                },
                {
                    id: 'marzo',
                    title: 'Marzo',
                    width: '8rem',
                    show: true,
                    align: 'right',
                    type: 'number',
                    format: {},
                    filtrable: true,
                },
                {
                    id: 'abril',
                    title: 'Abril',
                    width: '8rem',
                    show: true,
                    align: 'right',
                    type: 'number',
                    format: {},
                    filtrable: true,
                },
                {
                    id: 'mayo',
                    title: 'Mayo',
                    width: '8rem',
                    show: true,
                    align: 'right',
                    type: 'number',
                    format: {},
                    filtrable: true,
                },
                {
                    id: 'junio',
                    title: 'Junio',
                    width: '8rem',
                    show: true,
                    align: 'right',
                    type: 'number',
                    format: {},
                    filtrable: true,
                },
                {
                    id: 'julio',
                    title: 'Julio',
                    width: '8rem',
                    show: true,
                    align: 'right',
                    type: 'number',
                    format: {},
                    filtrable: true,
                },
                {
                    id: 'agosto',
                    title: 'Agosto',
                    width: '8rem',
                    show: true,
                    align: 'right',
                    type: 'number',
                    format: {},
                    filtrable: true,
                },
                {
                    id: 'septiembre',
                    title: 'Septiembre',
                    width: '8rem',
                    show: true,
                    align: 'right',
                    type: 'number',
                    format: {},
                    filtrable: true,
                },
                {
                    id: 'octubre',
                    title: 'Octubre',
                    width: '8rem',
                    show: true,
                    align: 'right',
                    type: 'number',
                    format: {},
                    filtrable: true,
                },
                {
                    id: 'noviembre',
                    title: 'Noviembre',
                    width: '8rem',
                    show: true,
                    align: 'right',
                    type: 'number',
                    format: {},
                    filtrable: true,
                },
                {
                    id: 'diciembre',
                    title: 'Diciembre',
                    width: '8rem',
                    show: true,
                    align: 'right',
                    type: 'number',
                    format: {},
                    filtrable: true,
                },
            ],
        },
    }),
    methods: {
        runMethod(method, item) {
            this[method](item)
        },
        setYear() {
            if (this.column_fecha.val == null) {
                delete this.column_fecha.op
            } else {
                this.column_fecha.op = 'Está dentro de'
                this.column_fecha.val = dayjs(this.column_fecha.val)
                    .startOf('year')
                    .format('YYYY-MM-DD')
                this.column_fecha.val1 = dayjs(this.column_fecha.val)
                    .endOf('year')
                    .format('YYYY-MM-DD')
            }

            this.auth.saveTableColumns(this.$route.name, this.vista.tableColumns)

            this.loadTableData()
        },
        initFiltros() {
            if (!this.vista.tableColumns[0].val) {
                this.vista.tableColumns[0].op = 'Está dentro de'
                this.vista.tableColumns[0].val = dayjs().startOf('year').format('YYYY-MM-DD')
                this.vista.tableColumns[0].val1 = dayjs().endOf('year').format('YYYY-MM-DD')
            }
        },
        checkFiltros() {
            if (!this.vista.tableColumns[0].val) {
                jmsg('error', 'Seleccione el año')
                return true
            }
            return false
        },
        setQuery() {
            this.vista.qry = {
                fltr: {},
            }

            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
        },
        async loadTableData() {
            if (this.checkFiltros()) return
            this.setQuery()

            this.vista.tableData = []
            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.kardex}/consumo?qry=${JSON.stringify(this.vista.qry)}`)
            this.auth.setLoading(false)
            this.vista.last_path = this.$route.fullPath

            if (res.code === 0) {
                this.vista.tableData = res.data
            }
        },
    },
}
</script>
