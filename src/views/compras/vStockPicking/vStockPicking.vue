<template>
    <VistaDetalleLayout :config="VIEW_CONFIG" :pestanas="availableTabs" @runMethod="runMethod">
        <template #principal-datos>
            <JdSelectQuery
                :label="vista.data.tipo == 1 ? 'Proveedor' : 'Cliente'"
                :nec="true"
                :search="loadSocios"
                mostrar="nombres"
                v-model="vista.data.socio"
                :selectedObject="vista.data.socio1"
                :disabled="vista.mode == 'view' || vista.data.socio_pedido != null"
                style="grid-column: 1/3"
            />

            <JdInput
                type="date"
                label="Fecha"
                :nec="true"
                v-model="vista.data.fecha"
                @change="changeDate"
                :disabled="vista.mode == 'view'"
                style="grid-column: 4/5"
            />

            <JdSelectQuery
                label="Nro pedido"
                :nec="true"
                mostrar="codigo"
                v-model="vista.data.socio_pedido"
                :selectedObject="vista.data.socio_pedido1"
                :disabled="true"
                style="grid-column: 1/2"
            />

            <JdInput
                label="Guía de remisión"
                :nec="true"
                v-model="vista.data.guia"
                :disabled="vista.mode == 'view'"
                style="grid-column: 4/5"
            />
        </template>

        <template #pestanas-body>
            <vStockPickingLine v-if="vista.pestana == 1" />
        </template>
    </VistaDetalleLayout>
</template>

<script>
import vStockPickingLine from './vStockPickingLine.vue'

import VIEW_CONFIG from './stock_picking.config.js'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls, post, get, patch } from '@/utils/crud'
import { getItemFromArray, redondear, incompleteData, obtenerNumeroJuliano } from '@/utils/mine'
import { jmsg } from '@/utils/swal'
import dayjs from 'dayjs'

