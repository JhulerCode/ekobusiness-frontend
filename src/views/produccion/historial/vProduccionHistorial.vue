<template>
    <VistaLayout :vista="vista">
        <JdTable
            :name="vista.name"
            :columns="vista.tableColumns"
            :datos="vista.tableData || []"
            :colAct="true"
            :rowOptions="vista.tableRowActions"
            @rowOptionSelected="vista.runMethod"
        />
    </VistaLayout>

    <!-- Modales -->
    <mProduccionOrden v-if="modals.show.mProduccionOrden" />
    <mProduccionInsumos v-if="modals.show.mProduccionInsumos" />
    <mProduccionProductos
        v-if="modals.show.mProduccionProductos"
        @productosCargados="setProduccionProductos"
    />
    <mFormato v-if="modals.show.mFormato" @created="setFormatoCalidad" />
    <mProduccionTrazabilidad v-if="modals.show.mProduccionTrazabilidad" />
    <mProductosFaltantes v-if="modals.show.mProductosFaltantes" />
    <mProduccionInsumosCompartidos v-if="modals.show.mProduccionInsumosCompartidos" />
</template>

<script>
// Componentes base y utilidades
import VistaLayout from '@/components/VistaLayout/VistaLayout.vue'
import JdTable from '@/components/JdTable/JdTable.vue'

// Modales específicos
import mProduccionOrden from '@/views/produccion/historial/mProduccionOrden.vue'
import mProduccionInsumos from '@/views/produccion/historial/mProduccionInsumos.vue'
import mProduccionProductos from '@/views/produccion/historial/mProduccionProductos.vue'
import mFormato from '@/views/calidad/formatos/mFormato.vue'
import mProduccionTrazabilidad from '@/views/produccion/historial/mProduccionTrazabilidad.vue'
import mProductosFaltantes from '@/views/produccion/mProductosFaltantes.vue'
import mProduccionInsumosCompartidos from '@/views/produccion/historial/mProduccionInsumosCompartidos.vue'

// Configuración de la vista
import VIEW_CONFIG from './produccion_historial.config.js'

// Pinia y Utils
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls, get, patch } from '@/utils/crud'
import dayjs from 'dayjs'
import { jmsg, jqst } from '@/utils/swal'

