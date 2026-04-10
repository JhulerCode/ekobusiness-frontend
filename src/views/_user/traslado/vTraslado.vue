<template>
    <VistaDetalleLayout
        :config="VIEW_CONFIG"
        :pestanas="availableTabs"
        :loadNewData="loadNewData"
        :loadExistingData="loadExistingData"
        @runMethod="runMethod"
    >
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
                v-if="vista.data.socio_pedido"
            />

            <JdInput
                label="Guía de remisión"
                :nec="true"
                v-model="vista.data.guia"
                :disabled="vista.mode == 'view'"
                style="grid-column: 4/5"
            />

            <JdSelect
                label="Estado"
                :lista="system.data.transaccion_estados || []"
                v-model="vista.data.estado"
                :disabled="true"
                style="grid-column: 4/5"
            />
        </template>

        <template #pestanas-body>
            <vTrasladoLine v-if="vista.pestana == 1" ref="vTrasladoLine" />
        </template>
    </VistaDetalleLayout>
</template>

<script>
import vTrasladoLine from './vTrasladoLine.vue'

import VIEW_CONFIG from './traslado.config.js'
import { useSystem } from '@/pinia/system.js'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls, post, get, patch } from '@/utils/crud'
import { getItemFromArray, redondear, incompleteData, obtenerNumeroJuliano } from '@/utils/mine'
import { jmsg, jqst } from '@/utils/swal'
import dayjs from 'dayjs'

