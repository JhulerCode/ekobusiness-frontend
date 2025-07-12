<template>
    <JdModal modal="mProductosCuarentena" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <JdInput type="date" label="Fecha de ingreso" :nec="true" v-model="modal.transaccion.fecha" />
        </div>

        <JdTable :columns="columns" :datos="modal.articulos || []" :reload="loadProductosCuarentena">
            <template v-slot:cCantidad="{ item }">
                {{ redondear(item.cantidad, 0) }}
                <JdInput type="number" v-model="item.cantidad_real" />
            </template>
        </JdTable>
    </JdModal>
</template>

<script>
import JdModal from '@/components/JdModal.vue'
import JdTable from '@/components/JdTable.vue'
import JdInput from '@/components/inputs/JdInput.vue'

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
                prop: 'produccion_orden1.fecha',
                format: 'date',
                width: '7rem',
                show: true,
                seek: true,
            },
            {
                id: 'tipo',
                title: 'Tipo',
                prop: 'produccion_orden1.tipo1.nombre',
                width: '8rem',
                show: true,
                seek: true,
            },
            {
                id: 'maquina',
                title: 'Máquina',
                prop: 'produccion_orden1.maquina1.nombre',
                width: '7rem',
                show: true,
                seek: true,
            },
            {
                id: 'articulo',
                title: 'Articulo',
                prop: 'produccion_orden1.articulo1.nombre',
                width: '25rem',
                show: true,
                seek: true,
            },
            {
                id: 'lote',
                title: 'Lote',
                width: '7rem',
                show: true,
                seek: true,
            },
            {
                id: 'fv',
                title: 'F. vencimiento',
                format: 'date',
                width: '7rem',
                show: true,
                seek: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                slot: 'cCantidad',
                toRight: true,
                width: '7rem',
                show: true
            },
        ],

        buttons: [
            { text: 'Grabar', action: 'grabar', spin: false, show: true, permiso: 'vPtsIngresos_ingresarPts' },
        ],
    }),
    created() {
        this.modal = this.useModals.mProductosCuarentena
        this.loadProductosCuarentena()
    },
    methods: {
        async loadProductosCuarentena() {
            const qry = {
                fltr: { estado: { op: 'Es', val: 1 } },
                cols: ['lote', 'fv', 'cantidad', 'produccion_orden'],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.cuarentena_productos}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.articulos = res.data
        },
        async grabar() {
            const send = this.modal.articulos.filter(a => a.cantidad_real != null && a.cantidad_real != '')

            if (send.length == 0) {
                jmsg('error', 'No se ha ingresado ninguna cantidad real')
                return
            }

            this.modal.transaccion.transaccion_items = send

            this.useAuth.setLoading(true, 'Grabando...')
            const res = await post(`${urls.transacciones}/productos-terminados`, this.modal.transaccion)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            // this.useVistas.addItem('vPtsIngresos', 'transacciones', res.data)
            this.useModals.show.mProductosCuarentena = false
        }
    }
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: 20rem;
    margin-bottom: 2rem;
}
</style>