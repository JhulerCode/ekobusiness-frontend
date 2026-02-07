<template>
    <div class="pedido-items">
        <div
            class="agregar"
            v-if="
                modal.mode != 3 &&
                modal.transaccion.socio != null &&
                modal.transaccion.moneda != null &&
                modal.transaccion.tipo_cambio
            "
        >
            <template v-if="!modal.transaccion.socio_pedido">
                <JdSelectQuery
                    text="asd"
                    icon="fa-solid fa-magnifying-glass"
                    placeholder="Busca artículos"
                    v-model="nuevo"
                    :spin="modal.spinArticulos"
                    :lista="modal.articulos"
                    @search="searchArticulos"
                    @elegir="addArticulo"
                />

                <JdButton
                    icon="fa-solid fa-tags"
                    text="Lista de precios"
                    tipo="3"
                    @click="openPreciosLista"
                    v-if="modal.socio?.precio_lista"
                />
            </template>

            <template v-if="modal.transaccion.socio_pedido">
                <JdButton
                    icon="fa-solid fa-list-ul"
                    text="Items del pedido"
                    tipo="3"
                    @click="openPedidoItems"
                    v-if="modal.transaccion.tipo == 5 && modal.mode == 1"
                />

                <JdButton
                    icon="fa-solid fa-list-ul"
                    text="Items del pedido"
                    tipo="3"
                    @click="openPedidoItems"
                />
            </template>

            <template v-if="modal.transaccion.tipo == 5 && modal.mode != 3">
                <JdButton
                    icon="fa-solid fa-wrench"
                    text="Auto colocar lotes"
                    tipo="3"
                    @click="setLotes"
                    v-if="modal.transaccion.transaccion_items.length > 0"
                />
            </template>
        </div>

        <JdTable
            :columns="columns"
            :datos="modal.transaccion.transaccion_items || []"
            :colAct="modal.mode == 1 || (modal.mode == 2 && modal.transaccion.tipo != 5)"
            :download="false"
            :seeker="modal.transaccion.socio_pedido != null"
            :maxHeight="modal.mode == 3 ? '18rem' : '14.5rem'"
            :inputsDisabled="modal.mode == 3 || (modal.mode == 2 && modal.transaccion.tipo == 5)"
            @onInput="runMethod"
        >
            <!-- :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod" -->
            <template v-slot:cAction="{ item }">
                <!-- <JdButton
                    :small="true"
                    tipo="2"
                    icon="fa-solid fa-copy"
                    title="Duplicar"
                    @click="duplicar(item)"
                /> -->
                <JdButton
                    :small="true"
                    tipo="2"
                    icon="fa-solid fa-trash-can"
                    title="Eliminar"
                    @click="quitar(item)"
                />
            </template>

            <template v-slot:cFv="{ item }">
                <div class="container-compra-fv">
                    <p class="lote">{{ item.lote }}</p>
                    <JdInput
                        type="date"
                        v-model="item.fv"
                        :disabled="modal.mode == 3"
                        v-if="item.articulo1?.has_fv"
                    />
                </div>
            </template>

            <template v-slot:cLote="{ item }">
                <JdButton
                    :small="true"
                    tipo="2"
                    icon="fa-solid fa-copy"
                    title="Lotes"
                    @click="openLotes(item)"
                    v-if="modal.mode != 3 && item.cantidad > 0"
                />

                <ul class="container-lotes-padre">
                    <li v-for="(a, i) in item.kardexes" :key="i">
                        <div>({{ a.cantidad }})</div>
                        <div>{{ a.lote_padre1.lote_fv_stock }}</div>
                    </li>
                </ul>

                <!-- <JdSelect
                    v-model="item.lote_padre"
                    :lista="item.lotes"
                    mostrar="lote_fv_stock"
                    :loaded="item.lotesLoades || true"
                    @reload="loadLotes(item)"
                    @elegir="setLotePadre(item)"
                    :disabled="modal.mode == 3"
                /> -->
            </template>
        </JdTable>
    </div>

    <mPreciosLista v-if="useModals.show.mPreciosLista" @sendItems="agregarArticulosDePrecioLista" />
    <mPedidoItems v-if="useModals.show.mPedidoItems" @sendItems="agregarPedidoItems" />
    <mTransaccionItemLotes
        v-if="useModals.show.mTransaccionItemLotes"
        @sendItems="setArticuloLotes"
    />
