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

            <template v-if="modal.transaccion.maquina">
                <JdSelect
                    label="Máquina"
                    :nec="true"
                    v-model="modal.transaccion.maquina"
                    :lista="modal.maquinas || []"
                    style="grid-column: 2/3"
                    :disabled="true"
                />

                <JdSelect
                    label="Insumo"
                    :nec="true"
                    v-model="modal.transaccion.articulo"
                    id="articulo"
                    :lista="articulos_compartidos"
                    @elegir="loadLotes"
                    style="grid-column: 1/3"
                />
            </template>

            <template v-else>
                <JdSelectQuery
                    label="Artículo"
                    :nec="true"
                    v-model="modal.transaccion.articulo"
                    :spin="modal.spinArticulos"
                    :lista="modal.articulos"
                    @search="searchArticulos"
                    @elegir="loadLotes"
                    style="grid-column: 1/3"
                />
            </template>

            <JdSelect
                label="Lote"
                :nec="true"
                v-model="modal.transaccion.lote_padre"
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

            <JdButton text="Grabar" tipo="2" @click="grabar" style="grid-column: 3/4" />
        </div>

        <JdTable
            :columns="columns"
            :datos="modal.produccion_insumos || []"
            width="61rem"
            :colAct="modal.tableColAct"
            :download="false"
            :reload="loadProduccionInsumos"
            colActWidth="4.5rem"
            class="mrg-top1"
        >
            <template v-slot:cPu="{ item }">
                {{ item.lote_padre1?.pu }}
            </template>

            <template v-slot:cAction="{ item }">
                <JdButton
                    tipo="2"
                    :small="true"
                    icon="fa-solid fa-trash"
                    title="Eliminar"
                    @click="eliminar(item)"
                />

                <JdButton
                    tipo="2"
                    :small="true"
                    icon="fa-solid fa-rotate-left"
                    title="Devolución"
                    v-if="item.tipo == 2"
                    @click="devolucion(item)"
                />
            </template>
        </JdTable>
        <!-- </div> -->
    </JdModal>

    <mProduccionInsumosDevolucion
        v-if="useModals.show.mProduccionInsumosDevolucion"
        @devuelto="devuelto"
    />
</template>

