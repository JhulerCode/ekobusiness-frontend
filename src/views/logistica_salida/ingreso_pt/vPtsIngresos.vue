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
            :configFiltros="openConfigFiltros"
            :reload="loadTransacciones"
        >
        </JdTable>
    </div>

    <mProductosCuarentena v-if="useModals.show.mProductosCuarentena" />

    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
import { JdButton, JdTable, mConfigFiltros } from '@jhuler/components'

import mProductosCuarentena from '@/views/logistica_salida/ingreso_pt/mProductosCuarentena.vue'

import { useModals } from '@/pinia/modals'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'

import { urls, get } from '@/utils/crud'

import dayjs from 'dayjs'

export default {
    components: {
        JdButton,
        JdTable,

        mConfigFiltros,

        mProductosCuarentena,
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
    }),
    async created() {
        this.vista = this.useVistas.vPtsIngresos
        this.initFiltros()
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return

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
                    }
                }
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
            await this.loadLineas()
            await this.loadMaquinas()

            const cols = this.columns
            cols.find((a) => a.id == 'produccion_orden1.linea').lista = this.vista.articulo_lineas
            cols.find((a) => a.id == 'maquina').lista = this.vista.maquinas

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadTransacciones,
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
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
    },
}
</script>

<style lang="scss" scoped></style>