export default {
    name: 'vProduccionHistorial',
    components: {
        VistaLayout,
        JdTable,
        mProduccionOrden,
        mProduccionInsumos,
        mProduccionProductos,
        mFormato,
        mProduccionTrazabilidad,
        mProductosFaltantes,
        mProduccionInsumosCompartidos,
    },
    computed: {
        auth: () => useAuth(),
        vistas: () => useVistas(),
        modals: () => useModals(),
        vista() {
            return this.vistas[VIEW_CONFIG.name]
        },
    },
    created() {
        // 1. Inicialización de la vista
        this.vistas.initVista(VIEW_CONFIG.name, {
            ...JSON.parse(JSON.stringify(VIEW_CONFIG)),
            apiUrl: urls[VIEW_CONFIG.apiPath],
            runMethod: this.runMethod,
        })
        this.initFiltros()

        // 2. Carga inicial
        this.auth.setColumns(this.vista.name, this.vista.tableColumns)
        if (!this.vista.loaded && this.auth.verifyPermiso(`${VIEW_CONFIG.name}:listar`)) {
            this.vista.loadTableData()
        }
    },
    unmounted() {
        if (this.vista) this.vista.runMethod = null
    },
    methods: {
        runMethod(method, item) {
            this.vistas.runMethod(this, method, item)
        },
        initFiltros() {
            if (!this.vista.tableColumns[0].val) {
                this.vista.tableColumns[0].op = 'Está dentro de'
                this.vista.tableColumns[0].val = dayjs().startOf('month').format('YYYY-MM-DD')
                this.vista.tableColumns[0].val1 = dayjs().format('YYYY-MM-DD')
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

            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
            this.vista.qry.cols.push('articulo', 'mrp_bom')
        },

        // --- Acciones de Registro ---
        nuevo() {
            const send = {
                produccion_orden: {
                    fecha: dayjs().format('YYYY-MM-DD'),
                    estado: 1,
                },
                origin: 'vProduccionHistorial',
            }
            this.modals.setModal('mProduccionOrden', 'Nueva órden de producción', 1, send, true)
        },
        salidaInsumosCompartidos() {
            const send = {
                transaccion: {
                    tipo: 2,
                    fecha: dayjs().format('YYYY-MM-DD'),
                },
            }
            this.modals.setModal(
                'mProduccionInsumosCompartidos',
                `Salida de insumos`,
                null,
                send,
                true,
            )
        },
        async ver(item) {
            const qry = { incl: ['maquina1', 'articulo1', 'mrp_bom1'] }
            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)
            if (res.code != 0) return

            const send = {
                produccion_orden: res.data,
                articulos: [{ id: res.data.articulo, ...res.data.articulo_info }],
                mrp_boms: [{ ...res.data.mrp_bom1 }],
                origin: 'vProduccionHistorial',
            }
            this.modals.setModal('mProduccionOrden', 'Ver órden de producción', 3, send, true)
        },
        async editar(item) {
            const qry = { incl: ['maquina1', 'articulo1', 'mrp_bom1'] }
            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)
            if (res.code != 0) return

            const send = {
                produccion_orden: res.data,
                articulos: [{ id: res.data.articulo, ...res.data.articulo_info }],
                mrp_boms: [{ ...res.data.mrp_bom1 }],
                origin: 'vProduccionHistorial',
            }
            this.modals.setModal('mProduccionOrden', 'Editar órden de producción', 2, send, true)
        },
        async terminar(item) {
            const resQst = await jqst('¿Está seguro de terminar la orden de producción?')
            if (resQst.isConfirmed == false) return

            this.auth.setLoading(true, 'Cargando...')
            const res = await patch(
                `${this.vista.apiUrl}/terminar`,
                item,
                'Orden de producción terminada',
            )
            this.auth.setLoading(false)
            if (res.code != 0) return

            this.vistas.updateItem('vProduccionHistorial', 'tableData', { ...item, estado: 2 })
        },
        async abrir(item) {
            const resQst = await jqst('¿Está seguro de abrir la orden de producción?')
            if (resQst.isConfirmed == false) return

            this.auth.setLoading(true, 'Cargando...')
            const res = await patch(
                `${this.vista.apiUrl}/abrir`,
                item,
                'Orden de producción abierta',
            )
            this.auth.setLoading(false)
            if (res.code != 0) return

            this.vistas.updateItem('vProduccionHistorial', 'tableData', { ...item, estado: 1 })
        },
        async salidaInsumos(item) {
            const qry1 = {
                fltr: { mrp_bom: { op: 'Es', val: item.mrp_bom } },
                cols: ['articulo', 'cantidad', 'orden'],
                incl: ['articulo1'],
                ordr: [['orden', 'ASC']],
            }
            this.auth.setLoading(true, 'Cargando...')
            const res1 = await get(`${urls.mrp_bom_lines}?qry=${JSON.stringify(qry1)}`)
            this.auth.setLoading(false)
            if (res1.code != 0) return

            const send = {
                is_receta: true,
                produccion_orden: { ...item },
                mrp_bom_lines: res1.data,
            }
            this.modals.setModal('mProduccionInsumos', `Salida de insumos`, 1, send, true)
        },
        productosTerminados(item) {
            const send = { produccion_orden: { ...item }, lote_manual: false }
            this.modals.setModal('mProduccionProductos', `Productos terminados`, null, send, true)
        },
        setProduccionProductos(item) {
            const pr = this.vista.tableData.find((a) => a.id == item.id)
            if (pr) pr.productos_terminados = item.productos_terminados
        },
        async verTrazabilidad(item) {
            const qry = { incl: ['articulo1', 'maquina1'] }
            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)
            if (res.code != 0) return
            if (res.data == null) return jmsg('warning', 'La órden de producción no existe')

            const send = {
                produccion_orden: res.data,
                articulos: [{ id: res.data.articulo, ...res.data.articulo1 }],
                maquinas: [{ id: res.data.maquina, ...res.data.maquina1 }],
            }
            this.modals.setModal('mProduccionTrazabilidad', 'Trazabilidad', null, send, true)
        },
        async controlPesos(item) {
            let formato_id = 'RE-BPM-06'
            if (item.linea == 2) formato_id = 'RE-BPM-08'
            else if (item.linea == 3) formato_id = 'RE-BPM-07'

            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.formatos}/uno/${formato_id}`)
            this.auth.setLoading(false)
            if (res.code != 0) return

            this.auth.setLoading(true, 'Cargando...')
            const res1 = await get(`${urls.formato_values}/uno/${item.calidad_revisado}`)
            this.auth.setLoading(false)
            if (res1.code != 0) return

            const send = {
                produccion_orden: item.id,
                produccion_orden1: res1.data ? res1.data.produccion_orden1 : { ...item },
                formato: {
                    id: res1.data?.id,
                    codigo: res.data.id,
                    columns: res.data.columns,
                    instructivo: res.data.instructivo,
                },
            }
            if (res1.data) {
                for (const a of res.data.columns) a.value = res1.data[a.id]
            }
            this.modals.setModal('mFormato', formato_id, res1.data ? 2 : 1, send, true)
        },
        async controlPpc(item) {
            let formato_id = 'RE-HACCP 03'
            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.formatos}/uno/${formato_id}`)
            this.auth.setLoading(false)
            if (res.code != 0) return

            this.auth.setLoading(true, 'Cargando...')
            const res1 = await get(`${urls.formato_values}/uno/${item.cf_ppc}`)
            this.auth.setLoading(false)
            if (res1.code != 0) return

            const send = {
                produccion_orden: item.id,
                produccion_orden1: res1.data ? res1.data.produccion_orden1 : { ...item },
                formato: {
                    id: res1.data?.id,
                    codigo: res.data.id,
                    columns: res.data.columns,
                    instructivo: res.data.instructivo,
                },
            }
            if (res1.data) {
                for (const a of res.data.columns) a.value = res1.data[a.id]
            }
            this.modals.setModal('mFormato', formato_id, res1.data ? 2 : 1, send, true)
        },
        setFormatoCalidad(item) {
            const produccion_orden = this.vista.tableData.find((a) => a.id == item.produccion_orden)
            if (!produccion_orden) return

            if (['RE-BPM-06', 'RE-BPM-07', 'RE-BPM-08'].includes(item.codigo)) {
                produccion_orden.calidad_revisado = item.id
            }
            if (item.codigo == 'RE-HACCP 03') {
                produccion_orden.cf_ppc = item.id
            }
        },
    },
}
</script>


<style lang="scss" scoped></style>
