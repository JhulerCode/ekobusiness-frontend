<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Productos terminados</strong>

            <div class="buttons"></div>
        </div>

        <JdTable
            :name="tableName"
            :columns="columns"
            :datos="vista.produccion_productos || []"
            :colAct="true"
            :configFiltros="openConfigFiltros"
            :reload="loadProduccionProductos"
            :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod"
        >
        </JdTable>
    </div>

    <mFormato v-if="useModals.show.mFormato" @created="setLoteAprobado" />
    <mProduccionTrazabilidad v-if="useModals.show.mProduccionTrazabilidad" />

    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
import { JdTable, mConfigFiltros } from '@jhuler/components'

import mFormato from '@/views/calidad/formatos/mFormato.vue'
import mProduccionTrazabilidad from '@/views/produccion/historial/mProduccionTrazabilidad.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get } from '@/utils/crud'
import { redondear } from '@/utils/mine'

import dayjs from 'dayjs'

export default {
    components: {
        // JdModal,
        // JdInput,
        JdTable,
        mConfigFiltros,

        mFormato,
        mProduccionTrazabilidad,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),
        dayjs,
        redondear,

        vista: {},

        tableName: 'vProduccionCuarentena',
        columns: [
            {
                id: 'fecha',
                title: 'Fecha',
                type: 'date',
                format: 'date',
                width: '7rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'produccion_orden1.tipo',
                title: 'Tipo',
                type: 'select',
                prop: 'produccion_orden1.tipo1.nombre',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'maquina',
                title: 'Máquina',
                type: 'select',
                prop: 'maquina1.nombre',
                width: '7rem',
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
                width: '7rem',
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
                width: '7rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'producto_estado',
                title: 'Estado',
                prop: 'producto_estado1.nombre',
                format: 'estado',
                filtrable: false,
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
        ],
        tableRowOptions: [
            {
                label: 'Liberación de lote',
                icon: 'fa-solid fa-star',
                action: 'liberarLote',
                permiso: 'vProductosCuarentena:liberar_lote',
            },
            {
                label: 'Ver trazabilidad',
                icon: 'fa-solid fa-diagram-project',
                action: 'verTrazabilidad',
                permiso: 'vProductosCuarentena:trazabilidad',
            },
        ],
    }),
    created() {
        this.vista = this.useVistas.vProductosCuarentena
        this.initFiltros()
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return
        if (this.useAuth.verifyPermiso('vProductosCuarentena:listar') == true)
            this.loadProduccionProductos()
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
                },
                incl: ['articulo1', 'produccion_orden1', 'maquina1'],
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
            this.vista.qry.cols.push('is_lote_padre')
        },
        async loadProduccionProductos() {
            this.vista.produccion_productos = []

            this.setQuery()

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.kardex}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.produccion_productos = res.data
        },

        async openConfigFiltros() {
            await this.loadLineas()
            await this.loadMaquinas()

            const cols = this.columns
            cols.find((a) => a.id == 'produccion_orden1.tipo').lista = this.vista.articulo_lineas
            cols.find((a) => a.id == 'maquina').lista = this.vista.maquinas

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadProduccionProductos,
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
            this.useAuth.setLoading(true, 'Cargando trazabilidad...')
            const res = await get(
                `${urls.produccion_ordenes}/trazabilidad/${item.produccion_orden1.id}`,
            )
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

            this.useModals.setModal('mProduccionTrazabilidad', 'Trazabilidad', 3, send, true)
        },

        async loadLineas() {
            const qry = {
                fltr: {},
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
                cols: ['codigo', 'nombre'],
            }

            this.vista.maquinas = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.maquinas}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.vista.maquinas = res.data
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
