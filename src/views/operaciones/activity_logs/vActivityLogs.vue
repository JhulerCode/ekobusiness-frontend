<template>
    <div class="vista vista-fill">
        <div class="head">
            <div class="head-left" style="flex-wrap: nowrap">
                <strong style="white-space: nowrap">Activity Logs</strong>

                <JdButtonsOverflow :buttons="headerActions" @runMethod="runMethod" />
            </div>

            <div class="head-center">
                <JdBuscador
                    :columns="tableColumns"
                    :tableName="tableName"
                    @open-filters="openConfigFiltros"
                    @reload="loadActivityLogs"
                />
            </div>

            <div class="head-right">
                <JdPaginacion :view="vista" @reload="loadActivityLogs" />

                <JdButton
                    icon="fa-solid fa-sliders"
                    tipo="2"
                    title="Columnas"
                    @click="$refs['jdtable'].openConfigCols()"
                />
            </div>
        </div>

        <JdTable
            ref="jdtable"
            :name="tableName"
            :columns="tableColumns"
            :datos="vista.activity_logs || []"
            :colAct="true"
            :rowOptions="tableRowActions"
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
import JdButtonsOverflow from '@/components/JdButtonsOverflow.vue'
import { TABLE_COLUMNS, TABLE_ROW_ACTIONS, HEADER_ACTIONS } from './activity_logs.config.js'

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
        JdButtonsOverflow,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},

        tableName: 'vActivityLogs',
        headerActions: HEADER_ACTIONS,
        tableColumns: JSON.parse(JSON.stringify(TABLE_COLUMNS)),
        tableRowActions: TABLE_ROW_ACTIONS,
    }),
    created() {
        this.vista = this.useVistas.vActivityLogs
        this.initFiltros()
        this.useAuth.setColumns(this.tableName, this.tableColumns)

        if (this.vista.loaded) return
        this.vista.table_page = 1
        if (this.useAuth.verifyPermiso('vActivityLogs:listar') == true) this.loadActivityLogs()
    },
    methods: {
        initFiltros() {
            this.tableColumns[0].op = 'Es posterior a'
            this.tableColumns[0].val = dayjs().format('YYYY-MM-DDT00:00')
            // this.tableColumns[0].val = dayjs().startOf('week').format('YYYY-MM-DDTHH:mm')
            // this.tableColumns[0].val1 = dayjs().format('YYYY-MM-DDTHH:mm')
        },
        setQuery() {
            this.vista.qry = {
                fltr: {},
                incl: ['colaborador1'],
                page: this.vista.table_page,
            }

            this.useAuth.updateQuery(this.tableColumns, this.vista.qry)
        },
        async loadActivityLogs(init_page = false) {
            if (init_page) this.vista.table_page = 1
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
            const cols = this.tableColumns
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
