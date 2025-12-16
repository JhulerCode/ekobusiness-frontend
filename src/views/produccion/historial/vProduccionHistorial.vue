<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Órdenes de producción</strong>

            <div class="buttons">
                <JdButton
                    text="Salida de insumos"
                    tipo="2"
                    @click="salidaInsumosCompartidos"
                    v-if="useAuth.verifyPermiso('vProduccionHistorial:salidaInsumos')"
                />
            </div>
        </div>

        <JdTable
            :name="tableName"
            :columns="columns"
            :datos="vista.produccion_ordenes || []"
            :colAct="true"
            :configFiltros="openConfigFiltros"
            :reload="loadProduccionOrdenes"
            :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod"
        >
        </JdTable>
    </div>

    <mProduccionOrden v-if="useModals.show.mProduccionOrden" />
    <!-- <mProduccionInsumos v-if="useModals.show.mProduccionInsumos" /> -->
    <!-- <mProduccionProductos v-if="useModals.show.mProduccionProductos" /> -->
    <mFormato v-if="useModals.show.mFormato" @created="setFormatoCalidad" />
    <mProduccionTrazabilidad v-if="useModals.show.mProduccionTrazabilidad" />
    <mProduccionInsumosCompartidos v-if="useModals.show.mProduccionInsumosCompartidos" />

    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
import { JdTable, JdButton, mConfigFiltros } from '@jhuler/components'

import mProduccionOrden from '@/views/produccion/historial/mProduccionOrden.vue'
import mProduccionInsumosCompartidos from '@/views/produccion/historial/mProduccionInsumosCompartidos.vue'
// import mProduccionInsumos from '@/views/produccion/historial/mProduccionInsumos.vue'
// import mProduccionProductos from '@/views/produccion/historial/mProduccionProductos.vue'
import mFormato from '@/views/calidad/formatos/mFormato.vue'
import mProduccionTrazabilidad from '@/views/produccion/historial/mProduccionTrazabilidad.vue'

import { useModals } from '@/pinia/modals'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'

import { urls, get } from '@/utils/crud'

