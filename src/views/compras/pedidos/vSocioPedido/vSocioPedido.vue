<template>
    <VistaDetalleLayout :config="VIEW_CONFIG" :pestanas="availableTabs" @runMethod="runMethod">
        <template #principal-datos>
            <JdInput
                label="Nro pedido"
                v-model="vista.data.codigo"
                :disabled="vista.mode == 'view'"
            />

            <JdInput
                type="date"
                label="Fecha de emisión"
                :nec="true"
                v-model="vista.data.fecha"
                :disabled="vista.mode == 'view'"
                style="grid-column: 4/5"
            />

            <JdSelectQuery
                :label="vista.data.tipo == 1 ? 'Proveedor' : 'Cliente'"
                :nec="true"
                :search="loadSocios"
                mostrar="nombres"
                v-model="vista.data.socio"
                :selectedObject="vista.data.socio1"
                @elegir="setSocio"
                :disabled="vista.mode == 'view'"
                style="grid-column: 1/3"
            />

            <JdInput
                type="date"
                label="Fecha de entrega"
                v-model="vista.data.fecha_entrega"
                :disabled="vista.mode == 'view'"
                style="grid-column: 4/5"
            />

            <JdSelect
                label="Contacto"
                v-model="vista.data.contacto"
                :lista="vista.socio_elegido?.contactos || []"
                :disabled="vista.mode == 'view'"
                style="grid-column: 1/2"
            />

            <JdSelect
                label="Estado"
                v-model="vista.data.estado"
                :lista="useSystem.data.pedido_estados || []"
                :disabled="true"
                style="grid-column: 4/5"
            />

            <JdSelectQuery
                label="Moneda"
                :nec="true"
                :search="loadMonedas"
                v-model="vista.data.moneda"
                :selectedObject="vista.data.moneda1"
                :disabled="vista.mode == 'view'"
            />
        </template>

        <template #pestanas-body>
            <vSocioPedidoItems v-if="vista.pestana == 1" />
            <vSocioPedidoLogistica v-if="vista.pestana == 2" />
            <vSocioPedidoFinanzas v-if="vista.pestana == 3" />
        </template>
    </VistaDetalleLayout>

    <mSocioPedidoPdf v-if="modals.show?.mSocioPedidoPdf" />
</template>

<script>
import vSocioPedidoItems from './vSocioPedidoItems.vue'
import vSocioPedidoLogistica from './vSocioPedidoLogistica.vue'
import vSocioPedidoFinanzas from './vSocioPedidoFinanzas.vue'

import mSocioPedidoPdf from '@/views/compras/pedidos/mSocioPedidoPdf.vue'

import VIEW_CONFIG from './socio_pedido.config.js'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { useSystem } from '@/pinia/system'
import { urls, get, post, patch } from '@/utils/crud'
import { getItemFromArray, redondear, incompleteData, genId } from '@/utils/mine'
import { jmsg, jqst } from '@/utils/swal'
import dayjs from 'dayjs'

