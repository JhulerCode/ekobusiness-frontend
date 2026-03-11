<template>
    <VistaLayout :vista="vista">
        <JdTable
            :name="vista.name"
            :columns="vista.tableColumns"
            :datos="vista.tableData || []"
        />
    </VistaLayout>

    <!-- Modales -->
    <mFormato v-if="modals.show.mFormato" @created="setTransaccionItemCalidadRevisado" />
</template>

<script>
// Componentes base y utilidades
import VistaLayout from '@/components/VistaLayout/VistaLayout.vue'
import JdTable from '@/components/JdTable/JdTable.vue'

// Configuración de la vista
import VIEW_CONFIG from './compra_items.config.js'

// Modales específicos
import mFormato from '@/views/calidad/formatos/mFormato.vue'

// Pinia y Utils
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls } from '@/utils/crud'
import dayjs from 'dayjs'

export default {
    name: 'vCompraItems',
    components: {
        VistaLayout,
        JdTable,
        mFormato,
    },
    computed: {
        auth: () => useAuth(),
        vistas: () => useVistas(),
        modals: () => useModals(),
        vista() {
            return this.vistas[VIEW_CONFIG.name]
        },
    },
    async created() {
        // 1. Inicialización de la vista
        this.vistas.initVista(VIEW_CONFIG.name, {
            ...JSON.parse(JSON.stringify(VIEW_CONFIG)),
            apiUrl: urls[VIEW_CONFIG.apiPath],
            runMethod: this.runMethod,
        })
        this.initFiltros()

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
        initFiltros() {
            if (!this.vista.tableColumns[0].val) {
                this.vista.tableColumns[0].op = 'Está dentro de'
                this.vista.tableColumns[0].val = dayjs().startOf('month').format('YYYY-MM-DD')
                this.vista.tableColumns[0].val1 = dayjs().format('YYYY-MM-DD')
            }
        },
        setQuery() {
            this.vista.qry = {
                fltr: { 'transaccion1.tipo': { op: 'Es', val: 1 } },
                incl: ['transaccion1', 'articulo1'],
                iccl: {
                    transaccion1: { incl: ['socio1', 'socio_pedido1'] },
                },
                page: this.vista.table_page,
            }
            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
        },

        // Table row actions
        // async crearFormatoValue(item) {
        //     const formato_id = 'RE-BPM-05.01'
        //     this.auth.setLoading(true, 'Cargando...')
        //     const res = await get(`${urls.formatos}/uno/${formato_id}`)
        //     this.auth.setLoading(false)
        //     if (res.code != 0) return

        //     this.auth.setLoading(true, 'Cargando...')
        //     const res1 = await get(`${urls.formato_values}/uno/${item.calidad_revisado}`)
        //     this.auth.setLoading(false)
        //     if (res1.code != 0) return

        //     if (res1.data == null) {
        //         const send = {
        //             transaccion_item: item.id,
        //             transaccion_item1: { ...item },
        //             formato: {
        //                 codigo: res.data.id,
        //                 columns: res.data.columns,
        //                 instructivo: res.data.instructivo,
        //             },
        //         }
        //         this.modals.setModal('mFormato', formato_id, 1, send, true)
        //     } else {
        //         for (const a of res.data.columns) a.value = res1.data[a.id]
        //         const send = {
        //             transaccion_item: item.id,
        //             transaccion_item1: res1.data.transaccion_item1,
        //             formato: {
        //                 id: res1.data.id,
        //                 codigo: res.data.id,
        //                 columns: res.data.columns,
        //                 instructivo: res.data.instructivo,
        //             },
        //         }
        //         this.modals.setModal('mFormato', formato_id, 2, send, true)
        //     }
        // },

        // @actions
        setTransaccionItemCalidadRevisado(item) {
            const t_item = this.vista.tableData.find((a) => a.id == item.transaccion_item)
            if (t_item) t_item.calidad_revisado = item.id
        },
    },
}
</script>