import dayjs from 'dayjs'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdTable,
        JdButton,

        mConfigFiltros,

        mProduccionOrden,
        mProduccionInsumosCompartidos,
        // mProduccionInsumos,
        // mProduccionProductos,
        mFormato,
        mProduccionTrazabilidad,
    },
    data: () => ({
        useModals: useModals(),
        useAuth: useAuth(),
        useVistas: useVistas(),
        dayjs,

        vista: {},

        tableName: 'vProduccionHistorial',
        columns: [
            {
                id: 'fecha',
                title: 'Fecha',
                type: 'date',
                format: 'date',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'tipo',
                title: 'Tipo de producción',
                type: 'select',
                prop: 'tipo1.nombre',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'maquina',
                title: 'Máquina',
                type: 'select',
                prop: 'maquina1.nombre',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'articulo1.nombre',
                title: 'Producto',
                prop: 'articulo1.nombre',
                type: 'text',
                width: '25rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad planificada',
                type: 'number',
                format: 'number',
                toRight: true,
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'estado',
                title: 'Estado',
                prop: 'estado1.nombre',
                type: 'select',
                format: 'estado',
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
                filtrable: false,
                toRight: true,
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'estado_calidad_revisado',
                title: 'Control de pesos',
                prop: 'estado_calidad_revisado1.nombre',
                format: 'estado',
                filtrable: false,
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'estado_cf_ppc',
                title: 'Control del PPC',
                prop: 'estado_cf_ppc1.nombre',
                format: 'estado',
                filtrable: false,
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'createdBy',
                title: 'Creado por',
                prop: 'createdBy1.nombres_apellidos',
                filtrable: false,
                width: '10rem',
                show: true,
            },
        ],
        tableRowOptions: [
            {
                label: 'Ver',
                icon: 'fa-solid fa-folder-open',
                action: 'ver',
                permiso: 'vProduccionHistorial:ver',
            },
            {
                label: 'Ver trazabilidad',
                icon: 'fa-solid fa-diagram-project',
                action: 'verTrazabilidad',
                permiso: 'vProduccionHistorial:trazabilidad',
            },
            {
                label: 'Control de pesos',
                icon: 'fa-solid fa-star',
                action: 'controlPesos',
                permiso: 'vProduccionHistorial:controlPesos',
            },
            {
                label: 'Control del PPC',
                icon: 'fa-solid fa-star',
                action: 'controlPpc',
                permiso: 'vProduccionHistorial:controlPpc',
            },
        ],
    }),
    created() {
        this.vista = this.useVistas.vProduccionHistorial
        this.initFiltros()
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return
        if (this.useAuth.verifyPermiso('vProduccionHistorial:listar') == true)
            this.loadProduccionOrdenes()
    },
    methods: {
        initFiltros() {
            this.columns[0].op = 'Está dentro de'
            this.columns[0].val = dayjs().startOf('month').format('YYYY-MM-DD')
            this.columns[0].val1 = dayjs().format('YYYY-MM-DD')
        },
        setQuery() {
            this.vista.qry = {
                fltr: {},
                incl: ['tipo1', 'maquina1', 'articulo1', 'createdBy1'],
                ordr: [
                    ['fecha', 'DESC'],
                    ['createdAt', 'DESC'],
                ],
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
            this.vista.qry.cols.push('articulo')
        },
        async loadProduccionOrdenes() {
            this.setQuery()

            this.vista.produccion_ordenes = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(
                `${urls.produccion_ordenes}?qry=${JSON.stringify(this.vista.qry)}`,
            )
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.produccion_ordenes = res.data
        },
        async loadDatosSistema() {
            const qry = ['produccion_orden_estados']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.vista, res.data)
        },
        async loadLineas() {
            const qry = {
                fltr: {},
                cols: ['nombre'],
                ordr: [['nombre', 'ASC']],
            }

            this.vista.articulo_lineas = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulo_lineas}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.vista.articulo_lineas = res.data
        },
        async loadMaquinas() {
            const qry = {
                fltr: { tipo: { op: 'Es', val: 1 } },
                cols: ['codigo', 'nombre', 'linea', 'velocidad', 'limpieza_tiempo'],
                ordr: [['nombre', 'ASC']],
            }

            this.vista.maquinas = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.maquinas}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.vista.maquinas = res.data
        },

        async openConfigFiltros() {
            await this.loadDatosSistema()
            await this.loadMaquinas()
            await this.loadLineas()

            const cols = this.columns
            cols.find((a) => a.id == 'tipo').lista = this.vista.articulo_lineas
            cols.find((a) => a.id == 'maquina').lista = this.vista.maquinas
            cols.find((a) => a.id == 'estado').lista = this.vista.produccion_orden_estados

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadProduccionOrdenes,
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
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
                maquinas: [
                    {
                        id: res.data.maquina,
                        ...res.data.maquina1,
                    },
                ],
            }

            this.useModals.setModal('mProduccionOrden', 'Ver órden de producción', 3, send, true)
        },
        // async editar(item) {
        //     this.useAuth.setLoading(true, 'Cargando...')
        //     const res = await get(`${urls.produccion_ordenes}/uno/${item.id}`)
        //     this.useAuth.setLoading(false)

        //     if (res.code != 0) return

        //     const send = {
        //         produccion_orden: res.data,
        //         articulos: [
        //             {
        //                 id: res.data.articulo,
        //                 ...res.data.articulo_info,
        //             },
        //         ],
        //     }

        //     this.useModals.setModal('mProduccionOrden', 'Editar órden de producción', 2, send, true)
        // },
        // async salidaInsumos(item) {
        //     this.useAuth.setLoading(true, 'Cargando...')
        //     const res = await get(`${urls.produccion_ordenes}/uno/${item.id}`)
        //     this.useAuth.setLoading(false)

        //     if (res.code != 0) return

        //     const send = {
        //         is_receta: true,
        //         produccion_orden: JSON.parse(JSON.stringify(res.data)),
        //     }

        //     this.useModals.setModal('mProduccionInsumos', `Salida de insumos`, 1, send, true)
        // },
        // productosTerminados(item) {
        //     const send = {
        //         produccion_orden: { ...item },
        //     }

        //     this.useModals.setModal(
        //         'mProduccionProductos',
        //         `Productos terminados`,
        //         null,
        //         send,
        //         true,
        //     )
        // },
        async verTrazabilidad(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.produccion_ordenes}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return
            if (res.data == null) return jmsg('warning', 'La órden de producción no existe')

            const send = {
                produccion_orden: res.data,
                articulos: [
                    {
                        id: res.data.articulo,
                        ...res.data.articulo1,
                    },
                ],
                maquinas: [
                    {
                        id: res.data.maquina,
                        ...res.data.maquina1,
                    },
                ],
            }

            this.useModals.setModal('mProduccionTrazabilidad', 'Trazabilidad', null, send, true)
        },
        async controlPesos(item) {
            let formato_id = 'RE-BPM-06'

            if (item.tipo == 2) {
                formato_id = 'RE-BPM-08'
            } else if (item.tipo == 3) {
                formato_id = 'RE-BPM-07'
            }

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
                    produccion_orden: item.id,
                    produccion_orden1: { ...item },
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
                    produccion_orden: item.id,
                    produccion_orden1: res1.data.produccion_orden1,
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
        async controlPpc(item) {
            let formato_id = 'RE-HACCP 03'

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.formatos}/uno/${formato_id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useAuth.setLoading(true, 'Cargando...')
            const res1 = await get(`${urls.formato_values}/uno/${item.cf_ppc}`)
            this.useAuth.setLoading(false)

            if (res1.code != 0) return

            if (res1.data == null) {
                const send = {
                    produccion_orden: item.id,
                    produccion_orden1: { ...item },
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
                    produccion_orden: item.id,
                    produccion_orden1: res1.data.produccion_orden1,
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
        setFormatoCalidad(item) {
            const produccion_orden = this.vista.produccion_ordenes.find(
                (a) => a.id == item.produccion_orden,
            )
            if (
                item.codigo == 'RE-BPM-06' ||
                item.codigo == 'RE-BPM-07' ||
                item.codigo == 'RE-BPM-08'
            ) {
                produccion_orden.calidad_revisado = item.id
            }

            if (item.codigo == 'RE-HACCP 03') {
                produccion_orden.cf_ppc = item.id
            }
        },

        salidaInsumosCompartidos() {
            const send = {
                transaccion: {
                    tipo: 2,
                    fecha: dayjs().format('YYYY-MM-DD'),
                },
            }

            this.useModals.setModal(
                'mProduccionInsumosCompartidos',
                `Salida de insumos`,
                null,
                send,
                true,
            )
        },
    },
}
</script>

<style lang="scss" scoped></style>
