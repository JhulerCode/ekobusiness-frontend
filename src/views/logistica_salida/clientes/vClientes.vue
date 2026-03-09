<template>
    <div class="vista vista-fill">
        <div class="head">
            <div class="head-left" style="flex-wrap: nowrap">
                <strong style="white-space: nowrap">Clientes</strong>

                <JdButtonsOverflow :buttons="headerActions" @runMethod="runMethod" />
            </div>

            <div class="head-center">
                <JdBuscador
                    :view="vista"
                    :columns="tableColumns"
                    :tableName="tableName"
                    @open-filters="openConfigFiltros"
                    @reload="loadSocios"
                />
            </div>

            <div class="head-right">
                <JdPaginacion :view="vista" @reload="loadSocios" />

                <JdBulkActions
                    :view="vista"
                    :actions="tableBulkActions"
                    :items="vista.socios || []"
                    @actionClick="runMethod"
                />

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
            :name="tableName"
            :columns="tableColumns"
            :datos="vista.socios || []"
            :colAct="true"
            :rowOptions="tableRowActions"
            @rowOptionSelected="runMethod"
            ref="jdtable"
            :reload="loadSocios"
        />
    </div>

    <mSocio v-if="useModals.show.mSocio" />

    <mConfigCols v-if="useModals.show.mConfigCols" />
    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
    <mEditar v-if="useModals.show.mEditar" @updated="updatedBulk" />
</template>

<script>
import { JdButton, mConfigFiltros, mConfigCols, mEditar } from '@jhuler/components'
import JdBulkActions from '@/components/JdBulkActions.vue'
import JdBuscador from '@/components/JdBuscador.vue'
import JdTable from '@/components/JdTable/JdTable.vue'
import JdPaginacion from '@/components/JdPaginacion.vue'

import mSocio from '@/views/logistica_entrada/proveedores/mSocio.vue'
import JdButtonsOverflow from '@/components/JdButtonsOverflow.vue'

import {
    TABLE_COLUMNS,
    TABLE_BULK_ACTIONS,
    TABLE_ROW_ACTIONS,
    HEADER_ACTIONS,
} from './clientes.config.js'

import { useModals } from '@/pinia/modals'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'

import { urls, get, delet } from '@/utils/crud'
import { jqst } from '@/utils/swal'

export default {
    name: 'vClientes',
    components: {
        JdButton,
        JdBuscador,
        JdTable,
        JdPaginacion,
        JdBulkActions,
        mSocio,
        mConfigCols,
        mConfigFiltros,
        mEditar,
        JdButtonsOverflow,
    },
    data: () => ({
        useModals: useModals(),
        useAuth: useAuth(),
        useVistas: useVistas(),

        vista: {},

        tableName: 'vClientes',
        headerActions: HEADER_ACTIONS,
        tableColumns: JSON.parse(JSON.stringify(TABLE_COLUMNS)),
        tableBulkActions: TABLE_BULK_ACTIONS,
        tableRowActions: TABLE_ROW_ACTIONS,
    }),
    created() {
        this.vista = this.useVistas.vClientes
        this.useAuth.setColumns(this.tableName, this.tableColumns)

        if (this.vista.loaded) return
        this.vista.table_page = 1
        if (this.useAuth.verifyPermiso('vClientes:listar') == true) this.loadSocios()
    },
    methods: {
        setQuery() {
            this.vista.qry = {
                fltr: { tipo: { op: 'Es', val: 2 } },
                ordr: [['nombres', 'ASC']],
                page: this.vista.table_page,
            }

            this.useAuth.updateQuery(this.tableColumns, this.vista.qry)
        },
        async loadSocios() {
            this.setQuery()

            this.vista.socios = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.socios}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.socios = res.data
            this.vista.table_meta = res.meta
        },

        nuevo() {
            const item = {
                tipo: 2,
                doc_tipo: 6,
                direcciones: [],
                contactos: [],
                bancos: [],
                documentos: [],
                activo: true,
            }

            this.useModals.setModal('mSocio', 'Nuevo cliente', 1, item)
        },

        async openConfigFiltros() {
            await this.loadDatosSistema()

            const cols = this.tableColumns
            for (const a of cols) {
                if (a.id == 'doc_tipo') a.lista = this.vista.documentos_identidad
                if (a.id == 'activo') a.lista = this.vista.estados
            }

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadSocios,
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },

        async eliminarBulk() {
            const ids = this.vista.socios.filter((a) => a.selected).map((b) => b.id)

            const resQst = await jqst(`¿Está seguro de eliminar ${ids.length} registros?`)
            if (resQst.isConfirmed == false) return

            const send = { id: 'bulk', ids }
            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(`${urls.socios}/bulk`, send)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.vista.socios = this.vista.socios.filter((a) => !a.selected)
            this.$refs['jdtable'].toogleSelectItems()
        },
        async editarBulk() {
            await this.loadDatosSistema()

            const cols = this.tableColumns
            for (const a of cols) {
                if (a.id == 'doc_tipo') a.lista = this.vista.documentos_identidad
                if (a.id == 'activo') a.lista = this.vista.estados
            }

            const ids = this.vista.socios.filter((a) => a.selected).map((b) => b.id)

            const send = {
                uri: 'socios',
                nuevo: {},
                cols,
                ids,
            }

            this.useModals.setModal('mEditar', `Editar ${ids.length} registros`, null, send, true)
        },
        updatedBulk(item) {
            for (const a of this.vista.socios) {
                if (!item.ids.includes(a.id)) continue

                a.selected = false
                a[item.prop] = item.val
                if (item.val1) a[`${item.prop}1`] = item.val1
            }

            this.$refs['jdtable'].toogleSelectItems()
        },

        runMethod(method, item) {
            this[method](item)
        },
        async ver(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.socios}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mSocio', 'Ver cliente', 3, res.data)
        },
        async editar(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.socios}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mSocio', 'Editar cliente', 2, res.data)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.socios, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vClientes', 'socios', item)
        },

        async loadDatosSistema() {
            const qry = ['documentos_identidad', 'estados']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.vista, res.data)
        },
    },
}
</script>

<style lang="scss" scoped></style>
