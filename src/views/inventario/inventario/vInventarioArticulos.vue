<template>
    <div class="vista vista-fill">
        <div class="head">
            <div class="head-left" style="flex-wrap: nowrap">
                <strong style="white-space: nowrap">Inventario</strong>

                <JdButtonsOverflow :buttons="headerActions" @runMethod="runMethod" />
            </div>

            <div class="head-center"></div>

            <div class="head-right">
                <JdButton
                    icon="fa-solid fa-file-excel"
                    tipo="2"
                    title="Exportar"
                    @click="$refs['jdtable'].downloadData()"
                />

                <JdButton
                    icon="fa-solid fa-gear"
                    tipo="2"
                    title="Columnas"
                    @click="$refs['jdtable'].openConfigCols()"
                />
            </div>
        </div>

        <JdTable
            ref="jdtable"
            :columns="tableColumns"
            :datos="vista.inventario || []"
            :configFiltros="openConfigFiltros"
            :reload="loadInventario"
        />
    </div>

    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
import { JdTable, mConfigFiltros, JdButton } from '@jhuler/components'
import JdButtonsOverflow from '@/components/JdButtonsOverflow.vue'

import { TABLE_COLUMNS, HEADER_ACTIONS } from './inventario.config.js'

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
        JdButton,
        JdButtonsOverflow,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),
        dayjs,
        redondear,

        vista: {},

        tableName: 'vInventarioArticulos',
        headerActions: HEADER_ACTIONS,
        tableColumns: JSON.parse(JSON.stringify(TABLE_COLUMNS)),
    }),
    created() {
        this.vista = this.useVistas.vInventarioArticulos
        this.initFiltros()
        this.useAuth.setColumns(this.tableName, this.tableColumns)
    },
    methods: {
        runMethod(method, item) {
            this[method](item)
        },
        initFiltros() {
            this.tableColumns[0].op = 'Es igual o anterior a'
            this.tableColumns[0].val = dayjs().format('YYYY-MM-DD')
        },
        checkDatos() {
            if (!this.tableColumns[0].val) {
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

            this.useAuth.updateQuery(this.tableColumns, this.vista.qry)
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

            const cols = this.tableColumns
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
