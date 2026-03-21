<template>
    <VistaLayout :vista="vista">
        <JdTable
            :name="vista.name"
            :columns="vista.tableColumns"
            :datos="vista.tableData || []"
            :rowOptions="vista.tableRowActions"
            @rowOptionSelected="vista.runMethod"
            @rowDblclick="ver"
        />
    </VistaLayout>
</template>

<script>
import VIEW_CONFIG from './adminEmpresas.config.js'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls } from '@/utils/crud'

export default {
    name: 'vAdminEmpresas',
    components: {},
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
            setQuery: this.setQuery,
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
                incl: [],
                ordr: [['razon_social', 'ASC']],
                page: this.vista.table_page,
            }
            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
        },
        async nuevo() {
            this.$router.push({ name: 'vAdminEmpresaDetalle', params: { id: 'nuevo' } })
        },
        async ver(item) {
            if (!this.auth.verifyPermiso('vAdminEmpresas:ver')) return
            this.$router.push({ name: 'vAdminEmpresaDetalle', params: { id: item.id } })
        },
    },
}
</script>