export default {
    components: {
        vTrasladoLine,
    },
    data: () => ({
        VIEW_CONFIG,
        system: useSystem(),
        auth: useAuth(),
        vistas: useVistas(),
        modals: useModals(),
        getItemFromArray,
        redondear,
    }),
    computed: {
        vista() {
            return this.vistas[this.$route.name]
        },
        availableTabs() {
            return [{ id: 1, label: 'Contenido', show: true }]
        },
        is_nuevo() {
            return this.$route.params[this.vista.pathKey] === 'nuevo'
        },
    },
    created() {
        this.system.load(['transaccion_estados'])
    },
    methods: {
        runMethod(method, item) {
            this[method](item)
        },
        async loadNewData() {
            const socio_pedido_id = this.$route.params.pedido_id
            let tipo
            if (this.$route.name == 'vCompraPedidoEntrega') {
                tipo = 'abastacer_maquila'
            }
            if (this.$route.name == 'vCompraPedidoRecepcion') {
                tipo = 1
            }
            if (this.$route.name == 'vVentaPedidoEntrega') {
                tipo = 5
            }
            if (this.$route.name == 'vCompraTraslado') {
                tipo = 1
            }
            if (this.$route.name == 'vVentaTraslado') {
                tipo = 5
            }

            this.vista.data = {
                tipo,
                fecha: dayjs().format('YYYY-MM-DD'),
                socio_pedido: socio_pedido_id,
                estado: 1,
                transaccion_items: [],
            }

            if (socio_pedido_id) await this.loadSocioPedido()
        },
        async loadExistingData() {
            const param_id = this.$route.params[this.vista.pathKey]

            const qry = {
                incl: ['socio1', 'socio_pedido1', 'transaccion_items'],
                iccl: {
                    transaccion_items: { incl: ['articulo1', 'kardexes1'] },
                },
            }

            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${param_id}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)

            if (res.code === 0 && res.data) {
                //--- TRAER LOTES ---//
                const lotes_ids = []
                for (const a of res.data.transaccion_items) {
                    for (const b of a.kardexes) {
                        lotes_ids.push(b.lote_id)
                    }
                }

                const qry = {
                    fltr: {
                        id: { op: 'Es', val: lotes_ids },
                    },
                    cols: ['id', 'codigo', 'fv', 'lote_fv'],
                }
                this.auth.setLoading(true, 'Cargando...')
                const lotes_res = await get(`${urls.lotes}?qry=${JSON.stringify(qry)}`)
                this.auth.setLoading(false)

                const lotes = lotes_res.data

                for (const a of res.data.transaccion_items) {
                    for (const b of a.kardexes) {
                        b.cantidad = Number(b.cantidad)
                        b.lote1 = lotes.find((c) => c.id == b.lote_id)
                    }
                }

                this.vista.data = res.data
                document.title = `Traslado ${this.vista.data[this.vista.titleKey] || ''}`
                if (res.data.socio_pedido) await this.loadSocioPedido(res.data.socio_pedido1)
            }
        },

        //--- Header actions ---//
        async guardar() {
            if (this.checkDatos()) return
            // console.log(this.vista.data)
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
                this.vista.data.id = res.data.id

                this.$router.replace({
                    name: this.$route.name,
                    params: { [this.vista.pathKey]: res.data.id },
                })
            }

            this.vista.mode = 'view'
        },
        async facturar() {
            // const cantidad_comprobantes = await this.loadComprobantesPreviosCantidad()

            // if (cantidad_comprobantes == 0) {
            //     this.$router.push({
            //         name: 'vCompraTrasladoComprobante',
            //         params: { comprobante_id: 'nuevo' },
            //     })
            // } else {
            this.$router.push({ name: 'vCompraTrasladoComprobantes' })
            // }
        },
        abrir() {
            this.abrirCerrar('1')
        },
        cerrar() {
            this.abrirCerrar('2')
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

                if (!a.kardexes || a.kardexes.length == 0) {
                    jmsg('warning', `Agregue al menos un lote en ${a.articulo1.nombre}`)
                    return true
                }

                if (this.vista.data.tipo == 1) {
                    for (const b of a.kardexes) {
                        if (!b.lote1.codigo) {
                            jmsg('warning', `Falta codigo de lote en ${a.articulo1.nombre}`)
                            return true
                        }

                        if (a.articulo1.has_fv && !b.lote1.fv) {
                            jmsg('warning', `Falta fecha de vencimiento en ${a.articulo1.nombre}`)
                            return true
                        }
                    }
                }

                // if (this.vista.data.tipo == 5) {
                //     if (a.articulo1.type != 'combo') {
                //         const kardexesTotal = a.kardexes.reduce(
                //             (sum, a) => sum + (a.cantidad ?? 0),
                //             0,
                //         )

                //         if (kardexesTotal != a.cantidad) {
                //             jmsg('warning', `Cantidades diferentes en ${a.articulo1.nombre}`)
                //             return true
                //         }
                //     } else {
                //         const kardexesTotales = {}
                //         for (const b of a.kardexes) {
                //             if (!kardexesTotales[b.articulo]) {
                //                 kardexesTotales[b.articulo] = 0
                //             }
                //             kardexesTotales[b.articulo] += b.cantidad
                //         }

                //         for (const b of a.articulo1.combo_articulos) {
                //             const cantidadComponente = b.cantidad * a.cantidad
                //             if (cantidadComponente != kardexesTotales[b.articulo]) {
                //                 jmsg('warning', `Cantidades diferentes en ${b.articulo1.nombre}`)
                //                 return true
                //             }
                //         }
                //     }
                // }
            }

            return false
        },
        async changeDate() {
            if (this.vista.data.tipo == 1) {
                for (const a of this.vista.data.transaccion_items) {
                    for (const b of a.kardexes) {
                        b.lote1.codigo = this.setLote()
                    }
                }
            }
        },
        setLote() {
            return `${obtenerNumeroJuliano(this.vista.data.fecha)}-${Math.floor(Math.random() * 90 + 10)}`
        },
        async abrirCerrar(estado) {
            const resQst = await jqst(
                `¿Está seguro de ${estado == 1 ? 'abrir' : 'cerrar'} ${this.vista.data.tipo == 1 ? 'la recepción' : 'la entrega'}?`,
            )
            if (resQst.isConfirmed == false) return

            if (estado == 2) {
                const qry_ci = {
                    incl: ['comprobante1'],
                    cols: ['articulo', 'cantidad'],
                    fltr: { 'comprobante1.traslado_id': { op: 'Es', val: this.vista.data.id } },
                }

                this.auth.setLoading(true, 'Cargando...')
                const res_ci = await get(`${urls.comprobante_items}?qry=${JSON.stringify(qry_ci)}`)
                this.auth.setLoading(false)

                if (res_ci.code != 0) return

                const itemsMap = {}

                // 1. acumular comprobantes
                for (const { articulo, cantidad } of res_ci.data) {
                    if (!itemsMap[articulo]) {
                        itemsMap[articulo] = {
                            comprobante: 0,
                            transaccion: 0,
                            nombre: null,
                        }
                    }

                    itemsMap[articulo].comprobante += cantidad
                }

                // 2. acumular transacciones
                for (const a of this.vista.data.transaccion_items) {
                    if (!itemsMap[a.articulo]) {
                        itemsMap[a.articulo] = {
                            comprobante: 0,
                            transaccion: 0,
                            nombre: a.articulo1?.nombre,
                        }
                    }

                    itemsMap[a.articulo].transaccion += a.cantidad

                    // asegurar nombre (por si ya existía desde comprobante)
                    if (!itemsMap[a.articulo].nombre) {
                        itemsMap[a.articulo].nombre = a.articulo1?.nombre
                    }
                }

                // 4. detectar diferencias directamente
                const diferencias = Object.entries(itemsMap)
                    .filter(([, item]) => item.comprobante !== item.transaccion)
                    .map(([articulo, item]) => ({ articulo, ...item }))

                // 5. resultado
                if (diferencias.length) {
                    return jmsg('warning', `Facturación incompleta`)
                }
            }

            const send = { id: this.vista.data.id, estado }

            this.auth.setLoading(true, `${estado == 1 ? 'Abriendo' : 'Cerrando'}...`)
            const res = await patch(
                `${this.vista.apiUrl}/abrir-cerrar`,
                send,
                `Traslado ${estado == 1 ? 'abierto' : 'cerrado'} correctamente`,
            )
            this.auth.setLoading(false)

            if (res.code != 0) return

            this.vista.data.estado = res.data.estado
            this.vista.data.estado1 = res.data.estado1
        },

        //--- Auxiliar data ---//
        async loadSocios(txtBuscar) {
            const qry = {
                fltr: {
                    tipo: { op: 'Es', val: this.vista.data.tipo == 1 ? 1 : 2 },
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
        async loadSocioPedido() {
            const pedido_id = this.$route.params.pedido_id
            const vPedido = this.$route.path.includes('compras') ? 'vCompraPedido' : 'vVentaPedido'

            this.vista.socio_pedido = {}

            if (this.vistas[vPedido]?.data?.id == pedido_id) {
                this.vista.socio_pedido = this.vistas[vPedido].data
            } else {
                const qry = {
                    incl: ['socio1', 'moneda1', 'socio_pedido_items', 'createdBy1'],
                    iccl: {
                        socio1: {
                            cols: ['doc_numero', 'contactos', 'direcciones', 'pago_condicion'],
                        },
                        socio_pedido_items: {
                            incl: ['articulo1'],
                            sqls: ['pedido_item_entregado'],
                        },
                        createdBy1: { cols: ['cargo', 'telefono'] },
                    },
                }

                this.auth.setLoading(true, 'Cargando pedido...')
                const res = await get(
                    `${urls.socio_pedidos}/uno/${pedido_id}?qry=${JSON.stringify(qry)}`,
                )
                this.auth.setLoading(false)

                if (res.code !== 0 || !res.data) return this.auth.goBack(this.$router)

                this.vista.socio_pedido = res.data

                this.vistas.initVista(vPedido, 'detail')
                this.vistas.updateVista(vPedido, {
                    titleKey: 'codigo',
                    pathKey: 'pedido_id',
                    data: this.vista.socio_pedido,
                })
            }

            if (this.is_nuevo) {
                this.vista.data.socio = this.vista.socio_pedido.socio
                this.vista.data.socio1 = this.vista.socio_pedido.socio1

                //--- CREAR ITEMS DEL COMPROBANTE ---//
                const por_trasladar = this.vista.socio_pedido.socio_pedido_items
                    .filter((a) => Number(a.pedido_item_entregado) < a.cantidad)
                    .map((a) => ({
                        ...a,
                        cantidad: (a.cantidad - a.pedido_item_entregado).toFixed(2),
                    }))

                this.$nextTick(() => {
                    this.$refs.vTrasladoLine.agregarPedidoItems(por_trasladar)
                })
            }

            this.vista.data.socio_pedido1 = {
                id: this.vista.socio_pedido.id,
                codigo: this.vista.socio_pedido.codigo,
            }
        },
        async loadComprobantesPreviosCantidad() {
            const qry = {
                fltr: {
                    traslado_id: { op: 'Es', val: this.vista.data.id },
                },
            }

            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.comprobantes}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)

            if (res.code != 0) return

            return res.data.length
        },
    },
}
</script>