<script>
import { JdModal, JdInput, JdSelect, JdSelectQuery, JdButton, JdTable } from '@jhuler/components'
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
        JdModal,
        JdInput,
        JdSelect,
        JdSelectQuery,
        JdButton,
        JdTable,
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
                format: 'date',
                width: '7rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'articulo',
                title: 'Artículo',
                prop: 'articulo1.nombre',
                width: '20rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'articulo_unidad',
                title: 'Unidad',
                prop: 'articulo1.unidad',
                width: '5rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                format: 'decimal',
                toRight: true,
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'lote',
                title: 'Lote',
                prop: 'lote_padre1.lote',
                width: '7rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'fv',
                title: 'Fecha vencimiento',
                prop: 'lote_padre1.fv',
                format: 'date',
                width: '7rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'maquina',
                title: 'Máquina',
                prop: 'maquina1.nombre',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
        ],
    }),
    async created() {
        this.modal = this.useModals.mProduccionInsumosCompartidos

        this.modal.tableColAct = false

        if (this.modal.maquina) {
            if (this.modal.maquina.produccion_ordenes.some((a) => a.estado == 1)) {
                this.modal.tableColAct = true
            } else {
                this.modal.tableColAct = false
            }
        } else {
            this.modal.tableColAct = true
        }

        // await this.loadMaquinas()
        await this.loadProduccionInsumos()
    },
    methods: {
        initTransaccion() {
            this.modal.transaccion = {
                tipo: 2,
                fecha: this.modal.transaccion.fecha,
                maquina: this.modal.transaccion.maquina,
            }

            this.modal.lotes = []
            this.modal.lotesLoaded = false
        },
        setQuery() {
            this.modal.produccion_insumos = []

            this.modal.qry = {
                fltr: {
                    fecha: { op: 'Es', val: this.modal.transaccion.fecha },
                    tipo: { op: 'Es', val: [2, 3] },
                    produccion_orden: { op: 'Es', val: null },
                },
                incl: ['lote_padre1', 'articulo1', 'maquina1'],
            }

            this.useAuth.updateQuery(this.columns, this.modal.qry)

            if (!this.modal.transaccion.maquina) {
                this.modal.qry.fltr.maquina = { op: 'Es', val: null }
            } else {
                this.modal.qry.fltr.maquina = { op: 'Es', val: this.modal.transaccion.maquina }
            }

            this.modal.qry.cols.push('tipo', 'lote_padre')
        },
        async loadProduccionInsumos() {
            this.setQuery()

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.kardex}?qry=${JSON.stringify(this.modal.qry)}`)
            this.useAuth.setLoading(false)

            if (res.code !== 0) return

            this.modal.produccion_insumos = res.data
        },
        async searchArticulos(txtBuscar) {
            if (!txtBuscar) {
                this.modal.articulos.length = 0
                return
            }

            const qry = {
                fltr: {
                    tipo: { op: 'Es', val: 1 },
                    activo: { op: 'Es', val: true },
                    nombre: { op: 'Contiene', val: txtBuscar },
                },
                cols: ['unidad', 'igv_afectacion', 'has_fv'],
            }

            this.modal.spinArticulos = true
            const res = await get(`${urls.articulos}?qry=${JSON.stringify(qry)}`)
            this.modal.spinArticulos = false

            if (res.code !== 0) return

            this.modal.articulos = JSON.parse(JSON.stringify(res.data))
        },

        async loadLotes() {
            this.modal.lotes = []
            this.modal.transaccion.lote_padre = null
            this.modal.lotesLoaded = false

            if (this.modal.transaccion.articulo == null) return

            this.useAuth.setLoading(true, 'Cargando...')
            this.modal.lotesLoaded = false
            const res = await get(`${urls.kardex}/lotes/${this.modal.transaccion.articulo}`)
            this.modal.lotesLoaded = true
            this.useAuth.setLoading(false)

            if (res.code !== 0) return

            this.modal.lotes = JSON.parse(JSON.stringify(res.data))
        },
        selectLote(item) {
            for (const a of this.modal.lotes) a.selected = false

            item.selected = true
        },

        checkDatos() {
            const props = ['fecha', 'articulo', 'cantidad', 'lote_padre']

            if (incompleteData(this.modal.transaccion, props)) {
                jmsg('warning', 'Completa los campos requeridos')
                return true
            }

            const lote_padre = this.modal.lotes.find(
                (a) => a.id == this.modal.transaccion.lote_padre,
            )

            if (lote_padre.stock < this.modal.transaccion.cantidad) {
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
        async devolucion(item) {
            const send = {
                transaccion: {
                    tipo: 3,
                    fecha: item.fecha,
                    maquina: item.maquina,
                    articulo: item.articulo,
                    lote_padre: item.lote_padre,
                },
                articulo: { ...item.articulo1 },
            }

            this.useModals.setModal('mProduccionInsumosDevolucion', 'Devolución', 1, send, true)
        },
        devuelto(item) {
            this.modal.produccion_insumos.unshift(item)
        },

        async loadMaquinas() {
            const qry = {
                fltr: { tipo: { op: 'Es', val: 1 } },
                cols: ['codigo', 'nombre', 'produccion_tipo', 'velocidad', 'limpieza_tiempo'],
            }

            this.modal.maquinas = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.maquinas}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.maquinas = res.data
        },
    },
}
</script>

<style lang="scss" scoped>
.container-agregar {
    // margin-bottom: 2rem;
    display: grid;
    grid-template-columns: repeat(3, 15rem);
    gap: 0.5rem;
    height: fit-content;
}
</style>
