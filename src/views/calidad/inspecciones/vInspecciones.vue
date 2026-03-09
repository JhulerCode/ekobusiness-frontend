<template>
    <div class="vista vista-fill">
        <div class="head">
            <div class="head-left" style="flex-wrap: nowrap">
                <strong style="white-space: nowrap">Inspecciones de clientes</strong>

                <JdButtonsOverflow :buttons="headerActions" @runMethod="runMethod" />
            </div>

            <div class="head-center">
                <JdBuscador
                    :view="vista"
                    :columns="tableColumns"
                    :tableName="tableName"
                    @open-filters="openConfigFiltros"
                    @reload="loadInspecciones"
                />
            </div>

            <div class="head-right">
                <JdPaginacion :view="vista" @reload="loadInspecciones" />

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
            :datos="vista.inspecciones || []"
            :colAct="true"
            :rowOptions="tableRowActions"
            @rowOptionSelected="runMethod"
            ref="jdtable"
            :reload="loadInspecciones"
        />
    </div>

    <mInspeccion v-if="useModals.show.mInspeccion" />
    <mConfigCols v-if="useModals.show.mConfigCols" />
    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
import { JdButton, mConfigCols, mConfigFiltros } from '@jhuler/components'
import JdBuscador from '@/components/JdBuscador.vue'
import JdTable from '@/components/JdTable/JdTable.vue'
import JdPaginacion from '@/components/JdPaginacion.vue'

import mInspeccion from './mInspeccion.vue'
import JdButtonsOverflow from '@/components/JdButtonsOverflow.vue'

import { TABLE_COLUMNS, TABLE_ROW_ACTIONS, HEADER_ACTIONS } from './inspecciones.config.js'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get, delet } from '@/utils/crud'
import { jqst } from '@/utils/swal'
import dayjs from 'dayjs'

export default {
    name: 'vInspecciones',
    components: {
        JdButton,
        JdBuscador,
        JdTable,
        JdPaginacion,

        mConfigCols,
        mConfigFiltros,

        mInspeccion,
        JdButtonsOverflow,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},

        tableName: 'vInspecciones',
        headerActions: HEADER_ACTIONS,
        tableColumns: JSON.parse(JSON.stringify(TABLE_COLUMNS)),
        tableRowActions: TABLE_ROW_ACTIONS,
    }),
    created() {
        this.vista = this.useVistas.vInspecciones
        this.useAuth.setColumns(this.tableName, this.tableColumns)

        if (this.vista.loaded) return
        this.vista.table_page = 1
        if (this.useAuth.verifyPermiso('vInspecciones:listar') == true) this.loadInspecciones()
    },
    methods: {
        setQuery() {
            this.vista.qry = {
                fltr: {},
                incl: ['socio1'],
                page: this.vista.table_page,
            }

            this.useAuth.updateQuery(this.tableColumns, this.vista.qry)
        },
        async loadInspecciones() {
            this.setQuery()

            this.vista.inspecciones = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.inspecciones}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.inspecciones = res.data
            this.vista.table_meta = res.meta
        },

        nuevo() {
            const item = {
                fecha: dayjs().format('YYYY-MM-DD'),
                correcciones: [],
            }

            this.useModals.setModal('mInspeccion', 'Nueva inspección', 1, item)
        },

        async openConfigFiltros() {
            const cols = this.tableColumns
            for (const a of cols) {
                if (a.id == 'socio') a.reload = this.loadSocios
            }

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadInspecciones,
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },

        runMethod(method, item) {
            this[method](item)
        },
        async ver(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.inspecciones}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const send = {
                item: res.data,
                socios: [{ ...res.data.socio1 }],
            }

            this.useModals.setModal('mInspeccion', 'Ver inspección', 3, send, true)
        },
        async editar(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.inspecciones}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mInspeccion', 'Editar inspección', 2, res.data)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.inspecciones, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vInspecciones', 'inspecciones', item)
        },

        async loadSocios() {
            const qry = {
                fltr: { tipo: { op: 'Es', val: 2 }, activo: { op: 'Es', val: true } },
                cols: ['nombres'],
                ordr: [['nombres', 'ASC']],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.socios}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code !== 0) return
            return (this.vista.socios = res.data)
        },
    },
}
</script>

<style lang="scss" scoped></style>
