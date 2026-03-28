<template>
    <JdModal modal="mProduccionInsumos">
        <p class="mrg-btm1">
            <small>Producto:</small> {{ modal.produccion_orden.articulo1.nombre }}
            <small>Cant. planificada:</small> {{ modal.produccion_orden.cantidad }}
        </p>

        <div class="container-agregar" v-if="modal.produccion_orden.estado == 1">
            <JdInput
                type="date"
                label="Fecha"
                :nec="true"
                v-model="modal.kardex.fecha"
                style="grid-column: 1/2"
            />

            <JdSelect
                label="Insumo"
                :nec="true"
                v-model="modal.kardex.articulo"
                id="articulo"
                :lista="modal.mrp_bom_lines || []"
                mostrar="articulo1.nombre"
                @elegir="loadLotes"
                style="grid-column: 1/3"
                v-if="modal.is_receta"
            />

            <JdSelectQuery
                label="Artículo"
                :nec="true"
                v-model="modal.kardex.articulo"
                :selectedObject="modal.kardex.articulo1"
                :search="searchArticulos"
                @elegir="loadLotes"
                style="grid-column: 1/3"
                v-else
            />

            <JdCheckBox
                label="Ver artículos de receta"
                v-model="modal.is_receta"
                @change="initTransaccion"
            />

            <JdSelect
                label="Lote"
                :nec="true"
                v-model="modal.kardex.lote_padre"
                :lista="modal.lotes || []"
                mostrar="lote_fv_stock"
                :loaded="modal.lotesLoaded"
                @reload="loadLotes"
                style="grid-column: 1/3"
            />

            <JdInput
                type="number"
                label="Cantidad"
                :nec="true"
                v-model="modal.kardex.cantidad"
                style="grid-column: 1/2"
            />

            <small v-if="modal.is_receta && modal.kardex.articulo" style="grid-column: 2/3">
                Cant. planificada:
                {{
                    redondear(
                        modal.mrp_bom_lines.find((a) => a.articulo == modal.kardex.articulo)
                            ?.cantidad * modal.produccion_orden.cantidad,
                    )
                }}
            </small>

            <JdButton text="Grabar" tipo="2" @click="grabar" style="grid-column: 3/4" />
        </div>

        <JdTable
            :columns="columns"
            :datos="modal.produccion_insumos || []"
            width="61rem"
            :rowOptions="rowActions"
            rowOptionsMode="buttons"
            :reload="loadProduccionInsumos"
            colActWidth="4.5rem"
            @rowOptionSelected="runMethod"
        >
            <template v-slot:cPu="{ item }">
                {{ item.lote_padre1?.pu }}
            </template>
        </JdTable>
        <!-- </div> -->
    </JdModal>

    <mProduccionInsumosDevolucion
        v-if="useModals?.show?.mProduccionInsumosDevolucion"
        @devuelto="devuelto"
    />
</template>

<script>
import mProduccionInsumosDevolucion from '@/views/produccion/historial/mProduccionInsumosDevolucion.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, post, delet } from '@/utils/crud'
import { redondear, incompleteData } from '@/utils/mine'
import { jmsg, jqst } from '@/utils/swal'

import dayjs from 'dayjs'