</template>

<script>
import { JdInput, JdSelectQuery, JdButton, JdTable } from '@jhuler/components'

import mPreciosLista from '@/views/logistica_entrada/pedidos/mPreciosLista.vue'
import mPedidoItems from '@/views/logistica_entrada/compras/mPedidoItems.vue'
import mTransaccionItemLotes from '@/views/logistica_entrada/compras/mTransaccionItemLotes.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, post, patch, delet } from '@/utils/crud'
import { jmsg, jqst } from '@/utils/swal'
import { getItemFromArray, obtenerNumeroJuliano, genCorrelativo } from '@/utils/mine'

export default {
    components: {
        JdInput,
        JdSelectQuery,
        JdButton,
        JdTable,

        mPreciosLista,
        mPedidoItems,
        mTransaccionItemLotes,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},

        nuevo: null,

        columns: [
            {
                id: 'articulo',
                title: 'Artículo',
                prop: 'articulo1.nombre',
                width: '23rem',
                show: true,
                sort: true,
                seek: true,
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
                input: true,
                type: 'number',
                oninput: 'sumarUno',
                width: '6rem',
                show: true,
            },
            {
                id: 'pu',
                title: 'Valor unitario',
                type: 'number',
                input: true,
                width: '6rem',
                show: true,
                oninput: 'sumarUno',
            },
            {
                id: 'fv',
                title: 'Lote | Fv',
                slot: 'cFv',
                width: '14.5rem',
                show: false,
            },
            {
                id: 'lote_padre',
                title: 'Lote | Fv | Stock',
                slot: 'cLote',
                width: '17rem',
                show: false,
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
        // tableRowOptions: [
        //     {
        //         label: 'Duplicar',
        //         icon: 'fa-solid fa-copy',
        //         action: 'duplicar',
        //     },
        //     {
        //         label: 'Quitar',
        //         icon: 'fa-solid fa-trash-can',
        //         action: 'quitar',
        //         permiso: 'vVentas:crear',
        //     },
        // ],
    }),
    created() {
        this.modal = this.useModals.mTransaccion

        this.setColumns()
        this.sumarItems()
    },
    methods: {
        setColumns() {
            if (this.modal.transaccion.tipo == 1) {
                this.columns[4].show = true
            } else {
                this.columns[5].show = true
            }
        },
        setLoteHoy() {
            if (this.modal.transaccion.tipo != 1) return null
            return `${obtenerNumeroJuliano(this.modal.transaccion.fecha)}-${Math.floor(Math.random() * 90 + 10)}`
        },
        // async loadLotes(item) {
        //     const qry = {
        //         incl: ['articulo1'],
        //         cols: [
        //             'fecha',
        //             'moneda',
        //             'tipo_cambio',
        //             'pu',
        //             'igv_afectacion',
        //             'igv_porcentaje',
        //             'fv',
        //             'lote',
        //             'stock',
        //             'lote_fv_stock',
        //         ],
        //         fltr: {
        //             articulo: { op: 'Es', val: item.articulo },
        //             is_lote_padre: { op: 'Es', val: true },
        //         },
        //         ordr: [['lote', 'DESC']],
        //     }

        //     item.lotesLoades = false
        //     this.useAuth.setLoading(true, 'Cargando...')
        //     const res = await get(`${urls.kardex}?qry=${JSON.stringify(qry)}`)
        //     this.useAuth.setLoading(false)
        //     item.lotesLoades = true

        //     if (res.code !== 0) return

        //     item.lotes = res.data
        // },
        // setLotePadre(item) {
        //     console.log(item)
        //     // if (item.lote_padre == null) {
        //     //     item.stock = null
        //     //     return
        //     // }

        //     // item.stock = item.lotes.find((a) => a.id == item.lote_padre)?.stock || 0
        // },

        async searchArticulos(txtBuscar) {
            if (!txtBuscar) {
                this.modal.articulos.length = 0
                return
            }

            const qry = {
                fltr: {
                    activo: { op: 'Es', val: true },
                    nombre: { op: 'Contiene', val: txtBuscar },
                },
                cols: ['type', 'nombre', 'unidad', 'igv_afectacion', 'has_fv', 'combo_articulos'],
                ordr: [['nombre', 'ASC']],
            }

            if (this.modal.transaccion.tipo == 1) {
                qry.fltr.purchase_ok = { op: 'Es', val: true }
            } else {
                qry.fltr.sale_ok = { op: 'Es', val: true }
            }

            this.modal.spinArticulos = true
            const res = await get(`${urls.articulos}?qry=${JSON.stringify(qry)}`)
            this.modal.spinArticulos = false

            if (res.code !== 0) return

            this.modal.articulos = JSON.parse(JSON.stringify(res.data))
        },
        async addArticulo(item) {
            if (this.nuevo == null) return
            this.nuevo = null
            this.modal.articulos = []

            // const i = this.modal.transaccion.transaccion_items.findIndex(a => a.articulo == item.id)
            // if (i !== -1) return jmsg('warning', 'El artículo ya está agregado')

            const send = {
                orden: this.setOrden(),
                id: crypto.randomUUID(),
                articulo: item.id,
                articulo1: {
                    type: item.type,
                    nombre: item.nombre,
                    unidad: item.unidad,
                    has_fv: item.has_fv,
                    combo_articulos: item.combo_articulos,
                },

                cantidad: null,
                lote: this.setLoteHoy(),

                pu: null,
                igv_afectacion: item.igv_afectacion,
                igv_porcentaje: item.igv_afectacion == '10' ? this.modal.empresa.igv_porcentaje : 0,

                mtoValorVenta: 0,
                igv: 0,
                total: 0,
            }

            if (this.modal.mode == 2) {
                send.transaccion = this.modal.transaccion.id

                this.useAuth.setLoading(true, 'Agregando...')
                const res = await post(urls.transaccion_items, send, 'Agregado con éxito')
                this.useAuth.setLoading(false)

                if (res.code != 0) return

                send.id = res.data.id
            }

            this.modal.transaccion.transaccion_items.push(send)
        },

        async openPreciosLista() {
            if (this.modal.socio.precio_lista1.moneda != this.modal.transaccion.moneda) {
                jmsg(
                    'warning',
                    'La moneda de la lista de precios no es igual a la moneda del pedido',
                )
                return
            }

            const send = {
                precio_lista: {
                    id: this.modal.socio.precio_lista,
                    ...this.modal.socio.precio_lista1,
                    moneda: getItemFromArray(
                        this.modal.socio.precio_lista1.moneda,
                        this.modal.monedas,
                    ),
                },
            }
            this.useModals.setModal('mPreciosLista', 'Lista de precios', null, send, true)
        },
        async agregarArticulosDePrecioLista(items) {
            for (const a of items) {
                // const i = this.modal.transaccion.transaccion_items.findIndex(b => b.articulo == a.articulo)
                // if (i !== -1) continue

                const send = {
                    orden: this.setOrden(),
                    id: crypto.randomUUID(),
                    articulo: a.articulo,
                    articulo1: {
                        type: a.articulo1.type,
                        nombre: a.articulo1.nombre,
                        unidad: a.articulo1.unidad,
                        has_fv: a.articulo1.has_fv,
                        combo_articulos: a.articulo1.combo_articulos,
                    },

                    cantidad: null,
                    lote: this.setLoteHoy(),

                    pu: a.precio,
                    igv_afectacion: a.articulo1.igv_afectacion,
                    igv_porcentaje:
                        a.articulo1.igv_afectacion == '10' ? this.modal.empresa.igv_porcentaje : 0,

                    mtoValorVenta: 0,
                    igv: 0,
                    total: 0,
                }

                if (this.modal.mode == 2) {
                    send.transaccion = this.modal.transaccion.id

                    this.useAuth.setLoading(true, 'Agregando...')
                    const res = await post(urls.transaccion_items, send, 'Agregado con éxito')
                    this.useAuth.setLoading(false)

                    if (res.code != 0) return

                    send.id = res.data.id
                }

                this.modal.transaccion.transaccion_items.push(send)
            }
        },

        async openPedidoItems() {
            const send = {
                articulos: this.modal.socio_pedido_items,
                socio_pedido: this.modal.transaccion.socio_pedido,
            }

            this.useModals.setModal('mPedidoItems', 'Items del pedido', null, send, true)
        },
        async agregarPedidoItems(items) {
            for (const a of items) {
                // const i = this.modal.transaccion.transaccion_items.findIndex(
                //     (b) => b.articulo == a.articulo,
                // )

                // if (i === -1) continue
                const send = {
                    orden: this.setOrden(),
                    id: crypto.randomUUID(),
                    articulo: a.articulo,
                    articulo1: {
                        type: a.articulo1.type,
                        nombre: a.articulo1.nombre,
                        unidad: a.articulo1.unidad,
                        has_fv: a.has_fv,
                        combo_articulos: a.articulo1.combo_articulos,
                    },

                    cantidad: a.cantidad,
                    // entregado: a.entregado,
                    // faltante: a.cantidad - a.entregado,

                    lote: this.setLoteHoy(),

                    pu: a.pu,
                    igv_afectacion: a.igv_afectacion,
                    igv_porcentaje: a.igv_porcentaje,

                    mtoValorVenta: 0,
                    igv: 0,
                    total: 0,
                }

                if (this.modal.mode == 2) {
                    send.transaccion = this.modal.transaccion.id

                    this.useAuth.setLoading(true, 'Agregando...')
                    const res = await post(urls.transaccion_items, send, 'Agregado con éxito')
                    this.useAuth.setLoading(false)

                    if (res.code != 0) return

                    send.id = res.data.id
                }

                this.modal.transaccion.transaccion_items.push(send)
                // } else {
                //     this.modal.transaccion.transaccion_items[i].cantidad += a.cantidad
                // }
            }

            this.sumarItems()
        },

        calcularUno(item) {
            if (item.lote_padre) {
                if (item.cantidad > item.stock) {
                    jmsg('warning', 'La cantidad ingresada es mayor al stock del lote')
                    item.cantidad = item.stock
                    return
                }
            }

            item.vu =
                item.igv_afectacion == '10' ? item.pu * (1 + item.igv_porcentaje / 100) : item.pu

            item.mtoValorVenta = item.cantidad * item.pu
            item.igv =
                item.igv_afectacion == '10' ? item.mtoValorVenta * (item.igv_porcentaje / 100) : 0
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
                } else if (a.igv_afectacion == '20') {
                    this.modal.mtoOperExoneradas += a.mtoValorVenta
                } else if (a.igv_afectacion == '30') {
                    this.modal.mtoOperInafectas += a.mtoValorVenta
                }
            }

            this.modal.valorVenta =
                this.modal.mtoOperGravadas +
                this.modal.mtoOperExoneradas +
                this.modal.mtoOperInafectas
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

        runMethod(method, item) {
            this[method](item)
        },
        // duplicar(item) {
        //     const send = JSON.parse(JSON.stringify(item))
        //     delete send.i
        //     this.modal.transaccion.transaccion_items.splice(item.i + 1, 0, send)
        // },
        openLotes(item) {
            const send = {
                transaccion_item: item.id,
                articulo: item.articulo,
                articulo1: { ...item.articulo1 },
                cantidad: item.cantidad,
                kardexes: item.kardexes || [],
            }

            this.useModals.setModal('mTransaccionItemLotes', 'Asignar lotes', null, send, true)
        },
        setArticuloLotes({ transaccion_item, kardexes }) {
            const i = this.modal.transaccion.transaccion_items.findIndex(
                (a) => a.id == transaccion_item,
            )
            this.modal.transaccion.transaccion_items[i].kardexes = kardexes
        },
        async setLotes() {
            const falta = this.modal.transaccion.transaccion_items.some((a) => !a.cantidad)

            if (falta == true) return jmsg('warning', 'Ingresa todas las cantidades')

            const to_look_for_ids = []
            for (const a of this.modal.transaccion.transaccion_items) {
                if (a.articulo1.type == 'combo') {
                    for (const b of a.articulo1.combo_articulos) {
                        to_look_for_ids.push(b.articulo)
                    }
                } else {
                    to_look_for_ids.push(a.articulo)
                }
            }

            const qry = {
                incl: ['articulo1'],
                cols: ['articulo', 'fv', 'lote', 'stock', 'lote_fv_stock'],
                fltr: {
                    articulo: { op: 'Es', val: to_look_for_ids },
                    is_lote_padre: { op: 'Es', val: true },
                    stock: { op: '>', val: 0 },
                },
                ordr: [
                    ['createdAt', 'ASC'],
                    ['lote', 'ASC'],
                    ['fv', 'ASC'],
                ],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.kardex}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code !== 0) return

            const lotesMap = {}

            for (const a of res.data) {
                if (!lotesMap[a.articulo]) {
                    lotesMap[a.articulo] = []
                }

                lotesMap[a.articulo].push(a)
            }

            for (const a of this.modal.transaccion.transaccion_items) {
                a.kardexes = []

                if (a.articulo1.type == 'combo') {
                    for (const c of a.articulo1.combo_articulos) {
                        const lotes = lotesMap[c.articulo] ?? []

                        for (const lote of lotes) {
                            const kardexes_componente = a.kardexes.filter(
                                (d) => d.articulo == c.articulo,
                            )
                            const total = kardexes_componente.reduce(
                                (sum, s) => sum + (s.cantidad ?? 0),
                                0,
                            )
                            const falta = c.cantidad * a.cantidad - total
                            if (falta == 0) break

                            const send = {
                                articulo1: { ...lote.articulo1 },

                                articulo: lote.articulo,
                                cantidad: a.cantidad - total,
                                lote_padre: lote.id,
                                lote_padre1: {
                                    lote_fv_stock: lote.lote_fv_stock,
                                    stock: lote.stock,
                                },
                            }

                            if (falta <= lote.stock) {
                                send.cantidad = falta
                            } else {
                                send.cantidad = Number(lote.stock)
                            }

                            a.kardexes.push(send)
                        }
                    }
                } else {
                    const lotes = lotesMap[a.articulo] ?? []

                    for (const lote of lotes) {
                        const total = a.kardexes.reduce((sum, s) => sum + (s.cantidad ?? 0), 0)
                        const falta = a.cantidad - total
                        if (falta == 0) break

                        const send = {
                            articulo1: { ...lote.articulo1 },

                            articulo: lote.articulo,
                            cantidad: a.cantidad - total,
                            lote_padre: lote.id,
                            lote_padre1: {
                                lote_fv_stock: lote.lote_fv_stock,
                                stock: lote.stock,
                            },
                        }

                        if (falta <= lote.stock) {
                            send.cantidad = falta
                        } else {
                            send.cantidad = Number(lote.stock)
                        }

                        a.kardexes.push(send)
                    }
                }
            }
        },

        async modificar(item) {
            if (this.modal.mode != 2) return

            this.useAuth.setLoading(true, 'Actualizando...')
            const res = await patch(urls.transaccion_items, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return
        },
        async quitar(item) {
            if (this.modal.mode == 2) {
                const qst = await jqst('¿Está seguro de eliminar?')
                if (!qst.isConfirmed) return

                this.useAuth.setLoading(true, 'Eliminando...')
                const res = await delet(urls.transaccion_items, item)
                this.useAuth.setLoading(false)

                if (res.code != 0) return
            }

            const i = this.modal.transaccion.transaccion_items.findIndex((a) => a.id == item.id)
            this.modal.transaccion.transaccion_items.splice(i, 1)

            this.calcularTotales()
        },
        setOrden() {
            return genCorrelativo(this.modal.transaccion.transaccion_items, 'orden')
        },
    },
}
</script>

<style lang="scss" scoped>
.agregar {
    // display: grid;
    // grid-template-columns: 1fr auto auto;
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.container-compra-fv {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    .lote {
        font-size: 0.8rem;
    }
}

.container-lotes-padre {
    * {
        font-size: 0.8rem;
    }

    li {
        display: grid;
        grid-template-columns: 4rem auto;
    }
}
</style>
