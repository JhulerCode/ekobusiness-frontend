<template>
    <VistaLayout :vista="vista">
        <JdTable
            :name="vista.name"
            :columns="vista.tableColumns"
            :datos="vista.tableData || []"
            :rowOptions="vista.tableRowActions"
            @rowOptionSelected="vista.runMethod"
        />
    </VistaLayout>

    <!-- Modales -->
    <mTipoCambio v-if="modals.show.mTipoCambio" />
</template>

<script>
import VIEW_CONFIG from './tipo_cambios.config.js'

import mTipoCambio from './mTipoCambio.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls, get } from '@/utils/crud'
import dayjs from 'dayjs'

export default {
    name: 'vTipoCambios',
    components: {
        mTipoCambio,
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
                ordr: [['fecha', 'DESC']],
                page: this.vista.table_page,
            }
            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
        },

        // Header actions
        nuevo() {
            const send = { tipo_cambio: { fecha: dayjs().format('YYYY-MM-DD') } }
            this.modals.setModal('mTipoCambio', 'Nuevo tipo de cambio', 1, send, true)
        },

        // Table row actions
        async editar(item) {
            const qry = {
                incl: ['moneda1'],
            }

            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)
            if (res.code != 0) return

            const send = {
                tipo_cambio: res.data,
            }
            this.modals.setModal('mTipoCambio', 'Editar tipo de cambio', 2, send, true)
        },
    },
}
</script>
