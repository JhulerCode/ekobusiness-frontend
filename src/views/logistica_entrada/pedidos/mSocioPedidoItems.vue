<template>
    <div class="pedido-items">
        <div
            class="agregar"
            v-if="
                modal.mode != 3 &&
                modal.socio_elegido?.id != null &&
                modal.socio_pedido.moneda != null
            "
        >
            <JdSelectQuery
                label="🔍︎"
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
                @click="openPreciosLista()"
                v-if="modal.socio_elegido.precio_lista"
            />

            <JdButton
                icon="fa-solid fa-file-excel"
                text="Importar"
                tipo="3"
                @click="this.$refs.excel.click()"
                v-if="modal.socio_pedido.tipo == 2"
            />

            <input type="file" ref="excel" accept=".xlsx, .xls" hidden @change="importar" />
        </div>

        <JdTable
            :columns="columns"
            :datos="modal.socio_pedido.socio_pedido_items || []"
            :colAct="modal.mode != 3"
            :download="false"
            :seeker="false"
            :maxHeight="modal.mode == 3 ? '18rem' : '14.5rem'"
            :inputsDisabled="modal.mode == 3"
            @onInput="runMethod"
            @onChange="runMethod"
        >
            <template v-slot:cAction="{ item }">
                <JdButton
                    :small="true"
                    tipo="2"
                    icon="fa-solid fa-trash-can"
                    title="Eliminar"
                    @click="quitar(item)"
                />
            </template>
        </JdTable>
    </div>

    <mPreciosLista v-if="useModals.show.mPreciosLista" @sendItems="agregarArticulos" />
</template>

<script>
import { JdSelectQuery, JdButton, JdTable } from '@jhuler/components'

import mPreciosLista from '@/views/logistica_entrada/pedidos/mPreciosLista.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, post, patch, delet } from '@/utils/crud'
import { jmsg, jqst } from '@/utils/swal'
import { tryOficialExcel, getItemFromArray, genCorrelativo } from '@/utils/mine'