export default {
    components: {
        vStockPickingLine,
    },
    data: (vm) => ({
        currentRouteName: vm.$route.name,
        VIEW_CONFIG,
        auth: useAuth(),
        vistas: useVistas(),
        modals: useModals(),
        getItemFromArray,
        redondear,
    }),
    computed: {
        vista() {
            return this.vistas[this.$route.name] || { data: {} }
        },
        availableTabs() {
            return [{ id: 1, label: 'Contenido', show: true }]
        },
        is_nuevo() {
            return this.$route.params.picking_id === 'nuevo'
        },
    },
    async created() {
        const exec = setInterval(() => {
            if (this.vista) {
                this.loadStockPicking()
                clearInterval(exec)
            }
        }, 100)
    },
    unmounted() {
        delete this.vistas[this.currentRouteName]
    },
    methods: {
        runMethod(method, item) {
            this[method](item)
        },
        async loadStockPicking() {
            const socio_pedido_id = this.$route.params.id
            const param_id = this.$route.params.picking_id

            if (param_id === 'nuevo') {
                this.vista.data = {
                    fecha: dayjs().format('YYYY-MM-DD'),
                    socio_pedido: socio_pedido_id,
                    estado: 1,
                    transaccion_items: [],
                }

                if (socio_pedido_id) {
                    await this.loadSocioPedido(socio_pedido_id)
                }

                this.vista.mode = 'edit'
                return
            }

            const qry = {
                incl: ['socio1', 'socio_pedido1', 'transaccion_items'],
                iccl: {
                    transaccion_items: { incl: ['articulo1', 'lotes', 'kardexes_all'] },
                },
            }

            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${param_id}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)

            if (res.code === 0) {
                for (const a of res.data.transaccion_items) {
                    for (const b of a.lotes) {
                        const i = a.kardexes.find((c) => c.lote_id == b.id)
                        b.cantidad = i ? Number(i.cantidad) : 0
                    }
                }

                this.vista.data = res.data
                document.title = `Guía ${this.vista.data.guia || ''}`
            }

            if (res.data == null) {
                this.$router.back()
            }
        },

        // --- Header actions ---
        async guardar() {
            if (this.checkDatos()) return

            this.auth.setLoading(true, 'Guardando...')
            let res
            if (this.is_nuevo) {
                res = await post(this.vista.apiUrl, this.vista.data)
            } else {
                res = await patch(this.vista.apiUrl, this.vista.data)
            }
            this.auth.setLoading(false)

            if (res.code != 0) return

            if (this.is_nuevo) {
                this.$router.push({ name: this.$route.name, params: { id: res.data.id } })
            }

            this.vista.mode = 'view'
        },

        //--- Methods --//
        checkDatos() {
            const props = ['tipo', 'fecha', 'socio', 'guia']

            if (incompleteData(this.vista.data, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            if (this.vista.data.transaccion_items.length == 0) {
                jmsg('warning', 'Agregue al menos un articulo')
                return true
            }

            for (const a of this.vista.data.transaccion_items) {
                const props1 = ['articulo', 'cantidad']

                if (incompleteData(a, props1)) {
                    jmsg('warning', 'Ingrese los datos necesarios de los articulos')
                    return true
                }

                if (!a.lotes || a.lotes.length == 0) {
                    jmsg('warning', `Agregue al menos un lote en ${a.articulo1.nombre}`)
                    return true
                }

                if (a.articulo1.type != 'combo') {
                    const kardexesTotal = a.lotes.reduce((sum, a) => sum + (a.cantidad ?? 0), 0)

                    if (kardexesTotal != a.cantidad) {
                        jmsg('warning', `Cantidades diferentes en ${a.articulo1.nombre}`)
                        return true
                    }
                } else {
                    const kardexesTotales = {}
                    for (const b of a.lotes) {
                        if (!kardexesTotales[b.articulo]) {
                            kardexesTotales[b.articulo] = 0
                        }
                        kardexesTotales[b.articulo] += b.cantidad
                    }

                    for (const b of a.articulo1.combo_articulos) {
                        const cantidadComponente = b.cantidad * a.cantidad
                        if (cantidadComponente != kardexesTotales[b.articulo]) {
                            jmsg('warning', `Cantidades diferentes en ${b.articulo1.nombre}`)
                            return true
                        }
                    }
                }
            }

            return false
        },
        async changeDate() {
            if (this.vista.data.tipo == 1) {
                for (const a of this.vista.data.transaccion_items) {
                    for (const b of a.lotes) {
                        console.log(b)
                        b.codigo = this.setLote()
                    }
                }
            }
        },
        setLote() {
            return `${obtenerNumeroJuliano(this.vista.data.fecha)}-${Math.floor(Math.random() * 90 + 10)}`
        },

        //--- Auxiliar data ---//
        async loadSocios(txtBuscar) {
            const qry = {
                fltr: {
                    tipo: { op: 'Es', val: this.vista.data.tipo == 1 ? 1 : 5 },
                    activo: { op: 'Es', val: true },
                },
                cols: ['nombres', 'contactos', 'direcciones', 'precio_lista', 'pago_condicion'],
                incl: ['precio_lista1'],
                ordr: [['nombres', 'ASC']],
                limt: 25,
            }

            if (txtBuscar) {
                qry.fltr.nombres = { op: 'Contiene', val: txtBuscar }
            }

            const res = await get(`${urls.socios}?qry=${JSON.stringify(qry)}`)

            if (res.code !== 0) return

            return res.data
        },
        async loadSocioPedido(pedido_id) {
            const qry = {
                incl: ['socio1', 'moneda1', 'socio_pedido_items', 'createdBy1'],
                iccl: {
                    socio1: {
                        cols: [
                            'doc_numero',
                            'contactos',
                            'direcciones',
                            'precio_lista',
                            'pago_condicion',
                        ],
                    },
                    socio_pedido_items: { incl: ['articulo1'] },
                    createdBy1: { cols: ['cargo', 'telefono'] },
                },
            }

            this.auth.setLoading(true, 'Cargando pedido...')
            const res = await get(
                `${urls.socio_pedidos}/uno/${pedido_id}?qry=${JSON.stringify(qry)}`,
            )
            this.auth.setLoading(false)

            if (res.code === 0) {
                const pedido = res.data
                this.vista.data.tipo = pedido.tipo == 1 ? 1 : 5
                this.vista.data.socio = pedido.socio
                this.vista.data.socio1 = pedido.socio1
                this.vista.data.socio_pedido1 = { id: pedido.id, codigo: pedido.codigo }
                this.vista.data.moneda = pedido.moneda
                this.vista.data.pago_condicion = pedido.pago_condicion

                // Add items from pedido
                this.vista.socio_pedido_items = pedido.socio_pedido_items
            }
        },
    },
}
</script>

<style lang="scss" scoped></style>
