<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Ingreso de productos terminados</strong>

            <div class="buttons">
                <JdButton
                    text="Ver cuarentena"
                    @click="verCuarentena()"
                    v-if="useAuth.verifyPermiso('vPtsIngresos:verCuarentena')"
                />
            </div>
        </div>

        <JdTable
            :name="tableName"
            :columns="columns"
            :datos="vista.produccion_productos || []"
            :colAct="true"
            :configFiltros="openConfigFiltros"
            :reload="loadTransacciones"
            :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod"
            :meta="vista.table_meta"
            @prevPage="((vista.table_page -= 1), loadTransacciones())"
            @nextPage="((vista.table_page += 1), loadTransacciones())"
        />
    </div>

    <mFormato v-if="useModals.show.mFormato" @created="setLoteAprobado" />
    <mProduccionTrazabilidad v-if="useModals.show.mProduccionTrazabilidad" />
    <mProductosCuarentena v-if="useModals.show.mProductosCuarentena" />

    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
import { JdButton, JdTable, mConfigFiltros } from '@jhuler/components'

import mProductosCuarentena from '@/views/produccion/ingreso_pt/mProductosCuarentena.vue'
import mFormato from '@/views/calidad/formatos/mFormato.vue'
import mProduccionTrazabilidad from '@/views/produccion/historial/mProduccionTrazabilidad.vue'

import { useModals } from '@/pinia/modals'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'

import { urls, get } from '@/utils/crud'
import { jmsg } from '@/utils/swal.js'

import dayjs from 'dayjs'

export default {
    components: {
        JdButton,
        JdTable,

        mConfigFiltros,

        mProductosCuarentena,
        mFormato,
        mProduccionTrazabilidad,
    },
    data: () => ({
        useModals: useModals(),
        useAuth: useAuth(),
        useVistas: useVistas(),
        dayjs,

        vista: {},

        tableName: 'vPtsIngresos',
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
                id: 'produccion_orden1.linea',
                title: 'Tipo',
                type: 'select',
                prop: 'produccion_orden1.linea1.nombre',
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
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'articulo1.nombre',
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
            // {
            //     label: 'Liberación de lote',
            //     icon: 'fa-solid fa-star',
            //     action: 'liberarLote',
            //     permiso: 'vPtsIngresos:liberar_lote',
            // },
            {
                label: 'Ver trazabilidad',
                icon: 'fa-solid fa-diagram-project',
                action: 'verTrazabilidad',
                permiso: 'vPtsIngresos:trazabilidad',
            },
        ],
    }),
    async created() {
        this.vista = this.useVistas.vPtsIngresos
        this.initFiltros()
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return
        this.vista.table_page = 1
        if (this.useAuth.verifyPermiso('vPtsIngresos:listar') == true) this.loadTransacciones()
    },
    methods: {
        initFiltros() {
            this.columns[0].op = 'Está dentro de'
            this.columns[0].val = dayjs().startOf('month').format('YYYY-MM-DD')
            this.columns[0].val1 = dayjs().format('YYYY-MM-DD')
        },
        setQuery() {
            this.vista.qry = {
                fltr: {
                    tipo: { op: 'Es', val: 4 },
                    is_lote_padre: { op: 'No es', val: null },
                },
                incl: ['articulo1', 'maquina1', 'produccion_orden1'],
                iccl: {
                    produccion_orden1: {
                        incl: ['linea1'],
                    },
                },
                page: this.vista.table_page,
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
        },
        async loadTransacciones() {
            this.vista.produccion_productos = []

            this.setQuery()

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.kardex}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.produccion_productos = res.data
            this.vista.table_meta = res.meta
        },

        async verCuarentena() {
            // const send = {
            //     transaccion: {
            //         tipo: 4,
            //         fecha: dayjs().format('YYYY-MM-DD'),
            //         estado: 1,
            //     },
            // }

            this.useModals.setModal(
                'mProductosCuarentena',
                'Productos en cuarentena',
                null,
                null,
                // true,
            )
        },

        async openConfigFiltros() {
            const cols = this.columns
            for (const a of cols) {
                if (a.id == 'produccion_orden1.linea') a.reload = this.loadLineas
                if (a.id == 'maquina') a.reload = this.loadMaquinas
            }

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadTransacciones,
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },

        runMethod(method, item) {
            this[method](item)
        },
        async liberarLote(item) {
            const formato_id = 'RE-BPM-26'

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.formatos}/uno/${formato_id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const formato_name = res.data.nombre

            this.useAuth.setLoading(true, 'Cargando...')
            const res1 = await get(`${urls.formato_values}/uno/${item.cf_liberacion_lote}`)
            this.useAuth.setLoading(false)

            if (res1.code != 0) return

            if (res1.data == null) {
                const send = {
                    cuarentena_producto: item.id,
                    cuarentena_producto1: { ...item },
                    formato: {
                        codigo: res.data.id,
                        columns: res.data.columns,
                        instructivo: res.data.instructivo,
                    },
                }

                this.useModals.setModal('mFormato', `${formato_id} ${formato_name}`, 1, send, true)
            } else {
                for (const a of res.data.columns) {
                    a.value = res1.data[a.id]
                }

                const send = {
                    cuarentena_producto: item.id,
                    cuarentena_producto1: res1.data.cuarentena_producto1,
                    formato: {
                        id: res1.data.id,
                        codigo: res.data.id,
                        columns: res.data.columns,
                        instructivo: res.data.instructivo,
                    },
                }

                this.useModals.setModal('mFormato', `${formato_id} ${formato_name}`, 2, send, true)
            }
        },
        setLoteAprobado(item) {
            const cuanrentena_producto = this.vista.produccion_productos.find(
                (a) => a.id == item.cuarentena_producto,
            )
            cuanrentena_producto.cf_liberacion_lote = item.id
        },
        async verTrazabilidad(item) {
            const qry = {
                incl: ['articulo1', 'maquina1'],
            }

            this.useAuth.setLoading(true, 'Cargando trazabilidad...')
            const res = await get(
                `${urls.produccion_ordenes}/uno/${item.produccion_orden1.id}?qry=${JSON.stringify(qry)}`,
            )
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

            this.useModals.setModal('mProduccionTrazabilidad', 'Trazabilidad', 3, send, true)
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
            return res.data
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
            return res.data
        },
    },
}
</script>

<style lang="scss" scoped></style>
