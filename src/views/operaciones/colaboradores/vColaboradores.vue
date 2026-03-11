<template>
    <div class="vista vista-fill">
        <div class="head">
            <div class="head-left" style="flex-wrap: nowrap">
                <strong style="white-space: nowrap">Colaboradores</strong>

                <JdButtonsOverflow :buttons="headerActions" @runMethod="runMethod" />
            </div>

            <div class="head-center">
                <JdBuscador
                    :columns="tableColumns"
                    :tableName="tableName"
                    @open-filters="openConfigFiltros"
                    @reload="loadColaboradores"
                />
            </div>

            <div class="head-right">
                <JdPaginacion :view="vista" @reload="loadColaboradores" />

                <JdButton
                    icon="fa-solid fa-sliders"
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
            :datos="vista.colaboradores || []"
            :colAct="true"
            :rowOptions="tableRowActions"
            @rowOptionSelected="runMethod"
        />
    </div>

    <mColaborador v-if="useModals.show.mColaborador" />

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
import { TABLE_COLUMNS, TABLE_ROW_ACTIONS, HEADER_ACTIONS } from './colaboradores.config.js'

import mColaborador from './mColaborador.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get, delet } from '@/utils/crud'
import { jqst } from '@/utils/swal'

export default {
    components: {
        JdButton,
        JdTable,
        JdBuscador,
        JdPaginacion,

        mConfigCols,
        mConfigFiltros,

        mColaborador,
        JdButtonsOverflow,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},

        tableName: 'vColaboradores',
        headerActions: HEADER_ACTIONS,
        tableColumns: JSON.parse(JSON.stringify(TABLE_COLUMNS)),
        tableRowActions: TABLE_ROW_ACTIONS,
    }),
    created() {
        this.vista = this.useVistas.vColaboradores
        this.useAuth.setColumns(this.tableName, this.tableColumns)

        if (this.vista.loaded) return

        if (this.useAuth.verifyPermiso('vColaboradores:listar') == true) this.loadColaboradores()
    },
    methods: {
        setQuery() {
            this.vista.qry = {
                fltr: {},
                ordr: [['nombres', 'ASC']],
            }

            this.useAuth.updateQuery(this.tableColumns, this.vista.qry)
        },
        async loadColaboradores(init_page = false) {
            if (init_page) this.vista.table_page = 1
            this.setQuery()

            this.vista.colaboradores = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.colaboradores}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.colaboradores = res.data
        },

        nuevo() {
            const item = { activo: true, has_signin: false }

            this.useModals.setModal('mColaborador', 'Nuevo colaborador', 1, item)
        },

        async openConfigFiltros() {
            await this.loadDatosSistema()

            const cols = this.tableColumns
            for (const a of cols) {
                if (a.id == 'sexo') a.lista = this.vista.generos
                if (a.id == 'doc_tipo') a.lista = this.vista.documentos_identidad
                if (a.id == 'activo') a.lista = this.vista.estados
            }

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadColaboradores,
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
                reload: this.loadColaboradores,
            }
            this.useModals.setModal('mConfigCols', 'Configurar columnas', null, send, true)
        },
        async ver(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.colaboradores}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mColaborador', 'Ver colaborador', 3, res.data)
        },
        async editar(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.colaboradores}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mColaborador', 'Editar colaborador', 2, res.data)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.colaboradores, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vColaboradores', 'colaboradores', item)
        },

        async loadDatosSistema() {
            const qry = ['generos', 'documentos_identidad', 'estados']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.vista, res.data)
        },
    },
}
</script>

<style lang="scss" scoped></style>
