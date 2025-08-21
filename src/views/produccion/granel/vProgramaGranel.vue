<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Programa de producción granel</strong>

            <div class="buttons">
                <JdButton
                    text="Ver productos pedidos"
                    tipo="2"
                    @click="verPedidos"
                    v-if="useAuth.verifyPermiso('vProgramaGranel:verProductosPedidos')"
                />

                <JdButton
                    text="Nuevo"
                    @click="nuevo"
                    v-if="useAuth.verifyPermiso('vProgramaGranel:crear')"
                />
            </div>
        </div>

        <JdTable
            :columns="columns"
            :datos="vista.produccion_ordenes || []"
            :colAct="true"
            :reload="loadProduccionOrdenes"
            :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod"
        >
        </JdTable>
    </div>

    <mProduccionOrden v-if="useModals.show.mProduccionOrden" />
    <mProduccionInsumos v-if="useModals.show.mProduccionInsumos" />
    <mProduccionProductos
        v-if="useModals.show.mProduccionProductos"
        @productosCargados="setProduccionProductos"
    />
    <mProductosFaltantes v-if="useModals.show.mProductosFaltantes" />
</template>

<script>
import JdTable from '@/components/JdTable.vue'
import JdButton from '@/components/inputs/JdButton.vue'

import mProduccionOrden from '@/views/produccion/historial/mProduccionOrden.vue'
import mProduccionInsumos from '@/views/produccion/historial/mProduccionInsumos.vue'
import mProduccionProductos from '@/views/produccion/historial/mProduccionProductos.vue'
import mProductosFaltantes from '@/views/produccion/filtrante/mProductosFaltantes.vue'

import { useModals } from '@/pinia/modals'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'

import { urls, get, delet, patch } from '@/utils/crud'
import { jqst } from '@/utils/swal'

import dayjs from 'dayjs'

