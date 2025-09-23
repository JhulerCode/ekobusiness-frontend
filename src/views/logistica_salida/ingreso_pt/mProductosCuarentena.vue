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
        </div>

        <JdTable
            :columns="columns"
            :datos="modal.produccion_productos || []"
            :reload="loadProduccionProductos"
            height="85%"
        >
            <template v-slot:cCantidad="{ item }">
                {{ redondear(item.cantidad, 0) }}
                <JdInput type="number" v-model="item.cantidad_real" />
            </template>
        </JdTable>
    </JdModal>
</template>

<script>
import { JdModal, JdInput, JdTable } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, post } from '@/utils/crud'
import { jmsg } from '@/utils/swal'
import { redondear } from '@/utils/mine'
// import { produccion_tipos, maquinas } from '@/data/sistema_listas'

import dayjs from 'dayjs'

export default {
    components: {
        JdModal,
        JdTable,
        JdInput,
    },
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
                format: 'date',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'produccion_orden_tipo',
                title: 'Tipo',
                type: 'select',
                prop: 'produccion_orden1.tipo1.nombre',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'produccion_orden_maquina',
                title: 'Máquina',
                type: 'select',
                prop: 'produccion_orden1.maquina1.nombre',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'articulo_nombre',
                title: 'Producto',
                type: 'text',
                prop: 'articulo1.nombre',
                width: '25rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'lote',
                title: 'Lote',
                type: 'text',
                width: '7rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'fv',
                title: 'F. vencimiento',
                type: 'date',
                format: 'date',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                slot: 'cCantidad',
                toRight: true,
                width: '8rem',
                show: true,
                seek: true,
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
                    is_lote_padre: { op: 'Es', val: null },
                },
                incl: ['articulo1', 'produccion_orden1'],
            }

            this.useAuth.updateQuery(this.columns, this.modal.qry)
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
        // async grabar1() {
        //     const send = this.modal.produccion_productos.filter(
        //         (a) => a.cantidad_real != null && a.cantidad_real != '',
        //     )

        //     if (send.length == 0) {
        //         jmsg('error', 'No se ha ingresado ninguna cantidad real')
        //         return
        //     }

        //     this.modal.transaccion.transaccion_items = send

        //     console.log(this.modal.transaccion)
        // },
        async grabar() {
            const send = this.modal.produccion_productos.filter(
                (a) => a.cantidad_real != null && a.cantidad_real != '',
            )

            if (send.length == 0) {
                jmsg('error', 'No se ha ingresado ninguna cantidad real')
                return
            }

            this.modal.transaccion.transaccion_items = send

            this.useAuth.setLoading(true, 'Grabando...')
            const res = await post(
                `${urls.kardex}/produccion-productos-terminados`,
                this.modal.transaccion,
            )
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.show.mProductosCuarentena = false
        },
    },
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: 20rem;
    margin-bottom: 2rem;
}
</style>
