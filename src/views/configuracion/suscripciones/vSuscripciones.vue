<template>
    <VistaLayout :vista="vista">
        <JdTable :name="vista.name" :columns="vista.tableColumns" :datos="vista.tableData || []" />
    </VistaLayout>
</template>

<script>
// Configuración de la vista
import VIEW_CONFIG from './suscripciones.config.js'

// Pinia y Utils
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls } from '@/utils/crud'

export default {
    name: 'vSuscripciones',
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
                incl: ['moneda1', 'empresa1'],
                ordr: [['createdAt', 'DESC']],
                page: this.vista.table_page,
            }
            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
        },
    },
}
</script>
