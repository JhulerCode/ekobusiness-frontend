<template>
    <div class="pedido-items">
        <div class="agregar"
            v-if="modal.mode != 3 && modal.transaccion.socio != null && modal.transaccion.moneda != null">
            <JdSelectQuery text="asd" icon="fa-solid fa-magnifying-glass" placeholder="Busca artículos" v-model="nuevo"
                :spin="spinArticulos" :lista="modal.articulos" @search="searchArticulos" @elegir="addArticulo" />

            <JdButton icon="fa-solid fa-tags" text="Lista de precios" tipo="3" @click="openPreciosLista"
                v-if="modal.socio?.precio_lista" />

            <JdButton icon="fa-solid fa-list-ul" text="Items del pedido" tipo="3" @click="openPedidoItems"
                v-if="modal.socio_pedido_items?.length > 0" />
        </div>

        <JdTable :columns="columns" :datos="modal.transaccion.transaccion_items || []" :colAct="modal.mode != 3"
            :download="false" :seeker="false" minHeight="10rem" maxHeight="30rem" width="60rem"
            :inputsDisabled="modal.mode == 3" @onInput="(action, a) => this[action](a)">

            <template v-slot:cAction="{ item }">
                <JdButton :small="true" tipo="2" icon="fa-solid fa-trash-can" title="Eliminar" @click="quitar(item)" />
            </template>

            <template v-slot:cFv="{ item }">
                <JdInput type="date" v-model="item.fv" :disabled="modal.mode == 3" v-if="item.articulo1.has_fv" />
            </template>

            <template v-slot:cLote="{ item }">
                <JdSelect v-model="item.lote_padre" :lista="item.lotes" mostrar="lote_fv_stock"
                    :loaded="item.lotesLoades || true" @reload="loadLotes(item)" @elegir="setLotePadre(item)"
                    :disabled="modal.mode == 3" />
            </template>
        </JdTable>
    </div>

    <mPreciosLista v-if="useModals.show.mPreciosLista" @sendItems="agregarArticulos" />
    <mPedidoItems v-if="useModals.show.mPedidoItems" @sendItems="agregarPedidoItems" />
</template>

<script>
import JdInput from '@/components/inputs/JdInput.vue'
import JdSelectQuery from '@/components/inputs/JdSelectQuery.vue'
import JdSelect from '@/components/inputs/JdSelect.vue'
import JdButton from '@/components/inputs/JdButton.vue'
import JdTable from '@/components/JdTable.vue'

import mPreciosLista from '@/views/logistica_entrada/pedidos/mPreciosLista.vue'
import mPedidoItems from '@/views/logistica_entrada/compras/mPedidoItems.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get } from '@/utils/crud'
import { jmsg } from '@/utils/swal'
import { getItemFromArray, obtenerNumeroJuliano } from '@/utils/mine'

