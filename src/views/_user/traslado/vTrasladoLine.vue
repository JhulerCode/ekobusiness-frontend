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
            :inputsDisabled="vista.mode == 'view'"
            @onInput="runMethod"
            @onChange="runMethod"
            :agregarFila="agregarFila"
        >
            <template v-slot:cLotes="{ item }">
                <div class="container-kardexes">
                    <JdButton
                        :small="true"
                        tipo="2"
                        icon="fa-solid fa-list-ul"
                        title="Lotes"
                        @click="openKardexes(item)"
                        v-if="vista.mode != 'view' && item.cantidad > 0"
                    />

                    <ul>
                        <li v-for="(a, i) in item.kardexes" :key="i">
                            <div>
                                {{ a.lote1?.lote_fv }}
                                {{ i == item.kardexes.length - 1 ? '' : ',' }}
                            </div>
                            <div>({{ a.cantidad }})</div>
                        </li>
                    </ul>
                </div>
            </template>
        </JdTable>
    </div>

    <mPedidoItems v-if="modals.show?.mPedidoItems" @sendItems="agregarPedidoItems" />
    <mTrasladoItemLotes
        v-if="modals.show?.mTrasladoItemLotes"
        @sendItems="updateArticuloKardexes"
    />
</template>

<script>
import mPedidoItems from './mPedidoItems.vue'
import mTrasladoItemLotes from './mTrasladoItemLotes.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get } from '@/utils/crud'
import { jmsg } from '@/utils/swal'
import { obtenerNumeroJuliano, genCorrelativo } from '@/utils/mine'

export default {
    components: {
        mPedidoItems,
        mTrasladoItemLotes,
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
                    width: '30rem',
                    input: true,
                    disabled: this.$route.params.pedido_id,
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
                    onchange: 'setKardexesOnUpdateCantidad',
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
        if (this.$route.params.pedido_id && this.$route.params.pedido_id != 'nuevo') {
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

        //--- Agregar filas ---//
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
        },
        async agregarPedidoItems(items) {
            const faltantes = items.filter((a) => a.cantidad > a.entregado)
            for (const a of faltantes) {
                const i = this.vista.data.transaccion_items.findIndex(
                    (b) => b.articulo == a.articulo,
                )

                if (i !== -1) {
                    // jmsg('warning', 'El artículo ya está agregado')
                    continue
                }

                const send = {
                    id: crypto.randomUUID(),
                    orden: genCorrelativo(this.vista.data.transaccion_items),
                    articulo: a.articulo,
                    cantidad: a.cantidad,
                    //--- RELACIONADOS ---//
                    articulo1: {
                        ...a.articulo1,
                        has_fv: a.has_fv,
                    },
                    kardexes: this.setKardexesHoy(a),
                }

                this.vista.data.transaccion_items.push(send)
            }
        },

        //--- Lotes ---//
        setKardexesHoy(item) {
            if (this.vista.data.tipo != 1) return []

            return [
                {
                    id: crypto.randomUUID(),
                    lote1: {
                        id: crypto.randomUUID(),
                        codigo: `${obtenerNumeroJuliano(this.vista.data.fecha)}-${Math.floor(Math.random() * 90 + 10)}`,
                        vu: item.vu,
                        igv_afectacion: item.igv_afectacion,
                        igv_porcentaje:
                            item.igv_afectacion == '10' ? this.auth.empresa.igv_porcentaje : 0,
                    },
                    cantidad: item.cantidad,
                },
            ]
        },
        setKardexesOnUpdateCantidad(line) {
            if (this.vista.data.tipo == 5) {
                line.kardexes = []
                return
            }

            if (this.vista.data.tipo == 1) {
                if (line.cantidad == '' || line.cantidad == 0) {
                    line.kardexes = []
                } else {
                    line.kardexes = this.setKardexesHoy({
                        ...line.articulo1,
                        cantidad: line.cantidad,
                    })
                }
            }
        },
        updateArticuloKardexes({ transaccion_item_id, kardexes }) {
            const i = this.vista.data.transaccion_items.findIndex(
                (a) => a.id == transaccion_item_id,
            )
            this.vista.data.transaccion_items[i].kardexes = kardexes
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
                a.kardexes = []

                if (a.articulo1.type == 'combo') {
                    for (const c of a.articulo1.combo_articulos) {
                        const kardexes = lotesMap[c.articulo] ?? []

                        for (const lote of kardexes) {
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
                    const kardexes = lotesMap[a.articulo] ?? []

                    for (const lote of kardexes) {
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

        //--- Methods ---//
        async openPedidoItems() {
            const send = {
                articulos: this.vista.socio_pedido_items,
                socio_pedido: this.vista.data.socio_pedido,
            }

            this.modals.setModal('mPedidoItems', 'Items del pedido', null, send, true)
        },
        openKardexes(item) {
            const type = this.vista.data.tipo == 1 ? 'new' : 'old'
            const send = {
                type,
                fecha: this.vista.data.fecha,
                transaccion_item_id: item.id,
                articulo: item.articulo,
                articulo1: { ...item.articulo1 },
                cantidad: item.cantidad,
                kardexes: JSON.parse(JSON.stringify(item.kardexes)) || [],
            }

            this.modals.setModal('mTrasladoItemLotes', 'Asignar lotes', null, send, true)
        },

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

.container-kardexes {
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
