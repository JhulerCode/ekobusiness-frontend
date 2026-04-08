<template>
    <div class="pedido-items">
        <div class="agregar" v-if="vista.mode != 'view'">
            <JdButton
                icon="fa-solid fa-list-ul"
                text="Items del pedido"
                tipo="3"
                @click="openPedidoItems"
                v-if="vista.data.socio_pedido && vista.data.tipo != 'abastacer_maquila'"
            />

            <JdButton
                icon="fa-solid fa-wrench"
                text="Auto colocar lotes"
                tipo="3"
                @click="setLotesAutomatic"
                v-if="vista.data.tipo != 1 && vista.data.transaccion_items.length > 0"
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
                                {{ a.lote1?.codigo }}
                                {{ a.lote1?.fv ? ' | ' + a.lote1.fv : '' }} ({{ a.cantidad }})
                                {{ i == item.kardexes.length - 1 ? '' : ',' }}
                            </div>
                        </li>
                    </ul>
                </div>
            </template>
        </JdTable>
    </div>
    <!-- <pre>{{ vista.data.transaccion_items[0] ?? '' }}</pre> -->
    <mPedidoItems v-if="modals?.show?.mPedidoItems" @sendItems="agregarPedidoItems" />
    <mTrasladoItemLotes
        v-if="modals?.show?.mTrasladoItemLotes"
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
                    id: 'lotes',
                    title: 'Lote | Fv',
                    slot: 'cLotes',
                    width: '50rem',
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
            if (this.vista.data.socio_pedido && this.vista.data.tipo != 'abastacer_maquila') {
                return null
            }
            return this.addLine
        },
    },
    created() {
        // if (
        //     this.$route.params.pedido_id &&
        //     this.$route.params.pedido_id != 'nuevo' &&
        //     this.$route.name != 'vCompraPedidoEntrega'
        // ) {
        //     const exec = setInterval(() => {
        //         if (this.vista.socio_pedido.socio_pedido_items) {
        //             this.agregarPedidoItems(this.vista.socio_pedido.socio_pedido_items)
        //             clearInterval(exec)
        //         }
        //     }, 100)
        // }
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
        async agregarPedidoItems(items) {
            for (const a of items) {
                const i = this.vista.data.transaccion_items.findIndex(
                    (b) => b.articulo == a.articulo,
                )

                if (i !== -1) {
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
                    kardexes: this.setKardexesHoy({
                        id: a.articulo1.id,
                        cantidad: a.cantidad,
                        vu: a.pu,
                        igv_afectacion: a.articulo1.igv_afectacion,
                    }),
                    vu_pedido: a.pu,
                }

                this.vista.data.transaccion_items.push(send)
            }
        },
        async elegirArticulo(articulo, item) {
            if (!articulo) {
                item.articulo1 = {}
                return
            }

            item.articulo = articulo.id
            item.articulo1 = {
                id: articulo.id,
                type: articulo.type,
                nombre: articulo.nombre,
                unidad: articulo.unidad,
                has_fv: articulo.has_fv,
                igv_afectacion: articulo.igv_afectacion,
            }
        },

        //--- Lotes ---//
        setKardexesHoy(item) {
            if (this.vista.data.tipo == 5) return []

            if (this.vista.data.tipo == 1) {
                let moneda = 'PEN'
                if (this.vista.socio_pedido) {
                    moneda = this.vista.socio_pedido.moneda
                }

                let tipo_cambio = 1
                if (this.vista.socio_pedido) {
                    if (this.vista.socio_pedido.moneda != this.auth.empresa.moneda)
                        tipo_cambio = 3.5
                }

                let vu = 1
                if (this.vista.socio_pedido) {
                    vu = item.vu
                }

                const kdx = [
                    {
                        id: crypto.randomUUID(),
                        articulo: item.id,
                        lote1: {
                            id: crypto.randomUUID(),
                            codigo: `${obtenerNumeroJuliano(this.vista.data.fecha)}-${Math.floor(Math.random() * 90 + 10)}`,
                            moneda,
                            tipo_cambio,
                            vu,
                            igv_afectacion: item.igv_afectacion,
                            igv_porcentaje: this.auth.empresa.igv_porcentaje,
                        },
                        cantidad: item.cantidad,
                    },
                ]

                return kdx
            }
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
                        id: line.articulo,
                        cantidad: line.cantidad,
                        vu: line.vu_pedido,
                        igv_afectacion: line.articulo1.igv_afectacion,
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

            //--- Traemos componentes de combos ---//
            const combos_ids = []
            for (const a of this.vista.data.transaccion_items) {
                if (a.articulo1.type == 'combo') {
                    combos_ids.push(a.articulo)
                }
            }

            if (combos_ids.length > 0) {
                const combo_componentes = await this.loadComboComponentes(combos_ids)

                for (const a of this.vista.data.transaccion_items) {
                    if (a.articulo1.type == 'combo') {
                        a.articulo1.combo_componentes = combo_componentes.filter(
                            (b) => b.articulo_principal == a.articulo,
                        )
                    }
                }
            }

            //--- Traemos lotes de articulos --//
            const articulos_ids = []
            for (const a of this.vista.data.transaccion_items) {
                if (a.articulo1.type == 'combo') {
                    for (const b of a.articulo1.combo_componentes) {
                        articulos_ids.push(b.articulo)
                    }
                } else {
                    articulos_ids.push(a.articulo)
                }
            }

            const qry = {
                incl: ['articulo1'],
                cols: ['articulo', 'fv', 'codigo', 'stock', 'lote_fv', 'lote_fv_stock'],
                fltr: {
                    articulo: { op: 'Es', val: articulos_ids },
                    stock: { op: '>', val: 0 },
                },
                ordr: [
                    ['createdAt', 'ASC'],
                    ['codigo', 'ASC'],
                    ['fv', 'ASC'],
                ],
            }

            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.lotes}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)

            if (res.code !== 0) return

            //--- Agrupamos lotes por articulo --//
            const lotesMap = {}
            for (const a of res.data) {
                if (!lotesMap[a.articulo]) {
                    lotesMap[a.articulo] = []
                }

                lotesMap[a.articulo].push(a)
            }

            //--- Asignamos lotes a transaccion_items --//
            for (const a of this.vista.data.transaccion_items) {
                a.kardexes = []

                if (a.articulo1.type == 'combo') {
                    for (const b of a.articulo1.combo_componentes) {
                        const lotes = lotesMap[b.articulo] ?? []

                        for (const lote of lotes) {
                            const kardexes_componente = a.kardexes.filter(
                                (d) => d.articulo == b.articulo,
                            )
                            const total = kardexes_componente.reduce(
                                (sum, s) => sum + (s.cantidad ?? 0),
                                0,
                            )
                            const falta = b.cantidad * a.cantidad - total
                            if (falta == 0) break

                            const send = {
                                componente: b.id,
                                articulo: lote.articulo,
                                articulo1: lote.articulo1,
                                cantidad: a.cantidad - total,
                                lote_id: lote.id,
                                // lote1: { id: lote.id, lote_fv_stock: lote.lote_fv_stock },
                                lote1: lote,
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
                            articulo: lote.articulo,
                            articulo1: { ...lote.articulo1 },
                            cantidad: a.cantidad - total,
                            lote_id: lote.id,
                            // lote1: { id: lote.id, lote_fv_stock: lote.lote_fv_stock },
                            lote1: lote,
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
                articulos: this.vista.socio_pedido.socio_pedido_items.filter(
                    (a) => a.pedido_item_entregado < a.cantidad,
                ),
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
                kardexes: JSON.parse(JSON.stringify(item.kardexes || [])),
            }

            this.modals.setModal('mTrasladoItemLotes', 'Asignar lotes', null, send, true)
        },

        //--- Auxiliar data ---//
        async loadArticulos(txtBuscar) {
            const qry = {
                fltr: {
                    activo: { op: 'Es', val: true },
                },
                cols: ['type', 'nombre', 'unidad', 'has_fv', 'igv_afectacion'],
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
        async loadComboComponentes(ids) {
            const qry = {
                cols: ['articulo_principal', 'articulo', 'orden', 'cantidad'],
                incl: ['articulo1'],
                fltr: {
                    articulo_principal: {
                        op: 'Es',
                        val: ids,
                    },
                },
                ordr: [['orden', 'ASC']],
            }

            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.combo_componentes}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)

            if (res.code !== 0) return

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
    display: grid;
    grid-template-columns: 1.75rem auto;
    gap: 1rem;

    ul {
        display: flex;
        gap: 0.5rem;

        * {
            font-size: 0.9rem;
        }

        li {
            display: flex;
        }
    }
}
</style>
