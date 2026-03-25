<template>
    <div class="pedido-items">
        <div class="agregar" v-if="vista.mode != 'view'">
            <template v-if="vista.data.socio_pedido">
                <JdButton
                    icon="fa-solid fa-list-ul"
                    text="Items del pedido"
                    tipo="3"
                    @click="openPedidoItems"
                />
            </template>

            <JdButton
                icon="fa-solid fa-wrench"
                text="Auto colocar lotes"
                tipo="3"
                @click="setLotesAutomatic"
                v-if="vista.data.tipo == 5"
            />
        </div>

        <JdTable
            :columns="columns"
            :datos="vista.data.transaccion_items || []"
            :rowOptions="rowActions"
            rowOptionsMode="buttons"
            @rowOptionSelected="runMethod"
            :inputsDisabled="vista.mode == 'view' || (vista.mode == 'edit' && vista.data.tipo == 5)"
            @onInput="runMethod"
            @onChange="runMethod"
            :agregarFila="agregarFila"
        >
            <template v-slot:cLotes="{ item }">
                <div class="container-lotes">
                    <JdButton
                        :small="true"
                        tipo="2"
                        icon="fa-solid fa-list-ul"
                        title="Lotes"
                        @click="openLotes(item)"
                        v-if="vista.mode != 'view' && item.cantidad > 0"
                    />

                    <ul>
                        <li v-for="(a, i) in item.lotes" :key="i">
                            <div>({{ a.cantidad }})</div>
                            <div>
                                {{ a.codigo }}{{ a.fv ? ' | ' + a.fv : '' }}
                                {{ i == item.lotes.length - 1 ? '' : ',' }}
                            </div>
                        </li>
                    </ul>
                </div>
            </template>
        </JdTable>
    </div>

    <mPedidoItems v-if="modals.show.mPedidoItems" @sendItems="agregarPedidoItems" />
    <mTransaccionItemLotes
        v-if="modals.show.mTransaccionItemLotes"
        @sendItems="updateArticuloLotes"
    />
</template>

<script>
import mPedidoItems from '@/views/compras/compras/mPedidoItems.vue'
import mTransaccionItemLotes from '@/views/compras/compras/mTransaccionItemLotes.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get } from '@/utils/crud'
import { jmsg } from '@/utils/swal'
import { obtenerNumeroJuliano, genCorrelativo } from '@/utils/mine'

