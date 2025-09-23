<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Usuarios conectados</strong>
        </div>

        <JdTable :name="tableName" :columns="columns" :datos="vista.sessions || []" :colAct="true"
            :reload="loadSessions">
        </JdTable>
    </div>

    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
import { JdTable, mConfigFiltros } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get } from '@/utils/crud'

export default {
    components: {
        JdTable,

        mConfigFiltros,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},

        tableName: 'vSessions',
        columns: [
            {
                id: 'nombres',
                title: 'Nombres',
                type: 'text',
                width: '10rem',
                show: true,
                seek: true,
                sort: true
            },
            {
                id: 'apellidos',
                title: 'Apellidos',
                type: 'text',
                width: '10rem',
                show: true,
                seek: false,
                sort: false
            },
            {
                id: 'cargo',
                title: 'Cargo',
                type: 'text',
                width: '10rem',
                show: true,
                seek: false,
                sort: false
            },
        ],
    }),
    created() {
        this.vista = this.useVistas.vSessions
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return

        if (this.useAuth.verifyPermiso('vSessions:listar') == true) this.loadSessions()
    },
    methods: {
        setQuery() {
            this.vista.qry = {
                fltr: {},
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
        },
        async loadSessions() {
            this.setQuery()

            this.vista.sessions = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.sessions}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.sessions = res.data
        },
    },
}
</script>

<style lang="scss" scoped></style>
