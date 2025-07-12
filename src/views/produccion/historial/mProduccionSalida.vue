<template>
    <JdModal modal="mProduccionSalida">
        <p class="mrg-btm2">
            {{ modal.transaccion.produccion_orden1.articulo_info.nombre }}
        </p>

        <div class="container-agregar">
            <div class="left">
                <JdInput type="date" label="Fecha" :nec="true" v-model="modal.transaccion.fecha" />

                <!-- <JdSwitch label="Artículos de receta?" v-model="nuevo.is_receta" @change="setOrigen"
                    style="grid-column: 2/3;" /> -->

                <JdCheckBox label="Ver artículos de receta" v-model="nuevo.is_receta" @change="setOrigen"
                    style="grid-column: 2/3;" />

                <JdSelect label="Insumo" :nec="true" v-model="nuevo.articulo"
                    :lista="modal.transaccion.produccion_orden1.insumos || []" id="articulo" @elegir="loadLotes"
                    v-if="nuevo.is_receta" style="grid-column: 1/3;" />

                <JdSelectQuery label="Artículo" :nec="true" v-model="nuevo.articulo" :spin="spinArticulos"
                    :lista="articulos" @search="searchArticulos" @elegir="loadLotes" v-else style="grid-column: 1/3" />

                <JdInput type="number" label="Cantidad" :nec="true" v-model="nuevo.cantidad" />

                <p v-if="nuevo.is_receta && nuevo.articulo"
                    style="grid-column: 2/3; display: flex; justify-content: flex-end;">
                    <small>
                        Cant:
                        {{redondear(modal.transaccion.produccion_orden1.insumos.find(a => a.articulo ==
                            nuevo.articulo)?.cantidad
                            * modal.transaccion.produccion_orden1.cantidad)}}
                    </small>
                </p>

                <JdButton text="Grabar" @click="grabar" style="grid-column: 1/2;" />
            </div>

            <JdTable :columns="columnsLotes" :datos="lotes || []" :seeker="false" :colNro="false" :rowSelectable="true"
                :rsUno="true" maxHeight="10rem">
            </JdTable>
        </div>

        <JdTable :columns="columns" :datos="produccion_items || []" width="60rem" :colAct="true"
            :reload="loadItemsProduccion">
            <template v-slot:cPu="{ item }">
                {{ item.lote_padre1?.pu }}
            </template>

            <template v-slot:cAction="{ item }">
                <JdButton tipo="2" :small="true" icon="fa-solid fa-rotate-left" title="Devolución"
                    v-if="item.transaccion1.tipo == 2" @click="devolucion(item)" />
            </template>
        </JdTable>
    </JdModal>

    <mProduccionDevolucion v-if="useModals.show.mProduccionDevolucion" @devuelto="devuelto" />
</template>

<script>
import JdModal from '@/components/JdModal.vue'
import JdInput from '@/components/inputs/JdInput.vue'
// import JdSwitch from '@/components/inputs/JdSwitch.vue'
import JdCheckBox from '@/components/inputs/JdCheckBox.vue'
import JdSelect from '@/components/inputs/JdSelect.vue'
import JdSelectQuery from '@/components/inputs/JdSelectQuery.vue'
import JdButton from '@/components/inputs/JdButton.vue'
import JdTable from '@/components/JdTable.vue'
import mProduccionDevolucion from '@/views/produccion/historial/mProduccionDevolucion.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, post } from '@/utils/crud'
import { redondear } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

import dayjs from 'dayjs'

