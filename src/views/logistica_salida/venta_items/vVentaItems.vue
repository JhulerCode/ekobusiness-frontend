<template>
    <div class="vista vista-fill">
        <div class="head">
            <div class="head-left">
                <strong>Artículos vendidos</strong>
            </div>

            <div class="head-center">
                <JdBuscador
                    :view="vista"
                    :columns="columns"
                    :tableName="tableName"
                    @open-filters="openConfigFiltros"
                    @reload="loadTransaccionItems"
                />
            </div>

            <div class="head-right">
                <JdPaginacion :view="vista" @reload="loadTransaccionItems" />

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
            :datos="vista.transaccion_items || []"
            ref="jdtable"
            :reload="loadTransaccionItems"
        />
    </div>

    <mFormato v-if="useModals.show.mFormato" @created="setTransaccionItemCalidadRevisado" />
    <mConfigCols v-if="useModals.show.mConfigCols" />
    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
import { JdButton, mConfigFiltros, mConfigCols } from '@jhuler/components'
import JdBuscador from '@/components/JdBuscador.vue'
import JdTable from '@/components/JdTable/JdTable.vue'
import JdPaginacion from '@/components/JdPaginacion.vue'

import mFormato from '@/views/calidad/formatos/mFormato.vue'

import { COLUMNS } from './venta_items.config'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get } from '@/utils/crud'

import dayjs from 'dayjs'

export default {
    name: 'vVentaItems',
    components: {
        JdButton,
        JdBuscador,
        JdTable,
        JdPaginacion,
        mConfigCols,
        mConfigFiltros,
        mFormato,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},

        tableName: 'vVentaItems',
        columns: JSON.parse(JSON.stringify(COLUMNS)),
    }),
    async created() {
        this.vista = this.useVistas.vVentaItems
        this.initFiltros()
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return
        this.vista.table_page = 1
        if (this.useAuth.verifyPermiso('vVentaItems:listar') == true) this.loadTransaccionItems()
    },
    methods: {
        initFiltros() {
            if (!this.columns[0].val) {
                this.columns[0].op = 'Está dentro de'
                this.columns[0].val = dayjs().startOf('month').format('YYYY-MM-DD')
                this.columns[0].val1 = dayjs().format('YYYY-MM-DD')
            }
        },
        setQuery() {
            this.vista.qry = {
                fltr: { 'transaccion1.tipo': { op: 'Es', val: 5 } },
                incl: ['transaccion1', 'articulo1'],
                iccl: {
                    transaccion1: {
                        incl: ['socio1'],
                    },
                },
                page: this.vista.table_page,
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
        },
        async loadTransaccionItems() {
            this.setQuery()

            this.vista.transaccion_items = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.transaccion_items}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.transaccion_items = res.data
            this.vista.table_meta = res.meta
        },

        async openConfigFiltros() {
            const cols = this.columns
            for (const a of cols) {
                if (a.id == 'transaccion1.socio1.nombres') a.reload = this.loadSocios
            }

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadTransaccionItems,
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },

        runMethod(method, item) {
            this[method](item)
        },

        async loadSocios() {
            const qry = {
                fltr: { tipo: { op: 'Es', val: 2 }, activo: { op: 'Es', val: true } },
                cols: ['nombres', 'apellidos', 'nombres_apellidos'],
                ordr: [
                    ['nombres', 'ASC'],
                    ['apellidos', 'ASC'],
                ],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.socios}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code !== 0) return
            return (this.vista.socios = res.data)
        },
        setTransaccionItemCalidadRevisado(item) {
            const t_item = this.vista.transaccion_items.find((a) => a.id == item.transaccion_item)
            if (t_item) t_item.calidad_revisado = item.id
        },
    },
}
</script>

<style lang="scss" scoped></style>
