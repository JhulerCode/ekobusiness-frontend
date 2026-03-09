<template>
    <div class="vista vista-fill">
        <div class="head">
            <div class="head-left" style="flex-wrap: nowrap">
                <strong style="white-space: nowrap">Ingreso de productos terminados</strong>

                <JdButtonsOverflow :buttons="headerActions" @runMethod="runMethod" />
            </div>

            <div class="head-center">
                <JdBuscador
                    :view="vista"
                    :columns="tableColumns"
                    :tableName="tableName"
                    @open-filters="openConfigFiltros"
                    @reload="loadTransacciones"
                />
            </div>

            <div class="head-right">
                <JdPaginacion :view="vista" @reload="loadTransacciones" />

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
                    @click="openConfigCols"
                />
            </div>
        </div>

        <JdTable
            :name="tableName"
            :columns="tableColumns"
            :datos="vista.produccion_productos || []"
            :colAct="true"
            :rowOptions="tableRowActions"
            @rowOptionSelected="runMethod"
            ref="jdtable"
        />
    </div>

    <mFormato v-if="useModals.show.mFormato" @created="setLoteAprobado" />
    <mProduccionTrazabilidad v-if="useModals.show.mProduccionTrazabilidad" />
    <mProductosCuarentena v-if="useModals.show.mProductosCuarentena" />

    <mConfigCols v-if="useModals.show.mConfigCols" />
    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
import { JdButton, mConfigFiltros } from '@jhuler/components'
import mConfigCols from '@/components/mConfigCols.vue'
import JdBuscador from '@/components/JdBuscador.vue'
import JdTable from '@/components/JdTable/JdTable.vue'
import JdPaginacion from '@/components/JdPaginacion.vue'

import mProductosCuarentena from '@/views/produccion/ingreso_pt/mProductosCuarentena.vue'
import mFormato from '@/views/calidad/formatos/mFormato.vue'
import mProduccionTrazabilidad from '@/views/produccion/historial/mProduccionTrazabilidad.vue'
import JdButtonsOverflow from '@/components/JdButtonsOverflow.vue'

import { TABLE_COLUMNS, TABLE_ROW_ACTIONS, HEADER_ACTIONS } from './pts_ingresos.config.js'

import { useModals } from '@/pinia/modals'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'

import { urls, get } from '@/utils/crud'
import { jmsg } from '@/utils/swal.js'

import dayjs from 'dayjs'

export default {
    name: 'vPtsIngresos',
    components: {
        JdButton,
        JdBuscador,
        JdTable,
        JdPaginacion,

        mConfigCols,
        mConfigFiltros,

        mProductosCuarentena,
        mFormato,
        mProduccionTrazabilidad,
        JdButtonsOverflow,
    },
    data: () => ({
        useModals: useModals(),
        useAuth: useAuth(),
        useVistas: useVistas(),

        vista: {},

        tableName: 'vPtsIngresos',
        headerActions: HEADER_ACTIONS,
        tableColumns: JSON.parse(JSON.stringify(TABLE_COLUMNS)),
        tableRowActions: TABLE_ROW_ACTIONS,
    }),
    async created() {
        this.vista = this.useVistas.vPtsIngresos
        this.initFiltros()
        this.useAuth.setColumns(this.tableName, this.tableColumns)

        if (this.vista.loaded) return
        this.vista.table_page = 1
        if (this.useAuth.verifyPermiso('vPtsIngresos:listar') == true) this.loadTransacciones()
    },
    methods: {
        initFiltros() {
            if (!this.tableColumns[0].val) {
                this.tableColumns[0].op = 'Está dentro de'
                this.tableColumns[0].val = dayjs().startOf('month').format('YYYY-MM-DD')
                this.tableColumns[0].val1 = dayjs().format('YYYY-MM-DD')
            }
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

            this.useAuth.updateQuery(this.tableColumns, this.vista.qry)
        },
        async loadTransacciones() {
            this.setQuery()

            this.vista.produccion_productos = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.kardex}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.produccion_productos = res.data
            this.vista.table_meta = res.meta
        },

        verCuarentena() {
            this.useModals.setModal('mProductosCuarentena', 'Productos en cuarentena')
        },

        async openConfigFiltros() {
            const cols = this.tableColumns
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
        openConfigCols() {
            const send = {
                table: this.tableName,
                cols: this.tableColumns,
                reload: this.loadTransacciones,
            }
            this.useModals.setModal('mConfigCols', 'Configurar columnas', null, send, true)
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
            if (cuanrentena_producto) cuanrentena_producto.cf_liberacion_lote = item.id
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

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulo_lineas}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return
            return (this.vista.articulo_lineas = res.data)
        },
        async loadMaquinas() {
            const qry = {
                fltr: { tipo: { op: 'Es', val: 1 } },
                cols: ['codigo', 'nombre', 'linea', 'velocidad', 'limpieza_tiempo'],
                ordr: [['nombre', 'ASC']],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.maquinas}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return
            return (this.vista.maquinas = res.data)
        },
    },
}
</script>

<style lang="scss" scoped></style>
