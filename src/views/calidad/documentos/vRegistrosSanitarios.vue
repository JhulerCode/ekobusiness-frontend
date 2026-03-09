<template>
    <div class="vista vista-fill">
        <div class="head">
            <div class="head-left">
                <strong>Registros sanitarios</strong>

                <JdButton
                    text="Nuevo"
                    title="Crear nuevo"
                    @click="nuevo()"
                    v-if="useAuth.verifyPermiso('vRegistrosSanitarios:crear')"
                />
            </div>

            <div class="head-center">
                <JdBuscador
                    :view="vista"
                    :columns="columns"
                    :tableName="tableName"
                    @open-filters="openConfigFiltros"
                    @reload="loadDocumentos"
                />
            </div>

            <div class="head-right">
                <JdPaginacion :view="vista" @reload="loadDocumentos" />

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
            :columns="columns"
            :datos="vista.documentos || []"
            :colAct="true"
            :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod"
            ref="jdtable"
            :reload="loadDocumentos"
        />
    </div>

    <mDocumento v-if="useModals.show.mDocumento" />
    <mConfigCols v-if="useModals.show.mConfigCols" />
    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
import { JdButton, mConfigCols, mConfigFiltros } from '@jhuler/components'
import JdBuscador from '@/components/JdBuscador.vue'
import JdTable from '@/components/JdTable/JdTable.vue'
import JdPaginacion from '@/components/JdPaginacion.vue'

import mDocumento from '@/views/operaciones/documentos/mDocumento.vue'

import { COLUMNS, TABLE_ROW_OPTIONS } from './registros_sanitarios.config'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get, delet } from '@/utils/crud'
import { jqst } from '@/utils/swal'

export default {
    name: 'vRegistrosSanitarios',
    components: {
        JdButton,
        JdBuscador,
        JdTable,
        JdPaginacion,

        mConfigCols,
        mConfigFiltros,

        mDocumento,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},

        tableName: 'vRegistrosSanitarios',
        columns: JSON.parse(JSON.stringify(COLUMNS)),
        tableRowOptions: TABLE_ROW_OPTIONS,
    }),
    created() {
        this.vista = this.useVistas.vRegistrosSanitarios
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return
        this.vista.table_page = 1
        if (this.useAuth.verifyPermiso('vRegistrosSanitarios:listar') == true) this.loadDocumentos()
    },
    methods: {
        setQuery() {
            this.vista.qry = {
                fltr: { tipo: { op: 'Es', val: 2 } },
                page: this.vista.table_page,
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
        },
        async loadDocumentos() {
            this.setQuery()

            this.vista.documentos = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.documentos}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.documentos = res.data
            this.vista.table_meta = res.meta
        },

        nuevo() {
            const item = { tipo: 2 }

            this.useModals.setModal('mDocumento', 'Nuevo registro sanitario', 1, item)
        },

        async openConfigFiltros() {
            await this.loadDatosSistema()

            const cols = this.columns
            for (const a of cols) {
                if (a.id == 'activo') a.lista = this.vista.documentos_estados
            }

            const send = {
                table: this.tableName,
                cols: cols.filter((a) => a.id !== 'estado'),
                reload: this.loadDocumentos,
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },

        runMethod(method, item) {
            this[method](item)
        },
        async editar(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.documentos}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mDocumento', 'Editar registro sanitario', 2, res.data)
        },
        verFile(item) {
            console.log('Ver file:', item)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.documentos, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vRegistrosSanitarios', 'documentos', item)
        },

        async loadDatosSistema() {
            const qry = ['documentos_estados']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.vista, res.data)
        },
    },
}
</script>

<style lang="scss" scoped></style>
