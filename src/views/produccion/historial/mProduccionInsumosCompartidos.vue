<template>
    <JdModal modal="mProduccionInsumosCompartidos">
        <div class="container-agregar">
            <JdInput
                type="date"
                label="Fecha"
                :nec="true"
                v-model="modal.transaccion.fecha"
                style="grid-column: 1/2"
                :disabled="modal.transaccion.maquina != null"
            />

            <JdSelectQuery
                label="Máquina"
                v-model="modal.transaccion.maquina"
                :search="loadMaquinas"
                style="grid-column: 1/3"
            />
            <!-- :disabled="true" -->
            <!-- v-if="modal.transaccion.maquina" -->

            <!-- <template v-if="ot_abierto"> -->
            <!-- <template v-if="modal.transaccion.maquina">
                    <JdSelect
                        label="Insumo"
                        :nec="true"
                        v-model="modal.transaccion.articulo"
                        id="articulo"
                        :lista="articulos_compartidos"
                        @elegir="loadLotes"
                        style="grid-column: 1/3"
                    />
                </template> -->

            <JdSelectQuery
                label="Artículo"
                :nec="true"
                v-model="modal.transaccion.articulo"
                :search="searchArticulos"
                @elegir="loadLotes"
                style="grid-column: 1/4"
            />

            <JdSelect
                label="Lote"
                :nec="true"
                v-model="modal.transaccion.lote_id"
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
                v-model="modal.transaccion.cantidad"
                style="grid-column: 1/2"
            />

            <JdTextArea
                label="Observación"
                v-model="modal.transaccion.observacion"
                style="grid-column: 1/3"
            />

            <JdButton text="Grabar" tipo="2" @click="grabar" style="grid-column: 3/4" />
            <!-- </template> -->
        </div>

        <JdButton
            icon="fa-solid fa-rotate-right"
            text="Recargar"
            tipo="3"
            @click="loadProduccionInsumos"
            class="mrg-btm1"
        />

        <JdTable
            :columns="columns"
            :datos="modal.produccion_insumos || []"
            width="61rem"
            :rowOptions="rowActions"
            rowOptionsMode="buttons"
            :reload="loadProduccionInsumos"
            colActWidth="4.5rem"
            @rowOptionSelected="runMethod"
        />
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

        articulos_compartidos: [
            { articulo: 'da249f8d-c28e-4eda-a3f9-3ea9659b2f1a', nombre: 'GOMA PURYCOL 1990 GA' },
            {
                articulo: '7068389c-14b4-4a81-a91a-475086719b47',
                nombre: 'HILO 100% ALGODÓN ESPECIAL',
            },
            { articulo: '5daf8437-e0fe-4c6c-95ef-664288365036', nombre: 'PAPEL FILTRO' },
        ],

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
                id: 'articulo_unidad',
                title: 'Unidad',
                prop: 'articulo1.unidad',
                width: '5rem',
                show: true,

                sort: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                format: 'decimal',
                toRight: true,
                width: '8rem',
                show: true,

                sort: true,
            },
            {
                id: 'lote_id',
                title: 'Lote',
                prop: 'lote1.codigo_fv',
                width: '7rem',
                show: true,

                sort: true,
            },
            {
                id: 'maquina',
                title: 'Máquina',
                prop: 'maquina1.nombre',
                width: '8rem',
                show: true,

                sort: true,
            },
            {
                id: 'observacion',
                title: 'Observacion',
                width: '8rem',
                show: true,
            },
        ],
    }),
    computed: {
        // ot_abierto() {
        //     if (this.modal.maquina) {
        //         return this.modal.maquina.produccion_ordenes.some((a) => a.estado == 1)
        //     } else {
        //         return true
        //     }
        // },
        rowActions() {
            // if (this.ot_abierto) {
            return [
                {
                    icon: 'fa-solid fa-trash',
                    title: 'Eliminar',
                    action: 'eliminar',
                },
                {
                    icon: 'fa-solid fa-rotate-left',
                    title: 'Devolución',
                    action: 'devolucion',
                    ocultar: { prop: 'tipo', op: 'Distinto de', val: 2 },
                },
            ]
            // }
            // return []
        },
    },
    async created() {
        this.modal = this.useModals.mProduccionInsumosCompartidos

        // this.modal.tableColAct = false

        // if (this.modal.maquina) {
        //     if (this.modal.maquina.produccion_ordenes.some((a) => a.estado == 1)) {
        //         this.modal.tableColAct = true
        //     } else {
        //         this.modal.tableColAct = false
        //     }
        // } else {
        //     this.modal.tableColAct = true
        // }

        // await this.loadMaquinas()
        await this.loadProduccionInsumos()
    },
    methods: {
        runMethod(method, item) {
            this[method](item)
        },
        initTransaccion() {
            this.modal.transaccion = {
                tipo: 2,
                fecha: this.modal.transaccion.fecha,
                // maquina: this.modal.transaccion.maquina,
            }

            this.modal.lotes = []
            this.modal.lotesLoaded = false
        },

        //--- principal data ---//
        setQuery() {
            this.modal.produccion_insumos = []

            this.modal.qry = {
                fltr: {
                    fecha: { op: 'Es', val: this.modal.transaccion.fecha },
                    tipo: { op: 'Es', val: [2, 3] },
                    produccion_orden: { op: 'Es', val: null },
                },
                incl: ['lote1', 'articulo1', 'maquina1'],
            }

            this.useAuth.updateQuery(this.columns, this.modal.qry)

            if (!this.modal.transaccion.maquina) {
                this.modal.qry.fltr.maquina = { op: 'Es', val: null }
            } else {
                this.modal.qry.fltr.maquina = { op: 'Es', val: this.modal.transaccion.maquina }
            }

            this.modal.qry.cols.push('tipo')
        },
        async loadProduccionInsumos() {
            this.setQuery()

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.kardex}?qry=${JSON.stringify(this.modal.qry)}`)
            this.useAuth.setLoading(false)

            if (res.code !== 0) return

            this.modal.produccion_insumos = res.data
        },

        //--- methods ---//
        checkDatos() {
            const props = ['tipo', 'fecha', 'articulo', 'lote_id', 'cantidad']

            if (incompleteData(this.modal.transaccion, props)) {
                jmsg('warning', 'Completa los campos requeridos')
                return true
            }

            const lote_elegido = this.modal.lotes.find(
                (a) => a.id == this.modal.transaccion.lote_id,
            )

            if (lote_elegido.stock < this.modal.transaccion.cantidad) {
                jmsg('warning', 'Stock insuficiente')
                return true
            }

            return false
        },
        async grabar() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Grabando...')
            const res = await post(urls.kardex, this.modal.transaccion)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.initTransaccion()
            this.modal.produccion_insumos.unshift(res.data)
        },

        //---row actions ---//
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            const send = {
                id: item.id,
                tipo: item.tipo,
                lote_id: item.lote_id,
                cantidad: Math.abs(item.cantidad),
            }

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.kardex, send)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const i = this.modal.produccion_insumos.findIndex((a) => a.id == item.id)
            this.modal.produccion_insumos.splice(i, 1)
        },
        async devolucion(item) {
            const send = {
                transaccion: {
                    tipo: 3,
                    fecha: item.fecha,
                    maquina: item.maquina,
                    articulo: item.articulo,
                    lote_id: item.lote_id,
                },
                articulo: { ...item.articulo1 },
            }

            this.useModals.setModal('mProduccionInsumosDevolucion', 'Devolución', 1, send, true)
        },

        //--- auxiliar data ---//
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

            return res.data
        },
        async loadLotes() {
            this.modal.lotes = []
            this.modal.transaccion.lote_id = null

            if (this.modal.transaccion.articulo == null) return

            const qry = {
                cols: ['codigo', 'fv', 'stock', 'lote_fv', 'lote_fv_stock'],
                fltr: {
                    articulo: { op: 'Es', val: this.modal.transaccion.articulo },
                },
                ordr: [
                    ['codigo', 'DESC'],
                    ['fv', 'DESC'],
                ],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            this.modal.lotesLoaded = false
            const res = await get(`${urls.lotes}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)
            this.modal.lotesLoaded = true

            if (res.code !== 0) return

            this.modal.lotes = JSON.parse(JSON.stringify(res.data))
        },
        async loadMaquinas(txt) {
            const qry = {
                fltr: { tipo: { op: 'Es', val: 1 } },
                cols: ['codigo', 'nombre'],
                ordr: [['nombre', 'ASC']],
                limt: 25,
            }

            if (txt) {
                qry.fltr.nombre = { op: 'Contiene', val: txt }
            }

            const res = await get(`${urls.maquinas}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            return res.data
        },

        //--- @methods ---//
        devuelto(item) {
            this.modal.produccion_insumos.unshift(item)
        },
    },
}
</script>

<style lang="scss" scoped>
.container-agregar {
    margin-bottom: 1rem;
    display: grid;
    grid-template-columns: repeat(3, 15rem);
    gap: 0.5rem 1rem;
    height: fit-content;
}
</style>