export default {
    components: {
        vSocioPedidoItems,
        vSocioPedidoLogistica,
        vSocioPedidoFinanzas,

        mSocioPedidoPdf,
    },
    data: (vm) => ({
        currentRouteName: vm.$route.name,
        VIEW_CONFIG,
        useSystem: useSystem(),
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
            return [
                { id: 1, label: 'Contenido', show: true },
                { id: 2, label: 'Logística', show: true },
                { id: 3, label: 'Finanzas', show: true },
            ]
        },
        is_nuevo() {
            return this.$route.params.id === 'nuevo'
        },
    },
    async created() {
        await this.useSystem.load([
            'pedido_estados',
            'entrega_tipos',
            'pago_condiciones',
            'pago_metodos',
            'comprobante_tipos',
            'igv_afectaciones',
        ])
        await this.loadPedido()
        this.setSocio(this.vista.data.socio1)
    },
    unmounted() {
        delete this.vistas[this.currentRouteName]
    },
    methods: {
        runMethod(method, item) {
            this[method](item)
        },
        async loadPedido() {
            const param_id = this.$route.params.id

            if (param_id === 'nuevo') {
                const tipo = this.$route.path.includes('compras') ? 1 : 2

                this.vista.data = {
                    tipo,
                    origin: 'erp',
                    fecha: dayjs().format('YYYY-MM-DD'),
                    estado: 1,
                    socio_pedido_items: [],
                    entrega_tipo: 'envio',
                    entrega_direccion_datos: {},
                }
                this.vista.mode = 'edit'
                this.loadMonedas()
                return
            }

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
            const res = await get(`${this.vista.apiUrl}/uno/${param_id}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)

            if (res.code === 0) {
                this.vista.data = res.data
                document.title = `Pedido ${this.vista.data.codigo}`

                // Calcular totales iniciales
                // this.calcularTotales()
            }
        },

        // --- Header actions ---
        async guardar() {
            if (this.checkDatos()) return
            this.shapeDatos()

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
        async generarPdf() {
            const send = {
                socio_pedido: this.vista.data,
            }

            this.modals.setModal('mSocioPedidoPdf', 'Orden de compra', null, send, true)
        },
        async recalcularEntregados() {
            const resQst = await jqst('¿Está seguro de recalcular los entregados del pedido?')
            if (resQst.isConfirmed == false) return
            this.auth.setLoading(true, 'Cargando...')
            const res = await post(
                `${urls.socio_pedido_items}/recalcular-entregados`,
                { socio_pedido: this.vista.data.id },
                'Entregados recalculados',
            )
            this.auth.setLoading(false)
            if (res.code != 0) return
        },
        ingresar() {
            this.openStockMove(1)
        },
        entregar() {
            this.openStockMove(2)
        },
        async openStockMove() {
            this.$router.push({
                name: this.$route.path.includes('compras')
                    ? 'vCompraStockPicking'
                    : 'vVentaStockPicking',
                params: { id: this.vista.data.id, picking_id: 'nuevo' },
            })
        },

        //--- Methods --//
        setSocio(item) {
            this.vista.socio_elegido = { ...item }
            this.vista.data.contacto = this.vista.socio_elegido.contactos.find(
                (a) => a.principal == true,
            )?.id
            this.vista.data.pago_condicion = this.vista.socio_elegido.pago_condicion

            if (this.vista.data.tipo == 2) {
                const direccion_principal = this.vista.socio_elegido.direcciones.find(
                    (a) => a.principal == true,
                )
                if (direccion_principal) {
                    this.vista.direccion_elegida = direccion_principal.id
                    this.vista.data.entrega_ubigeo = direccion_principal.ubigeo
                    this.vista.data.direccion_entrega = direccion_principal.direccion
                    this.vista.data.entrega_direccion_datos = {
                        numero: direccion_principal.numero,
                        piso: direccion_principal.piso,
                        referencia: direccion_principal.referencia,
                    }
                }
            }
        },
        checkDatos() {
            const props = ['tipo', 'fecha', 'socio', 'moneda', 'entrega_tipo', 'pago_condicion']
            if (incompleteData(this.vista.data, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            if (this.vista.data.socio_pedido_items.length === 0) {
                jmsg('warning', 'Agregue al menos un producto')
                return true
            }

            for (const a of this.vista.data.socio_pedido_items) {
                const props1 = ['articulo', 'cantidad', 'pu']
                if (incompleteData(a, props1)) {
                    jmsg('warning', 'Ingrese los datos necesarios de los artículos')
                    return true
                }
            }
            return false
        },
        shapeDatos() {
            if (this.is_nuevo && !this.vista.data.codigo) {
                this.vista.data.codigo = genId()
            }

            this.vista.data.socio_datos = {
                doc_tipo1: this.vista.socio_elegido.doc_tipo1,
                doc_numero: this.vista.socio_elegido.doc_numero,
                nombres: this.vista.socio_elegido.nombres,
            }

            this.vista.data.contacto_datos = this.vista.socio_elegido.contactos.find(
                (a) => a.id == this.vista.data.contacto,
            )

            this.vista.data.monto = this.vista.mtoImpVenta.toFixed(2)
        },

        //--- Auxiliar data ---//
        async loadSocios(txtBuscar) {
            const qry = {
                fltr: {
                    tipo: { op: 'Es', val: this.vista.data.tipo },
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
        async loadMonedas(txtBuscar) {
            const qry = {
                fltr: {},
                cols: ['id', 'nombre', 'simbolo'],
                ordr: [
                    ['estandar', 'DESC'],
                    ['nombre', 'ASC'],
                ],
            }

            if (txtBuscar) {
                qry.fltr.nombre = { op: 'Contiene', val: txtBuscar }
            }

            const res = await get(`${urls.monedas}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            return res.data
        },
    },
}
</script>
