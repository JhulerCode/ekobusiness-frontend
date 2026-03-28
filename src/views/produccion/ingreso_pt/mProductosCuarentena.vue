<template>
    <JdModal
        modal="mProductosCuarentena"
        :buttons="buttons"
        @button-click="(action) => this[action]()"
    >
        <div class="container-datos">
            <JdInput
                type="date"
                label="Fecha de ingreso"
                :nec="true"
                v-model="modal.transaccion.fecha"
            />

            <JdButton
                icon="fa-solid fa-rotate-right"
                text="Recargar"
                tipo="3"
                @click="loadProduccionProductos"
            />
        </div>

        <JdTable
            :columns="columns"
            :datos="modal.produccion_productos || []"
            :reload="loadProduccionProductos"
            height="85%"
        >
            <template v-slot:cCantidad="{ item }">
                {{ redondear(item.cantidad, 0) }}
                <JdInput type="number" :toRight="true" v-model="item.cantidad_real" />
            </template>
        </JdTable>
    </JdModal>
</template>

<script>
import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, post } from '@/utils/crud'
import { jmsg } from '@/utils/swal'
import { redondear } from '@/utils/mine'

import dayjs from 'dayjs'

export default {
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),
        dayjs,
        redondear,

        modal: {},

        columns: [
            {
                id: 'fecha',
                title: 'Fecha',
                type: 'date',
                prop: 'fecha1',
                width: '8rem',
                show: true,
                sort: true,
            },
            {
                id: 'produccion_orden1.linea',
                title: 'Tipo',
                type: 'select',
                prop: 'produccion_orden1.linea1.nombre',
                width: '10rem',
                show: true,
                sort: true,
            },
            {
                id: 'maquina',
                title: 'Máquina',
                type: 'select',
                prop: 'maquina1.nombre',
                width: '8rem',
                show: true,
                sort: true,
            },
            {
                id: 'articulo1.nombre',
                title: 'Producto',
                type: 'text',
                prop: 'articulo1.nombre',
                width: '25rem',
                show: true,
                sort: true,
            },
            {
                id: 'lote',
                title: 'Lote',
                type: 'text',
                width: '7rem',
                show: true,
                sort: true,
            },
            {
                id: 'lote1.codigo',
                title: 'Lote',
                prop: 'lote1.codigo',
                width: '8rem',
                show: true,
            },
            {
                id: 'lote1.fv',
                title: 'F. vencimiento',
                prop: 'lote1.fv1',
                type: 'date',
                width: '8rem',
                show: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                slot: 'cCantidad',
                toRight: true,
                width: '8rem',
                show: true,
                sort: true,
            },
        ],

        buttons: [
            {
                text: 'Grabar',
                action: 'grabar',
                spin: false,
                show: true,
                permiso: 'vPtsIngresos:ingresarPts',
            },
        ],
    }),
    created() {
        this.modal = this.useModals.mProductosCuarentena

        this.initTransaccion()
        this.loadProduccionProductos()
    },
    computed: {
        produccion_ordenes_pts_reales() {
            return this.modal.produccion_productos.filter(
                (a) => a.cantidad_real != null && a.cantidad_real != '',
            )
        },
    },
    methods: {
        initTransaccion() {
            this.modal.transaccion = {
                fecha: dayjs().format('YYYY-MM-DD'),
            }
        },
        setQuery() {
            this.modal.qry = {
                fltr: {
                    tipo: { op: 'Es', val: 4 },
                    pt_cuarentena: { op: 'Es', val: true },
                },
                incl: ['articulo1', 'lote1', 'produccion_orden1', 'maquina1'],
                iccl: {
                    produccion_orden1: {
                        incl: ['linea1', 'responsable1'],
                    },
                },
                ordr: [
                    ['fecha', 'DESC'],
                    ['createdAt', 'DESC'],
                ],
            }

            this.useAuth.updateQuery(this.columns, this.modal.qry)
            this.modal.qry.cols.push('tipo', 'lote_id')
        },
        async loadProduccionProductos() {
            this.modal.produccion_productos = []

            this.setQuery()

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.kardex}?qry=${JSON.stringify(this.modal.qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.produccion_productos = res.data
        },
        checkDatos() {
            if (this.produccion_ordenes_pts_reales.length == 0) {
                jmsg('error', 'No se ha ingresado ninguna cantidad real')
                return true
            }

            return false
        },
        shapeDatos() {
            this.modal.transaccion.produccion_ordenes_pts_reales =
                this.produccion_ordenes_pts_reales
        },
        async grabar() {
            if (this.checkDatos()) return

            this.shapeDatos()

            this.useAuth.setLoading(true, 'Grabando...')
            const res = await post(
                `${urls.kardex}/produccion-productos-terminados`,
                this.modal.transaccion,
            )
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            for (const a of this.produccion_ordenes_pts_reales) {
                this.useVistas.addItem(
                    'vPtsIngresos',
                    'tableData',
                    { ...a, cantidad: a.cantidad_real },
                    'first',
                )
            }
            this.useModals.show.mProductosCuarentena = false
        },
    },
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: 20rem;
    gap: 1rem;
    margin-bottom: 1rem;
}
</style>
