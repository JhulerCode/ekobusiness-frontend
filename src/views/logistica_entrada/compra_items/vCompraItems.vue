<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Artículos comprados</strong>
        </div>

        <JdTable
            :name="tableName"
            :columns="columns"
            :datos="vista.transaccion_items || []"
            :configFiltros="openConfigFiltros"
            :reload="loadTransaccionItems"
        >
            <!-- :colAct="true" -->
            <!-- :rowOptions="tableRowOptions" -->
            <!-- @rowOptionSelected="runMethod" -->
        </JdTable>
    </div>

    <mFormato v-if="useModals.show.mFormato" @created="setTransaccionItemCalidadRevisado" />

    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
import { JdTable, mConfigFiltros } from '@jhuler/components'

import mFormato from '@/views/calidad/formatos/mFormato.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get } from '@/utils/crud'

import dayjs from 'dayjs'

export default {
    components: {
        JdTable,

        mConfigFiltros,

        mFormato,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),
        dayjs,

        vista: {},

        tableName: 'vCompraItems',
        columns: [
            {
                id: 'fecha',
                title: 'Fecha',
                type: 'date',
                prop: 'fecha',
                format: 'date',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'transaccion1.guia',
                title: 'Guía',
                type: 'text',
                prop: 'transaccion1.guia',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'transaccion1.factura',
                title: 'Factura',
                type: 'text',
                prop: 'transaccion1.factura',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'transaccion1.socio',
                title: 'Proveedor',
                prop: 'transaccion1.socio1.nombres',
                type: 'select',
                mostrar: 'nombres_apellidos',
                width: '15rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'articulo1.nombre',
                title: 'Artículo',
                type: 'text',
                prop: 'articulo1.nombre',
                width: '20rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                type: 'number',
                format: 'decimal',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'pu',
                title: 'Valor unitario',
                type: 'number',
                format: 'decimal',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'lote',
                title: 'Lote',
                type: 'select',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'fv',
                title: 'Fecha de vencimiento',
                type: 'date',
                format: 'date',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
        ],
        // tableRowOptions: [
        //     {
        //         id: 1,
        //         label: 'Inspeccionar',
        //         icon: 'fa-solid fa-star',
        //         action: 'crearFormatoValue',
        //         permiso: 'vCompraItems:inspeccion',
        //     },
        // ],
    }),
    async created() {
        this.vista = this.useVistas.vCompraItems
        this.initFiltros()
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return

        if (this.useAuth.verifyPermiso('vCompraItems:listar') == true) this.loadTransaccionItems()
    },
    methods: {
        initFiltros() {
            this.columns[0].op = 'Está dentro de'
            this.columns[0].val = dayjs().startOf('month').format('YYYY-MM-DD')
            this.columns[0].val1 = dayjs().format('YYYY-MM-DD')
        },
        setQuery() {
            this.vista.qry = {
                fltr: { tipo: { op: 'Es', val: 1 } },
                incl: ['transaccion1', 'articulo1'],
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
            // this.vista.qry.cols.push('calidad_revisado')
        },
        async loadTransaccionItems() {
            this.setQuery()

            this.vista.transaccion_items = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.kardex}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.transaccion_items = res.data
        },

        async openConfigFiltros() {
            await this.loadSocios()

            const cols = this.columns
            cols.find((a) => a.id == 'transaccion1.socio').lista = this.vista.socios

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
        async crearFormatoValue(item) {
            const formato_id = 'RE-BPM-05.01'

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.formatos}/uno/${formato_id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useAuth.setLoading(true, 'Cargando...')
            const res1 = await get(`${urls.formato_values}/uno/${item.calidad_revisado}`)
            this.useAuth.setLoading(false)

            if (res1.code != 0) return

            if (res1.data == null) {
                const send = {
                    transaccion_item: item.id,
                    transaccion_item1: { ...item },
                    formato: {
                        codigo: res.data.id,
                        columns: res.data.columns,
                        instructivo: res.data.instructivo,
                    },
                }

                this.useModals.setModal('mFormato', formato_id, 1, send, true)
            } else {
                for (const a of res.data.columns) {
                    a.value = res1.data[a.id]
                }

                const send = {
                    transaccion_item: item.id,
                    transaccion_item1: res1.data.transaccion_item1,
                    formato: {
                        id: res1.data.id,
                        codigo: res.data.id,
                        columns: res.data.columns,
                        instructivo: res.data.instructivo,
                    },
                }

                this.useModals.setModal('mFormato', formato_id, 2, send, true)
            }
        },
        setTransaccionItemCalidadRevisado(item) {
            // console.log(item)
            const transaccion_item = this.vista.transaccion_items.find(
                (a) => a.id == item.transaccion_item,
            )
            if (transaccion_item) transaccion_item.calidad_revisado = item.id
        },

        async loadSocios() {
            const qry = {
                fltr: { tipo: { op: 'Es', val: 1 }, activo: { op: 'Es', val: true } },
                cols: ['nombres', 'apellidos', 'nombres_apellidos'],
            }

            this.vista.socios = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.socios}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code !== 0) return

            this.vista.socios = res.data
        },
    },
}
</script>

<style lang="scss" scoped></style>
