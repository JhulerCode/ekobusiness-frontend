<template>
    <VistaLayout
        :key="$route.fullPath"
        :config="VIEW_CONFIG"
        :initFiltros="initFiltros"
        :setQuery="setQuery"
        :rowSelectable="true"
        @runMethod="runMethod"
    >
    </VistaLayout>

    <mProduccionInsumosCompartidos v-if="modals?.show?.mProduccionInsumosCompartidos" />
    <mProduccionProductos
        v-if="modals?.show?.mProduccionProductos"
        @productosCargados="updateProduccionProductos"
    />
</template>

<script>
import mProduccionInsumosCompartidos from '@/views/produccion/historial/mProduccionInsumosCompartidos.vue'
import mProduccionProductos from '@/views/produccion/historial/mProduccionProductos.vue'

import VIEW_CONFIG from './produccion_ordenes.config.js'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { patch } from '@/utils/crud'
import { jqst, jmsg } from '@/utils/swal'
import dayjs from 'dayjs'

export default {
    components: {
        mProduccionInsumosCompartidos,
        mProduccionProductos,
    },
    computed: {
        auth: () => useAuth(),
        vistas: () => useVistas(),
        modals: () => useModals(),
        vista() {
            return this.vistas[this.$route.name]
        },
    },
    data: () => ({
        VIEW_CONFIG,
    }),
    methods: {
        runMethod(method, item) {
            this[method](item)
        },
        initFiltros() {
            const i = this.vista.tableColumns.findIndex((a) => a.id == 'fecha')
            const existeUnFiltro = this.vista.tableColumns.some((a) => a.val)

            if (!existeUnFiltro) {
                this.vista.tableColumns[i].op = 'Está dentro de'
                this.vista.tableColumns[i].val = dayjs().startOf('month').format('YYYY-MM-DD')
                this.vista.tableColumns[i].val1 = dayjs().format('YYYY-MM-DD')
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
            this.auth.applyListingRestriction(this.vista.name, this.vista.qry)
            this.vista.qry.cols.push('articulo', 'mrp_bom')
        },

        //--- Header actions ---//
        nuevo() {
            this.$router.push({
                name: this.vista.detailViewName,
                params: { [this.vista.detailPath]: 'nuevo' },
            })
        },
        salidaInsumosCompartidos() {
            console.log('asd')
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

        //--- Bulk actions ---//
        async abrirCerrarMasivo(estado) {
            const selected = this.vista.tableData.filter((a) => a.selected)
            if (selected.length == 0) return jmsg('warning', 'Seleccione al menos una orden')

            const resQst = await jqst(
                `¿Está seguro de ${estado == 1 ? 'abrir' : 'cerrar'} ${selected.length} órdenes de producción?`,
            )
            if (resQst.isConfirmed == false) return

            const send = { id: 'bulk', ids: selected.map((b) => b.id), estado }

            this.auth.setLoading(true, 'Cargando...')
            const res = await patch(
                `${this.vista.apiUrl}/abrir-cerrar`,
                send,
                `Órdenes de producción ${estado == 1 ? 'abiertas' : 'cerradas'}`,
            )
            this.auth.setLoading(false)

            if (res.code == 0) {
                for (const a of selected) {
                    this.vistas.updateItem(
                        this.vista.name,
                        'tableData',
                        { id: a.id, estado, estado1: res.data.estado1, selected: false },
                        true,
                    )
                }
            }
        },
        async abrirMasivo() {
            this.abrirCerrarMasivo('1')
        },
        async cerrarMasivo() {
            this.abrirCerrarMasivo('2')
        },

        //--- Row actions ---//
        // async verTrazabilidad(item) {
        //     const qry = { incl: ['articulo1', 'maquina1'] }
        //     this.auth.setLoading(true, 'Cargando...')
        //     const res = await get(`${this.vista.apiUrl}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
        //     this.auth.setLoading(false)
        //     if (res.code != 0) return
        //     if (res.data == null) return jmsg('warning', 'La órden de producción no existe')

        //     const send = {
        //         produccion_orden: res.data,
        //         articulos: [{ id: res.data.articulo, ...res.data.articulo1 }],
        //         maquinas: [{ id: res.data.maquina, ...res.data.maquina1 }],
        //     }
        //     this.modals.setModal('mProduccionTrazabilidad', 'Trazabilidad', null, send, true)
        // },
        // async controlPesos(item) {
        //     let formato_id = 'RE-BPM-06'
        //     if (item.linea == 2) formato_id = 'RE-BPM-08'
        //     else if (item.linea == 3) formato_id = 'RE-BPM-07'

        //     this.auth.setLoading(true, 'Cargando...')
        //     const res = await get(`${urls.formatos}/uno/${formato_id}`)
        //     this.auth.setLoading(false)
        //     if (res.code != 0) return

        //     this.auth.setLoading(true, 'Cargando...')
        //     const res1 = await get(`${urls.formato_values}/uno/${item.calidad_revisado}`)
        //     this.auth.setLoading(false)
        //     if (res1.code != 0) return

        //     const send = {
        //         produccion_orden: item.id,
        //         produccion_orden1: res1.data ? res1.data.produccion_orden1 : { ...item },
        //         formato: {
        //             id: res1.data?.id,
        //             codigo: res.data.id,
        //             columns: res.data.columns,
        //             instructivo: res.data.instructivo,
        //         },
        //     }
        //     if (res1.data) {
        //         for (const a of res.data.columns) a.value = res1.data[a.id]
        //     }
        //     this.modals.setModal('mFormato', formato_id, res1.data ? 2 : 1, send, true)
        // },
        // async controlPpc(item) {
        //     let formato_id = 'RE-HACCP 03'
        //     this.auth.setLoading(true, 'Cargando...')
        //     const res = await get(`${urls.formatos}/uno/${formato_id}`)
        //     this.auth.setLoading(false)
        //     if (res.code != 0) return

        //     this.auth.setLoading(true, 'Cargando...')
        //     const res1 = await get(`${urls.formato_values}/uno/${item.cf_ppc}`)
        //     this.auth.setLoading(false)
        //     if (res1.code != 0) return

        //     const send = {
        //         produccion_orden: item.id,
        //         produccion_orden1: res1.data ? res1.data.produccion_orden1 : { ...item },
        //         formato: {
        //             id: res1.data?.id,
        //             codigo: res.data.id,
        //             columns: res.data.columns,
        //             instructivo: res.data.instructivo,
        //         },
        //     }
        //     if (res1.data) {
        //         for (const a of res.data.columns) a.value = res1.data[a.id]
        //     }
        //     this.modals.setModal('mFormato', formato_id, res1.data ? 2 : 1, send, true)
        // },
        abrir(item) {
            this.abrirCerrar(item, '1')
        },
        cerrar(item) {
            this.abrirCerrar(item, '2')
        },
        productosTerminados(item) {
            const send = {
                produccion_orden: { ...item },
                lote_manual: true,
            }

            this.modals.setModal('mProduccionProductos', `Productos terminados`, null, send, true)
        },

        //--- auxiliar methods ---//
        async abrirCerrar(item, estado) {
            const resQst = await jqst(
                `¿Está seguro de ${estado == 1 ? 'abrir' : 'cerrar'} la orden de producción?`,
            )
            if (resQst.isConfirmed == false) return

            const send = { id: item.id, ids: item.id, estado }

            this.auth.setLoading(true, 'Cargando...')
            const res = await patch(
                `${this.vista.apiUrl}/abrir-cerrar`,
                send,
                `Orden de producción ${estado == 1 ? 'abierta' : 'cerrado'}`,
            )
            this.auth.setLoading(false)

            if (res.code != 0) return

            this.vistas.updateItem(this.vista.name, 'tableData', res.data, true)
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

        //--- @ methods ---//
        updateProduccionProductos(item) {
            const produccion_orden = this.vista.tableData.find((a) => a.id == item.id)
            if (produccion_orden) produccion_orden.productos_terminados = item.productos_terminados
        },
    },
}
</script>