export default {
    components: {
        mPedidoItems,
        mTransaccionItemLotes,
    },
    data: () => ({
        auth: useAuth(),
        modals: useModals(),
        vistas: useVistas(),

        nuevo: null,
    }),
    computed: {
        vista() {
            return this.vistas[this.$route.name] || { data: { transaccion_items: [] } }
        },
        columns() {
            return [
                {
                    id: 'articulo',
                    title: 'Artículo',
                    prop: 'articulo1.nombre',
                    width: '30rem',
                    input: !this.$route.params.pedido_id,
                    select_query: {
                        search: this.loadArticulos,
                        elegir: this.elegirArticulo,
                    },
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
                    input: true,
                    type: 'number',
                    onchange: 'setArticuloLotes',
                    width: '8rem',
                    show: true,
                },
                {
                    id: 'lote_padre',
                    title: 'Lote | Fv',
                    slot: 'cLotes',
                    width: '30rem',
                    show: true,
                },
            ]
        },
        rowActions() {
            if (this.vista.mode == 'view') return []
            return [
                {
                    icon: 'fa-solid fa-trash-can',
                    title: 'Eliminar',
                    action: 'removeLine',
                },
            ]
        },
        agregarFila() {
            if (this.vista.mode == 'view') return null
            if (!this.vista.data.socio) return null
            if (this.vista.data.socio_pedido) return null
            return this.addLine
        },
    },
    created() {
        if (this.$route.params.pedido_id) {
            const exec = setInterval(() => {
                if (this.vista.socio_pedido_items) {
                    this.agregarPedidoItems(this.vista.socio_pedido_items)
                    clearInterval(exec)
                }
            }, 100)
        }
    },
    methods: {
        runMethod(method, item) {
            this[method](item)
        },
        async addLine() {
            this.vista.data.transaccion_items.push({
                id: crypto.randomUUID(),
                orden: genCorrelativo(this.vista.data.transaccion_items),
            })
        },
        async removeLine(item) {
            const i = this.vista.data.transaccion_items.findIndex((a) => a.id == item.id)
            this.vista.data.transaccion_items.splice(i, 1)
        },
        async elegirArticulo(articulo, item) {
            if (!articulo) return

            item.articulo = articulo.id
            item.articulo1 = {
                id: articulo.id,
                type: articulo.type,
                nombre: articulo.nombre,
                unidad: articulo.unidad,
                has_fv: articulo.has_fv,
                combo_articulos: articulo.combo_articulos,
            }
            // item.lotes = this.setLotesHoy(articulo)
        },

        //--- Methods ---//
        async openPedidoItems() {
            const send = {
                articulos: this.vista.socio_pedido_items,
                socio_pedido: this.vista.data.socio_pedido,
            }

            this.modals.setModal('mPedidoItems', 'Items del pedido', null, send, true)
        },
        async agregarPedidoItems(items) {
            for (const a of items) {
                const { type, nombre, unidad, combo_articulos } = a.articulo1
                this.addArticulo({
                    id: a.articulo,
                    type,
                    nombre,
                    unidad,
                    combo_articulos,
                    cantidad: a.cantidad,
                    has_fv: a.has_fv,
                    vu: a.pu,
                })
            }
        },
        async addArticulo(item) {
            const i = this.vista.data.transaccion_items.findIndex((a) => a.articulo == item.id)
            if (i !== -1) return jmsg('warning', 'El artículo ya está agregado')

            const send = {
                id: crypto.randomUUID(),
                orden: genCorrelativo(this.vista.data.transaccion_items),
                articulo: item.id,
                articulo1: {
                    id: item.id,
                    type: item.type,
                    nombre: item.nombre,
                    unidad: item.unidad,
                    has_fv: item.has_fv,
                    combo_articulos: item.combo_articulos,
                },
                lotes: this.setLotesHoy(item),

                cantidad: item.cantidad,
                mtoValorVenta: 0,
                igv: 0,
                total: 0,
            }

            this.vista.data.transaccion_items.push(send)
        },
        setLotesHoy(item) {
            if (this.vista.data.tipo != 1) return []

            return [
                {
                    id: crypto.randomUUID(),
                    codigo: `${obtenerNumeroJuliano(this.vista.data.fecha)}-${Math.floor(Math.random() * 90 + 10)}`,
                    vu: item.vu,
                    igv_afectacion: item.igv_afectacion,
                    igv_porcentaje:
                        item.igv_afectacion == '10' ? this.auth.empresa.igv_porcentaje : 0,

                    cantidad: item.cantidad,
                    articulo: item.id,
                },
            ]
        },
        openLotes(item) {
            const type = this.vista.data.tipo == 1 ? 'new' : 'old'
            const send = {
                type,
                fecha: this.vista.data.fecha,
                transaccion_item_id: item.id,
                articulo: item.articulo,
                articulo1: { ...item.articulo1 },
                cantidad: item.cantidad,
                lotes: JSON.parse(JSON.stringify(item.lotes)) || [],
            }

            this.modals.setModal('mTransaccionItemLotes', 'Asignar lotes', null, send, true)
        },
        updateArticuloLotes({ transaccion_item_id, lotes }) {
            const i = this.vista.data.transaccion_items.findIndex(
                (a) => a.id == transaccion_item_id,
            )
            this.vista.data.transaccion_items[i].lotes = lotes
        },
        async setLotesAutomatic() {
            if (this.vista.data.transaccion_items?.length == 0) return

            const falta = this.vista.data.transaccion_items.some((a) => !a.cantidad)

            if (falta == true) return jmsg('warning', 'Ingresa todas las cantidades')

            const to_look_for_ids = []
            for (const a of this.vista.data.transaccion_items) {
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

            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.kardex}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)

            if (res.code !== 0) return

            const lotesMap = {}

            for (const a of res.data) {
                if (!lotesMap[a.articulo]) {
                    lotesMap[a.articulo] = []
                }

                lotesMap[a.articulo].push(a)
            }

            for (const a of this.vista.data.transaccion_items) {
                a.lotes = []

                if (a.articulo1.type == 'combo') {
                    for (const c of a.articulo1.combo_articulos) {
                        const lotes = lotesMap[c.articulo] ?? []

                        for (const lote of lotes) {
                            const kardexes_componente = a.lotes.filter(
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

                            a.lotes.push(send)
                        }
                    }
                } else {
                    const lotes = lotesMap[a.articulo] ?? []

                    for (const lote of lotes) {
                        const total = a.lotes.reduce((sum, s) => sum + (s.cantidad ?? 0), 0)
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

                        a.lotes.push(send)
                    }
                }
            }
        },
        setArticuloLotes(line) {
            if (this.vista.data.tipo == 5) return

            if (line.cantidad == '' || line.cantidad == 0) {
                line.lotes = []
            } else {
                line.lotes = this.setLotesHoy({ ...line.articulo1, cantidad: line.cantidad })
            }
        },

        // async modificar(item) {
        //     if (this.vista.mode != 'edit') return

        //     this.auth.setLoading(true, 'Actualizando...')
        //     const res = await patch(urls.transaccion_items, item)
        //     this.auth.setLoading(false)

        //     if (res.code != 0) return
        // },
        // async quitar(item) {
        //     const i = this.vista.data.transaccion_items.findIndex((a) => a.id == item.id)
        //     this.vista.data.transaccion_items.splice(i, 1)
        // },

        //--- Auxiliar data ---//
        async loadArticulos(txtBuscar) {
            const qry = {
                fltr: {
                    activo: { op: 'Es', val: true },
                },
                cols: ['nombre', 'unidad', 'igv_afectacion', 'has_fv'],
                ordr: [['nombre', 'ASC']],
                limt: 25,
            }

            if (txtBuscar) {
                qry.fltr.nombre = { op: 'Contiene', val: txtBuscar }
            }

            if (this.vista.data.tipo == 1) {
                qry.fltr.purchase_ok = { op: 'Es', val: true }
                // qry.incl = ['articulo_suppliers']
            } else {
                qry.fltr.sale_ok = { op: 'Es', val: true }
            }

            const res = await get(`${urls.articulos}?qry=${JSON.stringify(qry)}`)

            if (res.code !== 0) return []
            return res.data
        },
    },
}
</script>

<style lang="scss" scoped>
.agregar {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.container-lotes {
    display: flex;

    ul {
        display: flex;
        * {
            font-size: 0.9rem;
        }

        li {
            display: flex;
            gap: 0.5rem;
            margin-left: 1rem;
        }
    }
}
</style>