export default {
    components: {
        JdSelectQuery,
        JdButton,
        JdTable,
        mPreciosLista,
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
            },
            {
                id: 'unidad',
                title: 'Unidad',
                width: '5rem',
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
                onchange: 'modificar',
            },
            {
                id: 'entregado',
                title: 'Entregado',
                type: 'number',
                width: '6rem',
                show: false,
            },
            {
                id: 'pu',
                title: 'Valor unitario',
                type: 'number',
                input: true,
                width: '6rem',
                show: true,
                oninput: 'sumarUno',
                onchange: 'modificar',
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
        this.modal = this.useModals.mSocioPedido

        this.sumarItems()

        if (this.modal.mode == 3) {
            this.columns.find((c) => c.id == 'entregado').show = true
        }
    },
    methods: {
        async searchArticulos(txtBuscar) {
            if (!txtBuscar) {
                this.modal.articulos.length = 0
                return
            }

            const qry = {
                fltr: {
                    tipo: { op: 'Es', val: this.modal.socio_pedido.tipo },
                    activo: { op: 'Es', val: true },
                    nombre: { op: 'Contiene', val: txtBuscar },
                },
                cols: ['nombre', 'unidad', 'igv_afectacion', 'has_fv'],
                ordr: [['nombre', 'ASC']],
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

            const i = this.modal.socio_pedido.socio_pedido_items.findIndex(
                (a) => a.articulo == item.id,
            )
            if (i !== -1) return jmsg('warning', 'El artículo ya está agregado')

            const send = {
                orden: this.setOrden(),
                articulo: item.id,
                articulo1: {
                    nombre: item.nombre,
                },
                nombre: item.nombre,
                unidad: item.unidad,
                has_fv: item.has_fv,

                cantidad: null,

                pu: null,
                igv_afectacion: item.igv_afectacion,
                igv_porcentaje: item.igv_afectacion == '10' ? this.modal.empresa.igv_porcentaje : 0,

                mtoValorVenta: 0,
                igv: 0,
                total: 0,
            }

            if (this.modal.mode == 2) {
                send.socio_pedido = this.modal.socio_pedido.id

                this.useAuth.setLoading(true, 'Agregando...')
                const res = await post(urls.socio_pedido_items, send, 'Agregado con éxito')
                this.useAuth.setLoading(false)

                if (res.code != 0) return

                send.id = res.data.id
            }

            this.modal.socio_pedido.socio_pedido_items.push(send)
        },

        async openPreciosLista() {
            if (this.modal.socio_elegido.precio_lista1.moneda != this.modal.socio_pedido.moneda) {
                jmsg(
                    'warning',
                    'La moneda de la lista de precios no es igual a la moneda del pedido',
                )
                return
            }

            const send = {
                precio_lista: {
                    id: this.modal.socio_elegido.precio_lista,
                    ...this.modal.socio_elegido.precio_lista1,
                    moneda: getItemFromArray(
                        this.modal.socio_elegido.precio_lista1.moneda,
                        this.modal.monedas,
                    ),
                },
            }
            this.useModals.setModal('mPreciosLista', 'Lista de precios', null, send, true)
        },
        async agregarArticulos(items) {
            for (const a of items) {
                const i = this.modal.socio_pedido.socio_pedido_items.findIndex(
                    (b) => b.articulo == a.articulo,
                )
                if (i !== -1) continue

                const send = {
                    orden: this.setOrden(),
                    articulo: a.articulo,
                    articulo1: {
                        nombre: a.articulo1.nombre,
                    },
                    nombre: a.articulo1.nombre,
                    unidad: a.articulo1.unidad,
                    has_fv: a.articulo1.has_fv,

                    cantidad: null,

                    pu: a.precio,
                    igv_afectacion: a.articulo1.igv_afectacion,
                    igv_porcentaje:
                        a.articulo1.igv_afectacion == '10' ? this.modal.empresa.igv_porcentaje : 0,

                    mtoValorVenta: 0,
                    igv: 0,
                    total: 0,
                }

                if (this.modal.mode == 2) {
                    send.socio_pedido = this.modal.socio_pedido.id

                    this.useAuth.setLoading(true, 'Agregando...')
                    const res = await post(urls.socio_pedido_items, send, 'Agregado con éxito')
                    this.useAuth.setLoading(false)

                    if (res.code != 0) return

                    send.id = res.data.id
                }

                this.modal.socio_pedido.socio_pedido_items.push(send)
            }
        },

        importar(event) {
            this.useAuth.setLoading(true, 'Cargando archivo...')

            const file = event.target.files[0]
            const reader = new FileReader()

            reader.onload = async () => {
                const headers = ['EAN', 'Nombre', 'Cantidad', 'Valor unitario']

                const res = await tryOficialExcel(this.$refs.excel, file, reader, headers)
                // console.log(res)

                if (res.code != 0) {
                    this.useAuth.setLoading(false)
                    return jmsg('error', res.msg)
                }

                // ----- BUSCA LOS ARTICULOS ----- //
                const qry = {
                    fltr: {
                        tipo: { op: 'Es', val: 2 },
                        activo: { op: 'Es', val: true },
                        codigo_barra: { op: 'Son', val: res.data.map((a) => a.EAN) },
                    },
                    cols: ['nombre', 'unidad', 'codigo_barra', 'has_fv', 'igv_afectacion'],
                    ordr: [['nombre', 'ASC']],
                }

                this.useAuth.setLoading(true, 'Cargando productos...')
                const res2 = await get(`${urls.articulos}?qry=${JSON.stringify(qry)}`)
                this.useAuth.setLoading(false)

                if (res2.code != 0) return

                const articulosMap = res2.data.reduce(
                    (obj, a) => ((obj[a.codigo_barra] = a), obj),
                    {},
                )

                this.modal.socio_pedido.socio_pedido_items = res.data.map((a) => {
                    const matchedItem = articulosMap[a.EAN] || {}
                    return {
                        orden: this.setOrden(),
                        articulo: matchedItem?.id,
                        articulo1: {
                            nombre: matchedItem?.nombre,
                        },
                        nombre: matchedItem?.nombre,
                        unidad: matchedItem?.unidad,
                        has_fv: matchedItem?.has_fv,

                        cantidad: a.Cantidad,

                        pu: a['Valor unitario'],
                        igv_afectacion: matchedItem?.igv_afectacion,
                        igv_porcentaje:
                            matchedItem?.igv_afectacion == '10'
                                ? this.modal.empresa.igv_porcentaje
                                : 0,

                        mtoValorVenta: 0,
                        igv: 0,
                        total: 0,
                    }
                })

                this.sumarItems()
            }
            reader.readAsArrayBuffer(file)
        },

        calcularUno(item) {
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

            for (const a of this.modal.socio_pedido.socio_pedido_items) {
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
            for (const a of this.modal.socio_pedido.socio_pedido_items) this.calcularUno(a)

            this.calcularTotales()
        },

        async modificar(item) {
            if (this.modal.mode != 2) return

            this.useAuth.setLoading(true, 'Actualizando...')
            const res = await patch(urls.socio_pedido_items, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return
        },
        async quitar(item) {
            if (item.entregado > 0) return jmsg('error', 'El artículo ya tiene ingresos')

            if (this.modal.mode == 2) {
                const qst = await jqst('¿Está seguro de eliminar?')
                if (!qst.isConfirmed) return

                this.useAuth.setLoading(true, 'Eliminando...')
                const res = await delet(urls.socio_pedido_items, item)
                this.useAuth.setLoading(false)

                if (res.code != 0) return
            }

            this.modal.socio_pedido.socio_pedido_items.splice(item.i, 1)

            this.calcularTotales()
        },

        runMethod(method, item) {
            this[method](item)
        },
        setOrden() {
            return genCorrelativo(this.modal.socio_pedido.socio_pedido_items, 'orden')
        },
    },
}
</script>

<style scoped>
.agregar {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 0.5rem;
    margin-bottom: 1rem;
}
</style>
