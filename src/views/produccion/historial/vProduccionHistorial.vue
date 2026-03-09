<template>
    <div class="vista vista-fill">
        <div class="head">
            <div class="head-left">
                <strong>Órdenes de producción</strong>

                <JdButton
                    text="Salida de insumos"
                    tipo="2"
                    @click="salidaInsumosCompartidos"
                    v-if="useAuth.verifyPermiso('vProduccionHistorial:salidaInsumos')"
                />

                <JdButton
                    text="Nuevo"
                    @click="nuevo"
                    v-if="useAuth.verifyPermiso('vProduccionHistorial:crear')"
                />
            </div>

            <div class="head-center">
                <JdBuscador
                    :view="vista"
                    :columns="columns"
                    :tableName="tableName"
                    @open-filters="openConfigFiltros"
                    @reload="loadProduccionOrdenes"
                />
            </div>

            <div class="head-right">
                <JdPaginacion :view="vista" @reload="loadProduccionOrdenes" />

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
            :name="tableName"
            :columns="columns"
            :datos="vista.produccion_ordenes || []"
            :colAct="true"
            :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod"
            ref="jdtable"
            :reload="loadProduccionOrdenes"
        />
    </div>

    <mProduccionOrden v-if="useModals.show.mProduccionOrden" />
    <mProduccionInsumos v-if="useModals.show.mProduccionInsumos" />
    <mProduccionProductos
        v-if="useModals.show.mProduccionProductos"
        @productosCargados="setProduccionProductos"
    />
    <mFormato v-if="useModals.show.mFormato" @created="setFormatoCalidad" />
    <mProduccionTrazabilidad v-if="useModals.show.mProduccionTrazabilidad" />

    <mProductosFaltantes v-if="useModals.show.mProductosFaltantes" />
    <mProduccionInsumosCompartidos v-if="useModals.show.mProduccionInsumosCompartidos" />

    <mConfigCols v-if="useModals.show.mConfigCols" />
    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
import { JdButton, mConfigCols, mConfigFiltros } from '@jhuler/components'
import JdBuscador from '@/components/JdBuscador.vue'
import JdTable from '@/components/JdTable/JdTable.vue'
import JdPaginacion from '@/components/JdPaginacion.vue'

import mProduccionOrden from '@/views/produccion/historial/mProduccionOrden.vue'
import mProduccionInsumos from '@/views/produccion/historial/mProduccionInsumos.vue'
import mProduccionProductos from '@/views/produccion/historial/mProduccionProductos.vue'
import mFormato from '@/views/calidad/formatos/mFormato.vue'
import mProduccionTrazabilidad from '@/views/produccion/historial/mProduccionTrazabilidad.vue'
import mProductosFaltantes from '@/views/produccion/mProductosFaltantes.vue'
import mProduccionInsumosCompartidos from '@/views/produccion/historial/mProduccionInsumosCompartidos.vue'

import { COLUMNS, TABLE_ROW_OPTIONS } from './produccion_historial.config'

import { useModals } from '@/pinia/modals'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'

import { urls, get, patch, delet } from '@/utils/crud'
import { jmsg, jqst } from '@/utils/swal'

import dayjs from 'dayjs'

