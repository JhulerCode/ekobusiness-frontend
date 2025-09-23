<template>
    <div class="pedido-items">
        <div
            class="agregar"
            v-if="modal.mode != 3 && modal.socio?.id != null && modal.item.moneda != null"
        >
            <JdSelectQuery
                label="🔍︎"
                placeholder="Busca artículos"
                v-model="nuevo"
                :spin="spinArticulos"
                :lista="modal.articulos"
                @search="searchArticulos"
                @elegir="addArticulo"
            />

            <JdButton
                icon="fa-solid fa-tags"
                text="Lista de precios"
                tipo="3"
                @click="openPreciosLista()"
                v-if="modal.socio.precio_lista"
            />

            <JdButton
                icon="fa-solid fa-file-excel"
                text="Importar"
                tipo="3"
                @click="this.$refs.excel.click()"
                v-if="modal.item.tipo == 2"
            />

            <input type="file" ref="excel" accept=".xlsx, .xls" hidden @change="importar" />
        </div>

        <JdTable
            :columns="columns"
            :datos="modal.item.socio_pedido_items || []"
            :colAct="modal.mode != 3"
            :download="false"
            :seeker="false"
            minHeight="10rem"
            maxHeight="30rem"
            width="60rem"
            :inputsDisabled="modal.mode == 3"
            @onInput="(action, a) => this[action](a)"
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

import { urls, get } from '@/utils/crud'
import { jmsg } from '@/utils/swal'
import { tryOficialExcel, getItemFromArray } from '@/utils/mine'

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

        spinArticulos: false,
        nuevo: null,

        columns: [
            {
                id: 'nombre',
                title: 'Artículo',
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
    },
    methods: {
        async searchArticulos(txtBuscar) {
            if (!txtBuscar) {
                this.modal.articulos.length = 0
                return
            }

            const qry = {
                fltr: {
                    tipo: { op: 'Es', val: this.modal.item.tipo },
                    activo: { op: 'Es', val: true },
                    nombre: { op: 'Contiene', val: txtBuscar },
                },
                cols: ['unidad', 'igv_afectacion', 'has_fv'],
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

            const i = this.modal.item.socio_pedido_items.findIndex((a) => a.articulo == item.id)
            if (i !== -1) return jmsg('warning', 'El artículo ya está agregado')

            this.modal.item.socio_pedido_items.push({
                articulo: item.id,
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
            })
        },

        async openPreciosLista() {
            if (this.modal.socio.precio_lista1.moneda != this.modal.item.moneda) {
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
        agregarArticulos(items) {
            for (const a of items) {
                const i = this.modal.item.socio_pedido_items.findIndex(
                    (b) => b.articulo == a.articulo,
                )
                if (i !== -1) continue

                this.modal.item.socio_pedido_items.push({
                    articulo: a.articulo,
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
                })
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
                    cols: ['unidad', 'codigo_barra', 'has_fv', 'igv_afectacion'],
                }

                this.useAuth.setLoading(true, 'Cargando productos...')
                const res2 = await get(`${urls.articulos}?qry=${JSON.stringify(qry)}`)
                this.useAuth.setLoading(false)

                if (res2.code != 0) return

                const articulosMap = res2.data.reduce(
                    (obj, a) => ((obj[a.codigo_barra] = a), obj),
                    {},
                )
                // return sistemaData[array].reduce((obj, a) => (obj[a.id] = a, obj), {})

                this.modal.item.socio_pedido_items = res.data.map((a) => {
                    const matchedItem = articulosMap[a.EAN] || {}
                    return {
                        articulo: matchedItem?.id,
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

            for (const a of this.modal.item.socio_pedido_items) {
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
        // calcularUno(item) {
        //     item.vu = item.igv_afectacion == '10' ? item.pu / (1 + (item.igv_porcentaje / 100)) : item.pu

        //     item.mtoValorVenta = item.cantidad * item.vu
        //     item.igv = item.igv_afectacion == '10' ? item.mtoValorVenta * (item.igv_porcentaje / 100) : 0
        //     item.total = item.mtoValorVenta + item.igv
        // },
        // calcularTotales() {
        //     this.modal.mtoOperGravadas = 0
        //     this.modal.mtoOperExoneradas = 0
        //     this.modal.mtoOperInafectas = 0
        //     this.modal.mtoIGV = 0

        //     for (const a of this.modal.item.socio_pedido_items) {
        //         if (a.igv_afectacion == '10') {
        //             this.modal.mtoOperGravadas += a.mtoValorVenta
        //             this.modal.mtoIGV += a.igv
        //         }
        //         else if (a.igv_afectacion == '20') {
        //             this.modal.mtoOperExoneradas += a.mtoValorVenta
        //         }
        //         else if (a.igv_afectacion == '30') {
        //             this.modal.mtoOperInafectas += a.mtoValorVenta
        //         }
        //     }

        //     this.modal.valorVenta = this.modal.mtoOperGravadas + this.modal.mtoOperExoneradas + this.modal.mtoOperInafectas
        //     this.modal.mtoImpVenta = this.modal.valorVenta + this.modal.mtoIGV
        // },
        sumarUno(item) {
            this.calcularUno(item)

            this.calcularTotales()
        },
        sumarItems() {
            for (const a of this.modal.item.socio_pedido_items) this.calcularUno(a)

            this.calcularTotales()
        },
        quitar(item) {
            if (item.entregado > 0) return jmsg('error', 'El artículo ya tiene ingresos')

            const i = this.modal.item.socio_pedido_items.findIndex(
                (a) => a.articulo == item.articulo,
            )
            this.modal.item.socio_pedido_items.splice(i, 1)

            this.calcularTotales()
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