export default {
    components: {
        JdModal,
        JdInput,
        // JdSwitch,
        JdCheckBox,
        JdSelect,
        JdSelectQuery,
        JdButton,
        JdTable,
        mProduccionDevolucion,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),
        redondear,
        dayjs,

        modal: {},
        nuevo: { is_receta: true },
        articulos: [],
        spinArticulos: false,
        lotes: [],
        produccion_items: [],

        columnsLotes: [
            {
                id: 'lote',
                title: 'Lote',
                width: '7rem',
                show: true,
            },
            {
                id: 'stock',
                title: 'Stock',
                format: 'decimal',
                toRight: true,
                width: '6rem',
                show: true,
            },
            {
                id: 'pu_real',
                title: 'Precio u.',
                toRight: true,
                width: '6rem',
                show: true,
            },
            {
                id: 'fv',
                title: 'F. Vencim.',
                format: 'date',
                width: '7rem',
                show: true,
            },
        ],

        columns: [
            {
                id: 'fecha',
                title: 'Fecha',
                prop: 'transaccion1.fecha',
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
                width: '23rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'unidad',
                title: 'Unidad',
                prop: 'articulo1.unidad',
                width: '5rem',
                show: true,
                seek: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                format: 'decimal',
                toRight: true,
                width: '8rem',
                show: true,
                seek: true,
            },
            {
                id: 'pu',
                title: 'Precio uni.',
                prop: 'lote_padre1.pu',
                toRight: true,
                width: '6rem',
                show: true,
                seek: true,
            },
            {
                id: 'lote',
                title: 'Lote',
                prop: 'lote_padre1.lote',
                width: '7rem',
                show: true,
                seek: true,
            },
            {
                id: 'fv',
                title: 'F. vencim.',
                prop: 'lote_padre1.fv',
                format: 'date',
                width: '7rem',
                show: true,
                seek: true,
            },
        ],
    }),
    created() {
        this.modal = this.useModals.mProduccionSalida

        this.loadItemsProduccion()
    },
    methods: {
        setOrigen() {
            this.nuevo.articulo = null
            this.nuevo.cantidad = null
            this.lotes = []
        },
        async loadItemsProduccion() {
            this.produccion_items = []

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.transacciones}/items-produccion/${this.modal.transaccion.produccion_orden}`)
            this.useAuth.setLoading(false)

            if (res.code !== 0) return

            this.produccion_items = res.data
        },
        async searchArticulos(txtBuscar) {
            if (!txtBuscar) {
                this.articulos.length = 0
                return
            }

            const qry = {
                fltr: {
                    tipo: { op: 'Es', val: 1 },
                    activo: { op: 'Es', val: true },
                    nombre: { op: 'Contiene', val: txtBuscar },
                },
                cols: ['unidad', 'igv_afectacion', 'has_fv']
            }

            this.spinArticulos = true
            const res = await get(`${urls.articulos}?qry=${JSON.stringify(qry)}`)
            this.spinArticulos = false

            if (res.code !== 0) return

            this.articulos = JSON.parse(JSON.stringify(res.data))
        },

        async loadLotes() {
            this.lotes = []

            if (this.nuevo.articulo == null) return

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.transacciones}/lotes/${this.nuevo.articulo}`)
            this.useAuth.setLoading(false)

            if (res.code !== 0) return

            this.lotes = JSON.parse(JSON.stringify(res.data))
        },
        selectLote(item) {
            for (const a of this.lotes) a.selected = false

            item.selected = true
        },

        checkDatos() {
            if (this.nuevo.articulo == null || this.nuevo.cantidad == null) {
                jmsg('warning', 'Selecciona el artículo e ingresa la cantidad')
                return true
            }

            const lote = this.lotes.find(a => a.selected == true)
            if (lote == undefined) {
                jmsg('warning', 'Selecciona el lote')
                return true
            }

            if (lote.stock < this.nuevo.cantidad) {
                jmsg('warning', 'Stock insuficiente')
                return true
            }

            this.modal.transaccion.transaccion_items = []

            this.modal.transaccion.transaccion_items.push({
                articulo: this.nuevo.articulo,
                cantidad: this.nuevo.cantidad,
                lote_padre: lote.id,
            })

            return false
        },
        async grabar() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Grabando...')
            const res = await post(`${urls.transacciones}/produccion-salida`, this.modal.transaccion)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.nuevo.articulo = null
            this.nuevo.cantidad = null
            this.lotes = []

            this.produccion_items.unshift(res.data)
        },

        // async eliminar(item) {
        //     const resQst = await jqst('¿Está seguro de eliminar?')
        //     if (resQst.isConfirmed == false) return

        //     const send = { id: item.transaccion1.id }

        //     this.useAuth.setLoading(true, 'Eliminando...')
        //     const res = await delet(urls.transacciones, send)
        //     this.useAuth.setLoading(false)

        //     if (res.code != 0) return

        //     const i = this.produccion_items.findIndex(a => a.id == item.id)
        //     this.produccion_items.splice(i, 1)
        // },
        async devolucion(item) {
            const send = {
                tipo: 3,
                fecha: dayjs().format('YYYY-MM-DD'),
                produccion_orden: this.modal.transaccion.produccion_orden,
                estado: 1,
                transaccion_items: [
                    {
                        articulo: item.articulo,
                        articulo1: item.articulo1,
                        lote_padre: item.lote_padre,
                    }
                ]
            }

            this.useModals.setModal('mProduccionDevolucion', 'Devolución', 1, send)
        },
        devuelto(item) {
            this.produccion_items.unshift(item)
        },
    }
}
</script>

<style lang="scss" scoped>
.container-agregar {
    display: grid;
    grid-template-columns: 30rem 28rem;
    gap: 2rem;
    margin-bottom: 2rem;
    align-items: start;

    .left {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.5rem;
        height: fit-content;
    }
}
</style>