export default {
    name: 'vProduccionHistorial',
    components: {
        JdButton,
        JdBuscador,
        JdTable,
        JdPaginacion,

        mConfigCols,
        mConfigFiltros,

        mProduccionOrden,
        mProduccionInsumos,
        mProduccionProductos,
        mProductosFaltantes,
        mFormato,
        mProduccionTrazabilidad,
        mProduccionInsumosCompartidos,
    },
    data: () => ({
        useModals: useModals(),
        useAuth: useAuth(),
        useVistas: useVistas(),

        vista: {},

        tableName: 'vProduccionHistorial',
        columns: JSON.parse(JSON.stringify(COLUMNS)),
        tableRowOptions: TABLE_ROW_OPTIONS,
    }),
    created() {
        this.vista = this.useVistas.vProduccionHistorial
        this.initFiltros()
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return
        this.vista.table_page = 1
        if (this.useAuth.verifyPermiso('vProduccionHistorial:listar') == true)
            this.loadProduccionOrdenes()
    },
    methods: {
        initFiltros() {
            if (!this.columns[0].val) {
                this.columns[0].op = 'Está dentro de'
                this.columns[0].val = dayjs().startOf('month').format('YYYY-MM-DD')
                this.columns[0].val1 = dayjs().format('YYYY-MM-DD')
            }
        },
        setQuery() {
            this.vista.qry = {
                fltr: {},
                incl: ['linea1', 'maquina1', 'articulo1', 'responsable1', 'createdBy1'],
                sqls: ['productos_terminados'],
                ordr: [
                    ['fecha', 'DESC'],
                    ['createdAt', 'DESC'],
                ],
                page: this.vista.table_page,
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
            this.vista.qry.cols.push('articulo', 'mrp_bom')
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
            this.vista.table_meta = res.meta
        },

        nuevo() {
            const send = {
                produccion_orden: {
                    fecha: dayjs().format('YYYY-MM-DD'),
                    estado: 1,
                },
                origin: 'vProduccionHistorial',
            }

            this.useModals.setModal('mProduccionOrden', 'Nueva órden de producción', 1, send, true)
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

        async openConfigFiltros() {
            await this.loadDatosSistema()

            const cols = this.columns
            for (const a of cols) {
                if (a.id == 'linea') a.reload = this.loadLineas
                if (a.id == 'maquina') a.reload = this.loadMaquinas
                if (a.id == 'responsable') a.reload = this.loadColaboradores
                if (a.id == 'estado') a.lista = this.vista.produccion_orden_estados
            }

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
            const qry = {
                incl: ['maquina1', 'articulo1', 'mrp_bom1'],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(
                `${urls.produccion_ordenes}/uno/${item.id}?qry=${JSON.stringify(qry)}`,
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
                mrp_boms: [{ ...res.data.mrp_bom1 }],
                origin: 'vProduccionHistorial',
            }

            if (res.data.maquina) {
                if (!this.vista.maquinas) await this.loadMaquinas()
                send.maquinas = this.vista.maquinas
            }

            this.useModals.setModal('mProduccionOrden', 'Ver órden de producción', 3, send, true)
        },
        async editar(item) {
            const qry = {
                incl: ['maquina1', 'articulo1', 'mrp_bom1'],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(
                `${urls.produccion_ordenes}/uno/${item.id}?qry=${JSON.stringify(qry)}`,
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
                mrp_boms: [{ ...res.data.mrp_bom1 }],
                origin: 'vProduccionHistorial',
            }

            if (res.data.maquina) {
                if (!this.vista.maquinas) await this.loadMaquinas()
                send.maquinas = this.vista.maquinas
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

            this.useVistas.removeItem('vProduccionHistorial', 'produccion_ordenes', item)
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

            this.useVistas.updateItem('vProduccionHistorial', 'produccion_ordenes', {
                ...item,
                estado: 2,
            })
        },
        async abrir(item) {
            const resQst = await jqst('¿Está seguro de abrir la orden de producción?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await patch(
                `${urls.produccion_ordenes}/abrir`,
                item,
                'Orden de producción abierta',
            )
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.updateItem('vProduccionHistorial', 'produccion_ordenes', {
                ...item,
                estado: 1,
            })
        },
        async salidaInsumos(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.produccion_ordenes}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const qry1 = {
                fltr: {
                    mrp_bom: { op: 'Es', val: item.mrp_bom },
                },
                cols: ['articulo', 'cantidad', 'orden'],
                incl: ['articulo1'],
                ordr: [['orden', 'ASC']],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res1 = await get(`${urls.mrp_bom_lines}?qry=${JSON.stringify(qry1)}`)
            this.useAuth.setLoading(false)

            if (res1.code != 0) return

            const send = {
                is_receta: true,
                produccion_orden: { ...item },
                mrp_bom_lines: res1.data,
            }

            this.useModals.setModal('mProduccionInsumos', `Salida de insumos`, 1, send, true)
        },
        productosTerminados(item) {
            const send = {
                produccion_orden: { ...item },
                lote_manual: false,
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
            if (pr) pr.productos_terminados = item.productos_terminados
        },
        async verTrazabilidad(item) {
            const qry = {
                incl: ['articulo1', 'maquina1'],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(
                `${urls.produccion_ordenes}/uno/${item.id}?qry=${JSON.stringify(qry)}`,
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

            this.useModals.setModal('mProduccionTrazabilidad', 'Trazabilidad', null, send, true)
        },
        async controlPesos(item) {
            let formato_id = 'RE-BPM-06'

            if (item.linea == 2) {
                formato_id = 'RE-BPM-08'
            } else if (item.linea == 3) {
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
            if (!produccion_orden) return

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
        async loadColaboradores() {
            const qry = {
                fltr: { activo: { op: 'Es', val: true } },
                cols: ['nombres', 'apellidos', 'nombres_apellidos', 'produccion_codigo'],
                ordr: [
                    ['nombres', 'ASC'],
                    ['apellidos', 'ASC'],
                ],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.colaboradores}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return
            return (this.vista.colaboradores = res.data)
        },
    },
}
</script>

<style lang="scss" scoped></style>
