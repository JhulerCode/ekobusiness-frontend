<template>
    <div class="vista vista-fill">
        <div class="head">
            <div class="head-left" style="flex-wrap: nowrap">
                <strong style="white-space: nowrap">Caja chica</strong>

                <JdButtonsOverflow :buttons="headerActions" @runMethod="runMethod" />
            </div>

            <div class="head-center">
                <JdBuscador
                    :view="vista"
                    :columns="tableColumns"
                    :tableName="tableName"
                    @open-filters="openConfigFiltros"
                    @reload="loadCajaAperturas"
                />
            </div>

            <div class="head-right">
                <JdPaginacion :view="vista" @reload="loadCajaAperturas" />

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
            :columns="tableColumns"
            :datos="vista.caja_aperturas || []"
            :colAct="true"
            :configFiltros="openConfigFiltros"
            :reload="loadCajaAperturas"
            :rowOptions="tableRowActions"
            @rowOptionSelected="runMethod"
        />
    </div>

    <mCajaApertura v-if="useModals.show.mCajaApertura" />

    <mConfigCols v-if="useModals.show.mConfigCols" />
    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
import { JdButton, mConfigFiltros, mConfigCols } from '@jhuler/components'
import JdTable from '@/components/JdTable/JdTable.vue'
import JdBuscador from '@/components/JdBuscador.vue'
import JdPaginacion from '@/components/JdPaginacion.vue'
import JdButtonsOverflow from '@/components/JdButtonsOverflow.vue'
import { TABLE_COLUMNS, TABLE_ROW_ACTIONS, HEADER_ACTIONS } from './caja_aperturas.config.js'

import mCajaApertura from './mCajaApertura.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get, delet, patch } from '@/utils/crud'
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

        mCajaApertura,
        JdButtonsOverflow,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},

        tableName: 'vCajaAperturas',
        headerActions: HEADER_ACTIONS,
        tableColumns: JSON.parse(JSON.stringify(TABLE_COLUMNS)),
        tableRowActions: TABLE_ROW_ACTIONS,
    }),
    created() {
        this.vista = this.useVistas.vCajaAperturas
        this.useAuth.setColumns(this.tableName, this.tableColumns)

        if (this.vista.loaded) return
        if (this.useAuth.verifyPermiso('vCajaAperturas:listar') == true) this.loadCajaAperturas()
    },
    methods: {
        setQuery() {
            this.vista.qry = {
                fltr: {
                    createdBy: { op: 'Es', val: this.useAuth.usuario.id },
                },
            }

            this.useAuth.updateQuery(this.tableColumns, this.vista.qry)
        },
        async loadCajaAperturas() {
            this.setQuery()

            this.vista.caja_aperturas = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.caja_aperturas}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.caja_aperturas = res.data
        },

        nuevo() {
            const item = { fecha_apertura: dayjs().format('YYYY-MM-DD'), estado: 1 }

            this.useModals.setModal('mCajaApertura', 'Caja', 1, item)
        },

        async openConfigFiltros() {
            await this.loadDatosSistema()

            const cols = this.tableColumns
            for (const a of cols) {
                if (a.id == 'estado') a.lista = this.vista.caja_apertura_estados
            }

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadCajaAperturas,
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },

        runMethod(method, item) {
            this[method](item)
        },
        async ver(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.caja_aperturas}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mCajaApertura', 'Caja', 3, res.data)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.caja_aperturas, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vCajaAperturas', 'caja_aperturas', item)
        },
        async agregarMovimientos(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.caja_aperturas}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mCajaApertura', 'Caja', 4, res.data)
        },
        async cerrarCaja(item) {
            const resQst = await jqst('¿Está seguro de cerrar la caja?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await patch(`${urls.caja_aperturas}/cerrar`, { id: item.id })
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.updateItem('vCajaAperturas', 'caja_aperturas', res.data)
        },

        async loadDatosSistema() {
            const qry = ['caja_apertura_estados']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.vista, res.data)
        },
    },
}
</script>

<style lang="scss" scoped></style>
