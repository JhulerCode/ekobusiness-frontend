<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Inventario</strong>

            <div class="buttons"></div>
        </div>

        <JdTable
            :columns="columns"
            :datos="vista.inventario || []"
            :configFiltros="openConfigFiltros"
            :reload="loadInventario"
        />
    </div>

    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
import { JdTable, mConfigFiltros } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get } from '@/utils/crud'
import { redondear } from '@/utils/mine'

import dayjs from 'dayjs'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdTable,
        mConfigFiltros,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),
        dayjs,
        redondear,

        vista: {},

        tableName: 'vInventarioArticulos',
        columns: [
            {
                id: 'kardexes.fecha',
                title: 'Fecha',
                type: 'date',
                show: false,
            },
            {
                id: 'nombre',
                title: 'Nombre',
                type: 'text',
                width: '30rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'categoria',
                title: 'Categoría',
                prop: 'categoria1.nombre',
                type: 'select',
                width: '12rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'unidad',
                title: 'Unidad',
                filtrable: false,
                width: '7rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'cantidad',
                title: 'Stock',
                format: 'decimal',
                toRight: true,
                filtrable: false,
                width: '7rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'articulo_movimientos_valorizado',
                title: 'Valor',
                format: 'decimal',
                toRight: true,
                filtrable: false,
                width: '7rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'purchase_ok',
                title: 'Se compra',
                prop: 'purchase_ok1.nombre',
                type: 'select',
                format: 'yesno',
                width: '8rem',
                show: false,
            },
            {
                id: 'sale_ok',
                title: 'Se vende',
                prop: 'sale_ok1.nombre',
                type: 'select',
                format: 'yesno',
                width: '8rem',
                show: false,
            },
            {
                id: 'produce_ok',
                title: 'Se produce',
                prop: 'produce_ok1.nombre',
                type: 'select',
                format: 'yesno',
                width: '8rem',
                show: false,
            },
        ],
    }),
    created() {
        this.vista = this.useVistas.vInventarioArticulos
        this.initFiltros()
        this.useAuth.setColumns(this.tableName, this.columns)
    },
    methods: {
        initFiltros() {
            this.columns[0].op = 'Es igual o anterior a'
            this.columns[0].val = dayjs().format('YYYY-MM-DD')
        },
        checkDatos() {
            if (!this.columns[0].val) {
                jmsg('error', 'Ingrese la fecha límite')
                return true
            }

            return false
        },
        setQuery() {
            this.vista.qry = {
                incl: ['categoria1', 'kardexes'],
                iccl: {
                    kardexes: {
                        incl: ['lote_padre2'],
                    },
                },
                sqls: ['articulo_movimientos_cantidad', 'articulo_movimientos_valorizado'],
                fltr: {
                    // tipo: { op: 'Es', val: 1 },
                },
                grop: ['id'],
                ordr: [['nombre', 'ASC']],
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
        },
        async loadInventario() {
            if (this.checkDatos()) return

            this.setQuery()

            this.vista.inventario = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.kardex}/inventario?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.inventario = res.data
        },

        async openConfigFiltros() {
            await this.loadDatosSistema()

            const cols = this.columns
            for (const a of cols) {
                if (a.id == 'categoria') a.reload = this.loadCategorias
                if (a.id == 'purchase_ok') a.lista = this.vista.estados
                if (a.id == 'sale_ok') a.lista = this.vista.estados
                if (a.id == 'produce_ok') a.lista = this.vista.estados
            }

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadInventario,
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },
        async loadDatosSistema() {
            const qry = ['igv_afectaciones', 'unidades', 'estados', 'articulo_tipos']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.vista, res.data)
        },
        async loadCategorias() {
            const qry = {
                cols: ['nombre'],
                fltr: {
                    tipo: { op: 'Es', val: 1 },
                    activo: { op: 'Es', val: true },
                },
                ordr: [['nombre', 'ASC']],
            }

            this.vista.articulo_categorias = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulo_categorias}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.vista.articulo_categorias = res.data
            return res.data
        },
    },
}
</script>