export default {
    components: {
        JdInput,
        JdSelectQuery,
        JdSelect,
        JdButton,
        JdTable,

        mPreciosLista,
        mPedidoItems,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},

        spinArticulos: false,
        nuevo: null,

        columns: [
            {
                id: 'nombre',
                title: 'Artículo',
                prop: 'articulo1.nombre',
                width: '23rem',
                show: true,
            },
            {
                id: 'unidad',
                title: 'Unidad',
                prop: 'articulo1.unidad',
                width: '5rem',
                show: true,
            },
            {
                id: 'lote_padre',
                title: 'Lote | Fv | Stock',
                slot: 'cLote',
                width: '18rem',
                show: true,
            },
            {
                id: 'lote',
                title: 'Lote',
                width: '6rem',
                show: true,
            },
            {
                id: 'fv',
                title: 'F. venc.',
                slot: 'cFv',
                width: '10rem',
                show: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                type: 'number',
                input: true,
                width: '6rem',
                show: true,
                oninput: 'sumarUno',
            },
            // {
            //     id: 'pu',
            //     title: 'Precio uni.',
            //     toRight: true,
            //     width: '6rem',
            //     show: true,
            // },
            {
                id: 'pu',
                title: 'Precio uni.',
                type: 'number',
                input: true,
                width: '6rem',
                show: true,
                oninput: 'sumarUno',
            },
            {
                id: 'mtoValorVenta',
                title: 'Subtotal',
                format: 'decimal',
                width: '7rem',
                show: true,
                toRight: true,
            },
            {
                id: 'igv',
                title: 'Impuesto',
                format: 'decimal',
                width: '7rem',
                show: true,
                toRight: true,
            },
            {
                id: 'total',
                title: 'Importe',
                format: 'decimal',
                width: '7rem',
                show: true,
                toRight: true,
            },
        ],
    }),
    created() {
        this.modal = this.useModals.mTransaccion

        if (this.modal.transaccion.tipo == 1) {
            this.columns[2].show = false
            // this.columns[6].show = false
        }
        else {
            this.columns[3].show = false
            this.columns[4].show = false
            // this.columns[7].show = false
        }

        this.sumarItems()
    },
    methods: {
        setLote() {
            if (this.modal.transaccion.tipo != 1) return null
            return `${obtenerNumeroJuliano(this.modal.transaccion.fecha)}-${Math.floor(Math.random() * 90 + 10)}`
        },
        async loadLotes(item) {
            item.lotesLoades = false
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.kardex}/lotes/${item.articulo}`)
            this.useAuth.setLoading(false)
            item.lotesLoades = true

            if (res.code !== 0) return

            item.lotes = res.data
        },
        setLotePadre(item) {
            if (item.lote_padre == null) {
                item.stock = null
                return
            }

            item.stock = item.lotes.find(a => a.id == item.lote_padre)?.stock || 0
        },

        async searchArticulos(txtBuscar) {
            if (!txtBuscar) {
                this.modal.articulos.length = 0
                return
            }

            const qry = {
                fltr: {
                    tipo: { op: 'Es', val: this.modal.transaccion.tipo == 1 ? 1 : 2 },
                    activo: { op: 'Es', val: true },
                    nombre: { op: 'Contiene', val: txtBuscar },
                },
                cols: ['unidad', 'igv_afectacion', 'has_fv']
            }

            this.spinArticulos = true
            const res = await get(`${urls.articulos}?qry=${JSON.stringify(qry)}`)
            this.spinArticulos = false

            if (res.code !== 0) return

            this.modal.articulos = JSON.parse(JSON.stringify(res.data))
        },
        addArticulo(item) {
            if (this.nuevo == null) return
            this.nuevo = null
            this.modal.articulos = []

            // const i = this.modal.transaccion.transaccion_items.findIndex(a => a.articulo == item.id)
            // if (i !== -1) return jmsg('warning', 'El artículo ya está agregado')

            this.modal.transaccion.transaccion_items.push({
                articulo: item.id,
                articulo1: {
                    nombre: item.nombre,
                    unidad: item.unidad,
                    has_fv: item.has_fv,
                },

                cantidad: null,

                lote: this.setLote(),
                pu: null,
                igv_afectacion: item.igv_afectacion,
                igv_porcentaje: item.igv_afectacion == '10' ? this.modal.empresa.igv_porcentaje : 0,

                mtoValorVenta: 0,
                igv: 0,
                total: 0,
            })
        },

        async openPreciosLista() {
            if (this.modal.socio.precio_lista1.moneda != this.modal.transaccion.moneda) {
                jmsg('warning', 'La moneda de la lista de precios no es igual a la moneda del pedido')
                return
            }

            const send = {
                precio_lista: {
                    id: this.modal.socio.precio_lista,
                    ...this.modal.socio.precio_lista1,
                    moneda: getItemFromArray(this.modal.socio.precio_lista1.moneda, this.modal.monedas),
                }
            }
            this.useModals.setModal('mPreciosLista', 'Lista de precios', null, send, true)
        },
        agregarArticulos(items) {
            for (const a of items) {
                // const i = this.modal.transaccion.transaccion_items.findIndex(b => b.articulo == a.articulo)
                // if (i !== -1) continue

                this.modal.transaccion.transaccion_items.push({
                    articulo: a.articulo,
                    articulo1: {
                        nombre: a.articulo1.nombre,
                        unidad: a.articulo1.unidad,
                        has_fv: a.articulo1.has_fv,
                    },

                    cantidad: null,

                    lote: this.setLote(),
                    pu: a.precio,
                    igv_afectacion: a.articulo1.igv_afectacion,
                    igv_porcentaje: a.articulo1.igv_afectacion == '10' ? this.modal.empresa.igv_porcentaje : 0,

                    mtoValorVenta: 0,
                    igv: 0,
                    total: 0,
                })
            }
        },

        async openPedidoItems() {
            const send = {
                articulos: this.modal.socio_pedido_items
            }

            this.useModals.setModal('mPedidoItems', 'Items del pedido', null, send, true)
        },
        agregarPedidoItems(items) {
            for (const a of items) {
                // const i = this.modal.transaccion.transaccion_items.findIndex(b => b.articulo == a.articulo)
                // if (i !== -1) continue

                this.modal.transaccion.transaccion_items.push({
                    articulo: a.articulo,
                    articulo1: {
                        nombre: a.articulo1.nombre,
                        unidad: a.articulo1.unidad,
                        has_fv: a.has_fv,
                    },

                    cantidad: a.cantidad,
                    entregado: a.entregado,
                    faltante: a.cantidad - a.entregado,

                    lote: this.setLote(),
                    pu: a.pu,
                    igv_afectacion: a.igv_afectacion,
                    igv_porcentaje: a.igv_porcentaje,

                    mtoValorVenta: 0,
                    igv: 0,
                    total: 0,
                })
            }
        },

        calcularUno(item) {
            if (item.lote_padre) {
                if (item.cantidad > item.stock) {
                    jmsg('warning', 'La cantidad ingresada es mayor al stock del lote')
                    item.cantidad = item.stock
                    return
                }
            }

            item.vu = item.igv_afectacion == '10' ? item.pu / (1 + (item.igv_porcentaje / 100)) : item.pu

            item.mtoValorVenta = item.cantidad * item.vu
            item.igv = item.igv_afectacion == '10' ? item.mtoValorVenta * (item.igv_porcentaje / 100) : 0
            item.total = item.mtoValorVenta + item.igv
        },
        calcularTotales() {
            this.modal.mtoOperGravadas = 0
            this.modal.mtoOperExoneradas = 0
            this.modal.mtoOperInafectas = 0
            this.modal.mtoIGV = 0

            for (const a of this.modal.transaccion.transaccion_items) {
                if (a.igv_afectacion == '10') {
                    this.modal.mtoOperGravadas += a.mtoValorVenta
                    this.modal.mtoIGV += a.igv
                }
                else if (a.igv_afectacion == '20') {
                    this.modal.mtoOperExoneradas += a.mtoValorVenta
                }
                else if (a.igv_afectacion == '30') {
                    this.modal.mtoOperInafectas += a.mtoValorVenta
                }
            }

            this.modal.valorVenta = this.modal.mtoOperGravadas + this.modal.mtoOperExoneradas + this.modal.mtoOperInafectas
            this.modal.mtoImpVenta = this.modal.valorVenta + this.modal.mtoIGV
        },
        sumarUno(item) {
            this.calcularUno(item)

            this.calcularTotales()
        },
        sumarItems() {
            for (const a of this.modal.transaccion.transaccion_items) this.calcularUno(a)

            this.calcularTotales()
        },
        quitar(item) {
            if (item.entregado > 0) return jmsg('error', 'El artículo ya tiene ingresos')

            // const i = this.modal.transaccion.transaccion_items.findIndex(a => a.articulo == item.articulo)
            this.modal.transaccion.transaccion_items.splice(item.i, 1)

            this.calcularTotales()
        },
    },
};
</script>

<style scoped>
.agregar {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 0.5rem;
    margin-bottom: 1rem;
}
</style>
