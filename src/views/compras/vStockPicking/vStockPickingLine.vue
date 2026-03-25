<template>
    <div class="pedido-items">
        <div class="agregar" v-if="vista.mode != 'view' && vista.data.socio != null">
            <template v-if="vista.data.tipo == 1 || vista.data.tipo == 5">
                <template v-if="vista.data.socio_pedido">
                    <JdButton
                        icon="fa-solid fa-list-ul"
                        text="Items del pedido"
                        tipo="3"
                        @click="openPedidoItems"
                    />
                </template>
            </template>

            <template v-if="vista.data.tipo == 'abastacer_maquila'">
                <JdSelectQuery
                    text="asd"
                    icon="fa-solid fa-magnifying-glass"
                    placeholder="Buscar artículos"
                    v-model="nuevo"
                    :spin="vista.spinArticulos"
                    :lista="vista.articulos"
                    @search="searchArticulos"
                    @elegir="addArticulo"
                />

                <JdButton
                    icon="fa-solid fa-list-ul"
                    text="Lista de materiales"
                    tipo="3"
                    @click="openPedidoMrpBomLines"
                />
            </template>

            <template v-if="vista.data.tipo == 5 || vista.data.tipo == 'abastacer_maquila'">
                <JdButton
                    icon="fa-solid fa-wrench"
                    text="Auto colocar lotes"
                    tipo="3"
                    @click="setLotes"
                    v-if="vista.data.transaccion_items?.length > 0"
                />
            </template>
        </div>

        <JdTable
            :columns="columns"
            :datos="vista.data.transaccion_items || []"
            :rowOptions="rowActions"
            rowOptionsMode="buttons"
            @rowOptionSelected="runMethod"
            :inputsDisabled="vista.mode == 'view' || (vista.mode == 'edit' && vista.data.tipo == 5)"
            @onInput="runMethod"
        >
            <template v-slot:cFv="{ item }">
                <div class="container-compra-fv">
                    <p class="lote">{{ item.lote }}</p>

                    <JdInput
                        type="date"
                        v-model="item.fv"
                        :disabled="vista.mode == 'view'"
                        v-if="item.articulo1?.has_fv"
                    />
                </div>
            </template>

            <template v-slot:cLote="{ item }">
                <JdButton
                    :small="true"
                    tipo="2"
                    icon="fa-solid fa-list-ul"
                    title="Lotes"
                    @click="openLotes(item)"
                    v-if="vista.mode != 'view' && item.cantidad > 0"
                />

                <ul class="container-lotes-padre">
                    <li v-for="(a, i) in item.kardexes" :key="i">
                        <div>({{ a.cantidad }})</div>
                        <div>{{ a.lote_padre1.lote_fv_stock }}</div>
                    </li>
                </ul>
            </template>
        </JdTable>
    </div>

    <mPedidoItems v-if="modals.show.mPedidoItems" @sendItems="agregarPedidoItems" />
    <mTransaccionItemLotes v-if="modals.show.mTransaccionItemLotes" @sendItems="setArticuloLotes" />
</template>

<script>
import mPedidoItems from '@/views/compras/compras/mPedidoItems.vue'
import mTransaccionItemLotes from '@/views/compras/compras/mTransaccionItemLotes.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, patch } from '@/utils/crud'
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

        columns: [
            {
                id: 'articulo',
                title: 'Artículo',
                prop: 'articulo1.nombre',
                width: '25rem',
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
                oninput: 'sumarUno',
                width: '6rem',
                show: true,
            },
            {
                id: 'lote_padre',
                title: 'Lote | Fv',
                slot: 'cLote',
                width: '19rem',
                show: true,
            },
        ],
    }),
    computed: {
        vista() {
            return this.vistas[this.$route.name] || { data: { transaccion_items: [] } }
        },
        rowActions() {
            if (this.vista.mode == 'view') return []
            return [
                {
                    icon: 'fa-solid fa-trash-can',
                    title: 'Eliminar',
                    action: 'quitar',
                },
            ]
        },
    },
    watch: {
        'vista.socio_pedido_items': {
            handler(items) {
                if (items && this.vista.data.transaccion_items.length == 0) {
                    this.agregarPedidoItems(items)
                }
            },
            immediate: true,
        },
    },
    methods: {
        setLoteHoy() {
            if (this.vista.data.tipo != 1) return null
            return `${obtenerNumeroJuliano(this.vista.data.fecha)}-${Math.floor(Math.random() * 90 + 10)}`
        },

        async addArticulo(item) {
            const i = this.vista.data.transaccion_items.findIndex((a) => a.articulo == item.id)
            if (i !== -1) return jmsg('warning', 'El artículo ya está agregado')

            const send = {
                id: crypto.randomUUID(),
                orden: this.setOrden(),
                articulo: item.id,
                articulo1: {
                    type: item.type,
                    nombre: item.nombre,
                    unidad: item.unidad,
                    has_fv: item.has_fv,
                    combo_articulos: item.combo_articulos,
                },

                cantidad: item.cantidad,
                lote1: this.vista.data.tipo == 1 ? { codigo: this.setLoteHoy() } : {},

                igv_afectacion: item.igv_afectacion,
                igv_porcentaje: item.igv_afectacion == '10' ? this.auth.empresa.igv_porcentaje : 0,

                mtoValorVenta: 0,
                igv: 0,
                total: 0,
            }

            this.vista.data.transaccion_items.push(send)
        },

        async openPedidoItems() {
            const send = {
                articulos: this.vista.socio_pedido_items,
                socio_pedido: this.vista.data.socio_pedido,
            }

            this.modals.setModal('mPedidoItems', 'Items del pedido', null, send, true)
        },
        async agregarPedidoItems(items) {
            for (const a of items) {
                const { articulo, type, nombre, unidad, combo_articulos } = a.articulo1
                this.addArticulo({
                    id: articulo,
                    type,
                    nombre,
                    unidad,
                    combo_articulos,
                    cantidad: a.cantidad,
                    has_fv: a.has_fv,
                })
            }
        },

        runMethod(method, item) {
            this[method](item)
        },
        openLotes(item) {
            const send = {
                transaccion_item: item.id,
                articulo: item.articulo,
                articulo1: { ...item.articulo1 },
                cantidad: item.cantidad,
                kardexes: item.kardexes || [],
            }

            this.modals.setModal('mTransaccionItemLotes', 'Asignar lotes', null, send, true)
        },
        setArticuloLotes({ transaccion_item, kardexes }) {
            const i = this.vista.data.transaccion_items.findIndex((a) => a.id == transaccion_item)
            this.vista.data.transaccion_items[i].kardexes = kardexes
        },
        async setLotes() {
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
            if (this.vista.mode != 'edit') return

            this.auth.setLoading(true, 'Actualizando...')
            const res = await patch(urls.transaccion_items, item)
            this.auth.setLoading(false)

            if (res.code != 0) return
        },
        async quitar(item) {
            const i = this.vista.data.transaccion_items.findIndex((a) => a.id == item.id)
            this.vista.data.transaccion_items.splice(i, 1)
        },
        setOrden() {
            return genCorrelativo(this.vista.data.transaccion_items, 'orden')
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