export default {
    components: {
        mProduccionInsumosDevolucion,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),
        redondear,
        dayjs,

        modal: {},

        columns: [
            {
                id: 'fecha',
                title: 'Fecha',
                prop: 'fecha1',
                width: '7rem',
                show: true,

                sort: true,
            },
            {
                id: 'articulo',
                title: 'Artículo',
                prop: 'articulo1.nombre',
                width: '20rem',
                show: true,

                sort: true,
            },
            {
                id: 'unidad',
                title: 'Unidad',
                prop: 'articulo1.unidad',
                width: '5rem',
                show: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                format: 'decimal',
                toRight: true,
                width: '8rem',
                show: true,
            },
            {
                id: 'lote',
                title: 'Lote',
                prop: 'lote_padre1.lote',
                width: '7rem',
                show: true,
            },
            {
                id: 'fv',
                title: 'Fecha vencimiento',
                prop: 'lote_padre1.fv',
                width: '7rem',
                show: true,
            },
        ],
    }),
    computed: {
        rowActions() {
            if (this.modal.produccion_orden.estado == 1 ? true : false) {
                return [
                    {
                        icon: 'fa-solid fa-trash',
                        title: 'Eliminar',
                        action: 'eliminar',
                    },
                    {
                        icon: 'fa-solid fa-rotate-left',
                        title: 'Devolución',
                        action: 'devolver',
                        ocultar: { prop: 'tipo', op: 'Distinto de', val: 2 },
                    },
                ]
            }
            return []
        },
    },
    created() {
        this.modal = this.useModals.mProduccionInsumos

        this.initTransaccion()
        this.loadProduccionInsumos()
    },
    methods: {
        runMethod(method, item) {
            this[method](item)
        },
        initTransaccion() {
            this.modal.kardex = {
                tipo: 2,
                fecha: this.modal.produccion_orden.fecha,
                produccion_orden: this.modal.produccion_orden.id,
                maquina: this.modal.produccion_orden.maquina,
            }

            this.modal.lotes = []
            this.modal.lotesLoaded = false
        },
        checkDatos() {
            const props = ['fecha', 'articulo', 'cantidad', 'lote_padre']

            if (incompleteData(this.modal.kardex, props)) {
                jmsg('warning', 'Completa los campos requeridos')
                return true
            }

            const lote_padre = this.modal.lotes.find((a) => a.id == this.modal.kardex.lote_padre)

            if (lote_padre.stock < this.modal.kardex.cantidad) {
                jmsg('warning', 'Stock insuficiente')
                return true
            }

            return false
        },
        async grabar() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Grabando...')
            const res = await post(urls.kardex, this.modal.kardex)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.initTransaccion()
            this.modal.produccion_insumos.unshift(res.data)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            const send = {
                id: item.id,
                tipo: item.tipo,
                lote_padre: item.lote_padre,
                cantidad: Math.abs(item.cantidad),
            }

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.kardex, send)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const i = this.modal.produccion_insumos.findIndex((a) => a.id == item.id)
            this.modal.produccion_insumos.splice(i, 1)
        },
        async devolver(item) {
            const send = {
                transaccion: {
                    tipo: 3,
                    fecha: item.fecha,
                    produccion_orden: this.modal.produccion_orden.id,
                    maquina: this.modal.produccion_orden.maquina,
                    articulo: item.articulo,
                    lote_padre: item.lote_padre,
                },
                articulo: { ...item.articulo1 },
            }

            this.useModals.setModal('mProduccionInsumosDevolucion', 'Devolución', 1, send, true)
        },

        //--- auxiliar methods --//
        selectLote(item) {
            for (const a of this.modal.lotes) a.selected = false

            item.selected = true
        },
        devuelto(item) {
            this.modal.produccion_insumos.unshift(item)
        },

        //--- auxiliar data ---//
        async loadProduccionInsumos() {
            this.modal.produccion_insumos = []

            const qry = {
                fltr: {
                    produccion_orden: { op: 'Es', val: this.modal.produccion_orden.id },
                    tipo: { op: 'Es', val: [2, 3] },
                },
                cols: ['tipo', 'fecha', 'articulo', 'lote_padre', 'cantidad'],
                incl: ['lote_padre1', 'articulo1'],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.kardex}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code !== 0) return

            this.modal.produccion_insumos = res.data
        },
        async searchArticulos(txtBuscar) {
            const qry = {
                fltr: {
                    type: { op: 'Es', val: 'consumable' },
                    activo: { op: 'Es', val: true },
                },
                cols: ['nombre', 'unidad', 'igv_afectacion', 'has_fv'],
                ordr: [['nombre', 'ASC']],
                limt: 25,
            }

            if (txtBuscar) {
                qry.fltr.nombre = { op: 'Contiene', val: txtBuscar }
            }

            this.modal.spinArticulos = true
            const res = await get(`${urls.articulos}?qry=${JSON.stringify(qry)}`)
            this.modal.spinArticulos = false

            if (res.code !== 0) return

            this.modal.articulos = JSON.parse(JSON.stringify(res.data))
            return res.data
        },
        async loadLotes() {
            this.modal.lotes = []
            this.modal.kardex.lote_padre = null
            this.modal.lotesLoaded = false

            if (this.modal.kardex.articulo == null) return

            const qry = {
                incl: ['articulo1'],
                cols: [
                    'fecha',
                    'moneda',
                    'tipo_cambio',
                    'pu',
                    'igv_afectacion',
                    'igv_porcentaje',
                    'fv',
                    'lote',
                    'stock',
                    'lote_fv_stock',
                ],
                fltr: {
                    articulo: { op: 'Es', val: this.modal.kardex.articulo },
                    is_lote_padre: { op: 'Es', val: true },
                },
                ordr: [['lote', 'DESC']],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            this.modal.lotesLoaded = false
            const res = await get(`${urls.kardex}?qry=${JSON.stringify(qry)}`)
            this.modal.lotesLoaded = true
            this.useAuth.setLoading(false)

            if (res.code !== 0) return

            this.modal.lotes = JSON.parse(JSON.stringify(res.data))
        },
    },
}
</script>

<style lang="scss" scoped>
.container-agregar {
    display: grid;
    grid-template-columns: repeat(3, 15rem);
    gap: 0.5rem;
}
</style>
