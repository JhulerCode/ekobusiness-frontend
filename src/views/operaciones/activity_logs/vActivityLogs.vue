<template>
    <div class="vista vista-fill">
        <div class="head">
            <div class="head-left">
                <strong>Activity Logs</strong>
            </div>

            <div class="head-center">
                <JdBuscador
                    :view="vista"
                    :columns="columns"
                    :tableName="tableName"
                    @open-filters="openConfigFiltros"
                    @reload="loadActivityLogs"
                />
            </div>

            <div class="head-right">
                <JdPaginacion :view="vista" @reload="loadActivityLogs" />

                <JdButton
                    icon="fa-solid fa-file-excel"
                    tipo="2"
                    title="Exportar"
                    @click="$refs['jdtable'].downloadData()"
                />

                <JdButton
                    icon="fa-solid fa-gear"
                    tipo="2"
                    title="Columnas"
                    @click="$refs['jdtable'].openConfigCols()"
                />
            </div>
        </div>

        <JdTable
            ref="jdtable"
            :name="tableName"
            :columns="columns"
            :datos="vista.activity_logs || []"
            :reload="loadActivityLogs"
            :configFiltros="openConfigFiltros"
            :colAct="true"
            :meta="vista.table_meta"
            @prevPage="((vista.table_page -= 1), loadActivityLogs())"
            @nextPage="((vista.table_page += 1), loadActivityLogs())"
            :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod"
        />
    </div>

    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
import { mConfigFiltros, JdButton } from '@jhuler/components'
import JdTable from '@/components/JdTable/JdTable.vue'
import JdBuscador from '@/components/JdBuscador.vue'
import JdPaginacion from '@/components/JdPaginacion.vue'
import { columns, tableRowOptions } from './activity_logs.config.js'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get } from '@/utils/crud'
import dayjs from 'dayjs'

export default {
    components: {
        JdTable,
        JdBuscador,
        JdPaginacion,
        JdButton,
        mConfigFiltros,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},

        tableName: 'vActivityLogs',
        columns,
        tableRowOptions,
    }),
    created() {
        this.vista = this.useVistas.vActivityLogs
        this.initFiltros()
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return
        this.vista.table_page = 1
        if (this.useAuth.verifyPermiso('vActivityLogs:listar') == true) this.loadActivityLogs()
    },
    methods: {
        initFiltros() {
            this.columns[0].op = 'Es posterior a'
            this.columns[0].val = dayjs().format('YYYY-MM-DDT00:00')
            // this.columns[0].val = dayjs().startOf('week').format('YYYY-MM-DDTHH:mm')
            // this.columns[0].val1 = dayjs().format('YYYY-MM-DDTHH:mm')
        },
        setQuery() {
            this.vista.qry = {
                fltr: {},
                incl: ['colaborador1'],
                page: this.vista.table_page,
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
            this.vista.table_meta = res.meta
        },
        async openConfigFiltros() {
            const cols = this.columns
            for (const a of cols) {
                if (a.id == 'colaborador') a.reload = this.loadColaboradores
            }

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadActivityLogs,
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },

        async loadColaboradores() {
            const qry = {
                fltr: {},
                cols: ['nombres'],
                ordr: [['nombres', 'ASC']],
            }

            this.vista.colaboradores = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.colaboradores}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.colaboradores = res.data
            return res.data
        },
        runMethod(method, item) {
            this[method](item)
        },
    },
}
</script>

<style lang="scss" scoped></style>
