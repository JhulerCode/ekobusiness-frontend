<template>
    <div class="vista vista-fill">
        <div class="head">
            <div class="head-left" style="flex-wrap: nowrap">
                <strong style="white-space: nowrap">Asistencias</strong>

                <JdButtonsOverflow :buttons="headerActions" @runMethod="runMethod" />
            </div>

            <div class="head-center">
                <JdBuscador
                    :view="vista"
                    :columns="tableColumns"
                    :tableName="tableName"
                    @open-filters="openConfigFiltros"
                    @reload="loadAsistencias"
                />
            </div>

            <div class="head-right">
                <JdPaginacion :view="vista" @reload="loadAsistencias" />

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
                    @click="openConfigCols"
                />
            </div>
        </div>

        <JdTable
            ref="jdtable"
            :name="tableName"
            :columns="tableColumns"
            :datos="vista.asistencias || []"
            :colAct="true"
            :rowOptions="tableRowActions"
            @rowOptionSelected="runMethod"
        />
    </div>

    <mAsistencia v-if="useModals.show.mAsistencia" />

    <mConfigCols v-if="useModals.show.mConfigCols" />
    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
import { JdButton, mConfigFiltros } from '@jhuler/components'
import mConfigCols from '@/components/mConfigCols.vue'
import JdTable from '@/components/JdTable/JdTable.vue'
import JdBuscador from '@/components/JdBuscador.vue'
import JdPaginacion from '@/components/JdPaginacion.vue'
import JdButtonsOverflow from '@/components/JdButtonsOverflow.vue'
import { TABLE_COLUMNS, TABLE_ROW_ACTIONS, HEADER_ACTIONS } from './asistencias.config.js'

import mAsistencia from './mAsistencia.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get, delet } from '@/utils/crud'
import { jqst } from '@/utils/swal'

import dayjs from 'dayjs'

export default {
    components: {
        JdButton,
        JdTable,
        JdBuscador,
        JdPaginacion,

        mConfigCols,
        mConfigFiltros,

        mAsistencia,
        JdButtonsOverflow,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},

        tableName: 'vAsistencias',
        headerActions: HEADER_ACTIONS,
        tableColumns: JSON.parse(JSON.stringify(TABLE_COLUMNS)),
        tableRowActions: TABLE_ROW_ACTIONS,
    }),
    created() {
        this.vista = this.useVistas.vAsistencias
        this.initFiltros()
        this.useAuth.setColumns(this.tableName, this.tableColumns)

        if (this.vista.loaded) return

        if (this.useAuth.verifyPermiso('vAsistencias:listar') == true) this.loadAsistencias()
    },
    methods: {
        initFiltros() {
            this.tableColumns[1].op = 'Está dentro de'
            this.tableColumns[1].val = dayjs().startOf('month').format('YYYY-MM-DD')
            this.tableColumns[1].val1 = dayjs().format('YYYY-MM-DD')
        },
        setQuery() {
            this.vista.qry = {
                fltr: {},
                incl: ['colaborador1'],
            }

            this.useAuth.updateQuery(this.tableColumns, this.vista.qry)
        },
        async loadAsistencias() {
            this.setQuery()

            this.vista.asistencias = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.asistencias}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.asistencias = res.data
        },

        async nuevo() {
            if (!this.vista.colaboradores) await this.loadColaboradores()

            const send = {
                asistencia: {},
                colaboradores: this.vista.colaboradores,
            }

            this.useModals.setModal('mAsistencia', 'Nuevo asistencia', 1, send, true)
        },

        async openConfigFiltros() {
            const cols = this.tableColumns
            for (const a of cols) {
                if (a.id == 'colaborador') a.reload = this.loadColaboradores
            }

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadAsistencias,
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },

        runMethod(method, item) {
            this[method](item)
        },
        openConfigCols() {
            const send = {
                table: this.tableName,
                cols: this.tableColumns,
                reload: this.loadAsistencias,
            }
            this.useModals.setModal('mConfigCols', 'Configurar columnas', null, send, true)
        },
        async editar(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.asistencias}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            if (!this.vista.colaboradores) await this.loadColaboradores()

            const send = {
                asistencia: res.data,
                colaboradores: this.vista.colaboradores,
            }

            this.useModals.setModal('mAsistencia', 'Editar asistencia', 2, send, true)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.asistencias, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vAsistencias', 'asistencias', item)
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

            if (res.code != 0) return

            this.vista.colaboradores = res.data
            return res.data
        },
    },
}
</script>

<style lang="scss" scoped></style>
