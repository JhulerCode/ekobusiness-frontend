<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Activity Logs</strong>
        </div>

        <JdTable :name="tableName" :columns="columns" :datos="vista.activity_logs || []" :reload="loadActivityLogs"
            :configFiltros="openConfigFiltros" :colAct="true">
        </JdTable>
    </div>

    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
import JdTable from '@/components/JdTable.vue'

import mConfigFiltros from '@/components/mConfigFiltros.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get } from '@/utils/crud'
import dayjs from 'dayjs'

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

        tableName: 'vActivityLogs',
        columns: [
            {
                id: 'createdAt',
                title: 'Fecha',
                type: 'datetime',
                format: 'datetime',
                width: '15rem',
                show: true,
                seek: true,
                sort: true
            },
            {
                id: 'colaborador',
                title: 'Colaborador',
                prop: 'colaborador1.nombres_apellidos',
                type: 'select',
                mostrar: 'nombres_apellidos',
                width: '15rem',
                show: true,
                seek: true,
                sort: true
            },
            {
                id: 'method',
                title: 'Acción',
                type: 'text',
                width: '5rem',
                show: true,
                seek: false,
                sort: false
            },
            {
                id: 'baseUrl',
                title: 'Recurso',
                type: 'text',
                width: '10rem',
                show: true,
                seek: false,
                sort: false
            },
            {
                id: 'detail',
                title: 'Detalle',
                type: 'text',
                width: '15rem',
                show: true,
                seek: false,
                sort: false
            },
        ],
    }),
    created() {
        this.vista = this.useVistas.vActivityLogs
        this.initFiltros()
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return

        if (this.useAuth.verifyPermiso('vActivityLogs:listar') == true) this.loadActivityLogs()
    },
    methods: {
        initFiltros() {
            this.columns[0].op = 'Está dentro de'
            this.columns[0].val = dayjs().startOf('month').format('YYYY-MM-DDTHH:mm')
            this.columns[0].val1 = dayjs().format('YYYY-MM-DDTHH:mm')
        },
        setQuery() {
            this.vista.qry = {
                fltr: {},
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
        },
        async loadActivityLogs() {
            this.setQuery()

            this.vista.activity_logs = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.activity_logs}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.activity_logs = res.data
        },
        async openConfigFiltros() {
            await this.loadColaboradores()

            const cols = this.columns
            cols.find(a => a.id == 'colaborador').lista = this.vista.colaboradores

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadActivityLogs
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },

        async loadColaboradores() {
            const qry = {
                fltr: {},
                cols: ['nombres', 'apellidos', 'nombres_apellidos'],
            }

            this.vista.colaboradores = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.colaboradores}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.colaboradores = res.data
        },
    },
}
</script>

<style lang="scss" scoped></style>
