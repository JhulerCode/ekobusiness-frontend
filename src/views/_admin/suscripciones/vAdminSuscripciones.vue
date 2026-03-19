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
    <mAdminSuscripcion v-if="modals.show.mAdminSuscripcion" />
</template>

<script>
import mAdminSuscripcion from './mAdminSuscripcion.vue'
import VIEW_CONFIG from './adminSuscripciones.config.js'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls, get } from '@/utils/crud'
import dayjs from 'dayjs'

export default {
    name: 'vAdminSuscripciones',
    components: {
        mAdminSuscripcion,
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
        this.auth.setColumns(this.vista.name, this.vista.tableColumns)

        // 2. Carga inicial
        if (!this.vista.loaded && this.auth.verifyPermiso(`${VIEW_CONFIG.name}:listar`)) {
            this.vista.loadTableData()
        }
    },
    methods: {
        runMethod(method, item) {
            this.vistas.runMethod(this, method, item)
        },
        setQuery() {
            this.vista.qry = {
                fltr: {},
                incl: ['moneda1', 'empresa1'],
                ordr: [['createdAt', 'DESC']],
                page: this.vista.table_page,
            }
            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
        },
        async nuevo() {
            const send = {
                suscripcion: {
                    plan_nombre: 'ESTÁNDAR',
                    periodo: 'mensual',
                    fecha_inicio: dayjs().format('YYYY-MM-DD'),
                    fecha_vencimiento: dayjs().add(1, 'month').format('YYYY-MM-DD'),
                },
            }
            this.modals.setModal('mAdminSuscripcion', 'Nueva Suscripción Global', 1, send, true)
        },
        async editar(item) {
            const qry = {
                incl: ['empresa1', 'moneda1'],
            }

            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)

            if (res.code != 0) return

            const send = {
                suscripcion: { ...res.data },
            }

            this.modals.setModal('mAdminSuscripcion', 'Editar Suscripción Global', 2, send, true)
        },
    },
}
</script>
