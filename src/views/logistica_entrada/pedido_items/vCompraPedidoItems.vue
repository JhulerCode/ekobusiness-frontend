<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Artículos pedidos</strong>
        </div>

        <JdTable
            :name="tableName"
            :columns="columns"
            :datos="vista.transaccion_items || []"
            :configFiltros="openConfigFiltros"
            :reload="loadPedidoItems"
        >
            <!-- :colAct="true"
            :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod" -->
        </JdTable>
    </div>

    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
import { JdTable, mConfigFiltros } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get } from '@/utils/crud'

import dayjs from 'dayjs'

export default {
    components: {
        JdTable,

        mConfigFiltros,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),
        dayjs,

        vista: {},

        tableName: 'vCompraPedidoItems',
        columns: [
            {
                id: 'socio_pedido1.fecha',
                title: 'Fecha',
                prop: 'socio_pedido1.fecha',
                type: 'date',
                format: 'date',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'socio_pedido1.codigo',
                title: 'Nro pedido',
                prop: 'socio_pedido1.codigo',
                type: 'text',
                width: '11rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'socio_pedido1.socio',
                title: 'Proveedor',
                prop: 'socio_pedido1.socio1.nombres',
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
                id: 'pu',
                title: 'Valor unitario',
                type: 'number',
                toRight: true,
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                type: 'number',
                format: 'decimal',
                toRight: true,
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'entregado',
                title: 'Entregado',
                type: 'number',
                format: 'decimal',
                toRight: true,
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
        //         permiso: 'vCompraPedidoItems:inspeccion',
        //     },
        // ],
    }),
    async created() {
        this.vista = this.useVistas.vCompraPedidoItems
        this.initFiltros()
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return

        if (this.useAuth.verifyPermiso('vCompraPedidoItems:listar') == true) this.loadPedidoItems()
    },
    methods: {
        initFiltros() {
            this.columns[0].op = 'Está dentro de'
            this.columns[0].val = dayjs().startOf('month').format('YYYY-MM-DD')
            this.columns[0].val1 = dayjs().format('YYYY-MM-DD')
        },
        setQuery() {
            this.vista.qry = {
                fltr: { 'socio_pedido1.tipo': { op: 'Es', val: 1 } },
                incl: ['socio_pedido1', 'articulo1'],
                iccl: {
                    socio_pedido1: {
                        incl: ['socio1'],
                    }
                }
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
        },
        async loadPedidoItems() {
            this.setQuery()

            this.vista.transaccion_items = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(
                `${urls.socio_pedido_items}?qry=${JSON.stringify(this.vista.qry)}`,
            )
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.transaccion_items = res.data
        },

        async openConfigFiltros() {
            await this.loadSocios()

            const cols = this.columns
            cols.find((a) => a.id == 'socio_pedido1.socio').lista = this.vista.socios

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadPedidoItems,
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },

        runMethod(method, item) {
            this[method](item)
        },

        async loadSocios() {
            const qry = {
                fltr: { tipo: { op: 'Es', val: 1 }, activo: { op: 'Es', val: true } },
                cols: ['nombres', 'apellidos', 'nombres_apellidos'],
                ordr: [
                    ['nombres', 'ASC'],
                    ['apellidos', 'ASC'],
                ],
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
