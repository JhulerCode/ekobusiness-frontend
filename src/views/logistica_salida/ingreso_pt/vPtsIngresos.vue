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
import JdButton from '@/components/inputs/JdButton.vue'
import JdTable from '@/components/JdTable.vue'

import mConfigFiltros from '@/components/mConfigFiltros.vue'

import mProductosCuarentena from '@/views/logistica_salida/ingreso_pt/mProductosCuarentena.vue'

import { useModals } from '@/pinia/modals'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'

import { urls, get } from '@/utils/crud'
// import { jmsg } from '@/utils/swal'
// import { produccion_tipos, maquinas } from '@/data/sistema_listas'

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
                id: 'tipo',
                title: 'Tipo',
                type: 'select',
                prop: 'produccion_orden1.tipo1.nombre',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'maquina',
                title: 'Máquina',
                type: 'select',
                prop: 'produccion_orden1.maquina1.nombre',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'articulo',
                title: 'Producto',
                type: 'text',
                prop: 'articulo1.nombre',
                width: '25rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'unidad',
                title: 'Unidad',
                type: 'text',
                prop: 'articulo1.unidad',
                filtrable: false,
                width: '5rem',
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
                fltr: { is_lote_padre: { op: 'No es', val: null } },
                incl: ['articulo1', 'produccion_orden1'],
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
        },
        async loadTransacciones() {
            this.setQuery()

            this.vista.produccion_productos = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(
                `${urls.kardex}/produccion-productos?qry=${JSON.stringify(this.vista.qry)}`,
            )
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
            await this.loadDatosSistema()
            await this.loadMaquinas()

            const cols = this.columns.filter((a) => a.filtrable !== false)
            cols.find((a) => a.id == 'tipo').lista = this.vista.produccion_tipos
            cols.find((a) => a.id == 'maquina').lista = this.vista.maquinas

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadTransacciones,
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },

        async loadDatosSistema() {
            const qry = ['produccion_tipos']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.vista, res.data)
        },
        async loadMaquinas() {
            const qry = {
                fltr: { tipo: { op: 'Es', val: 1 } },
                cols: ['codigo', 'nombre', 'produccion_tipo', 'velocidad', 'limpieza_tiempo'],
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