export default {
    components: {
        JdTable,
        JdButton,
        mProduccionOrden,

        mProduccionInsumos,
        mProduccionProductos,
        mProductosFaltantes,
    },
    data: () => ({
        useModals: useModals(),
        useAuth: useAuth(),
        useVistas: useVistas(),
        dayjs,

        vista: {},

        columns: [
            {
                id: 'fecha',
                title: 'Fecha',
                format: 'date',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'orden',
                title: 'Prioridad',
                width: '7rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'articulo',
                title: 'Producto',
                prop: 'articulo1.nombre',
                width: '25rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                format: 'number',
                toRight: true,
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'productos_terminados',
                title: 'Productos terminados',
                type: 'number',
                format: 'number',
                toRight: true,
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
        ],
        tableRowOptions: [
            {
                label: 'Ver',
                icon: 'fa-solid fa-folder-open',
                action: 'ver',
                permiso: 'vProgramaGranel:crear',
            },
            {
                label: 'Editar',
                icon: 'fa-solid fa-pen-to-square',
                action: 'editar',
                permiso: 'vProgramaGranel:editar',
                ocultar: { estado: 2 },
            },
            {
                label: 'Eliminar',
                icon: 'fa-solid fa-trash-can',
                action: 'eliminar',
                permiso: 'vProgramaGranel:eliminar',
                ocultar: { estado: 2 },
            },
            {
                label: 'Terminar',
                icon: 'fa-solid fa-check-double',
                action: 'terminar',
                permiso: 'vProgramaGranel:terminar',
                ocultar: { estado: 2 },
            },
            {
                label: 'Productos terminados',
                icon: 'fa-solid fa-boxes-stacked',
                action: 'productosTerminados',
                permiso: 'vProgramaGranel:productosTerminados',
            },
        ],
    }),
    created() {
        this.vista = this.useVistas.vProgramaGranel

        if (this.vista.loaded) return
        if (this.useAuth.verifyPermiso('vProgramaGranel:listar') == true)
            this.loadProduccionOrdenes()
    },
    methods: {
        setQuery() {
            this.vista.qry = {
                fltr: { tipo: { op: 'Es', val: 2 }, estado: { op: 'Es', val: 1 } },
                cols: [
                    'fecha',
                    'orden',
                    'maquina',
                    'maquina_info',
                    'articulo',
                    'articulo_info',
                    'cantidad',
                    'estado',
                ],
            }
        },
        async loadProduccionOrdenes() {
            this.vista.produccion_ordenes = []
            this.setQuery()

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(
                `${urls.produccion_ordenes}?qry=${JSON.stringify(this.vista.qry)}`,
            )
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.produccion_ordenes = res.data
        },

        nuevo() {
            const send = {
                produccion_orden: {
                    fecha: dayjs().format('YYYY-MM-DD'),
                    tipo: 2,
                    estado: 1,
                    orden: this.vista.produccion_ordenes.length + 1,
                },
            }

            this.useModals.setModal('mProduccionOrden', 'Nueva órden de producción', 1, send, true)
        },
        async verPedidos() {
            const send = {
                produccion_tipo: 2,
            }

            this.useModals.setModal('mProductosFaltantes', 'Productos pedidos', null, send, true)
        },

        runMethod(method, item) {
            this[method](item)
        },
        async ver(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.produccion_ordenes}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const send = {
                produccion_orden: res.data,
                articulos: [
                    {
                        id: res.data.articulo,
                        ...res.data.articulo_info,
                    },
                ],
                // maquinas: [{
                //     id: res.data.maquina,
                //     ...res.data.maquina1
                // }]
            }

            this.useModals.setModal('mProduccionOrden', 'Ver órden de producción', 3, send, true)
        },
        async editar(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.produccion_ordenes}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const send = {
                produccion_orden: res.data,
                articulos: [
                    {
                        id: res.data.articulo,
                        ...res.data.articulo_info,
                    },
                ],
            }

            this.useModals.setModal('mProduccionOrden', 'Editar órden de producción', 2, send, true)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.produccion_ordenes, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vProgramaGranel', 'produccion_ordenes', item)
        },
        async terminar(item) {
            const resQst = await jqst('¿Está seguro de terminar la orden de producción?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await patch(
                `${urls.produccion_ordenes}/terminar`,
                item,
                'Orden de producción terminada',
            )
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.updateItem('vProgramaGranel', 'produccion_ordenes', {
                ...item,
                estado: 2,
            })
        },
        // async salidaInsumos(item) {
        //     this.useAuth.setLoading(true, 'Cargando...')
        //     const res = await get(`${urls.produccion_ordenes}/uno/${item.id}`)
        //     this.useAuth.setLoading(false)

        //     if (res.code != 0) return

        //     const send = {
        //         transaccion: {
        //             tipo: 2,
        //             fecha: dayjs().format('YYYY-MM-DD'),
        //             produccion_orden: item.id,
        //             estado: 1,
        //             transaccion_items: [],

        //             produccion_orden1: {
        //                 fecha: res.data.fecha,
        //                 // codigo: res.data.codigo,
        //                 cantidad: res.data.cantidad,
        //                 articulo_info: {
        //                     nombre: res.data.articulo_info.nombre,
        //                 },
        //                 insumos: res.data.articulo_info.receta_insumos.map(
        //                     ({ articulo1, ...rest }) => ({
        //                         ...rest,
        //                         ...articulo1,
        //                     }),
        //                 ),
        //             },
        //         },
        //     }

        //     this.useModals.setModal('mProduccionInsumos', `Salida de insumos`, 1, send, true)
        // },
        productosTerminados(item) {
            const send = {
                produccion_orden: { ...item },
            }

            this.useModals.setModal(
                'mProduccionProductos',
                `Productos terminados`,
                null,
                send,
                true,
            )
        },
        setProduccionProductos(item) {
            const pr = this.vista.produccion_ordenes.find((a) => a.id == item.id)
            pr.productos_terminados = item.productos_terminados
        },
    },
}
</script>

<style lang="scss" scoped></style>
