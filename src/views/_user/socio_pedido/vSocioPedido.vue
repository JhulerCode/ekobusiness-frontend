<template>
    <VistaDetalleLayout
        :config="VIEW_CONFIG"
        :pestanas="availableTabs"
        :loadNewData="loadNewData"
        :loadAvanceData="loadAvanceData"
        :loadExistingData="loadExistingData"
        @runMethod="runMethod"
    >
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

            <JdCheckBox
                label="Maquila"
                v-model="vista.data.is_maquila"
                :disabled="vista.mode == 'view'"
            />
        </template>

        <template #pestanas-body>
            <vSocioPedidoItems v-if="vista.pestana == 1" ref="vSocioPedidoItems" />
            <vSocioPedidoLogistica v-if="vista.pestana == 2" />
            <vSocioPedidoFinanzas v-if="vista.pestana == 3" />
        </template>
    </VistaDetalleLayout>

    <mSocioPedidoPdf v-if="modals?.show?.mSocioPedidoPdf" />
</template>

<script>
import vSocioPedidoItems from './vSocioPedidoItems.vue'
import vSocioPedidoLogistica from './vSocioPedidoLogistica.vue'
import vSocioPedidoFinanzas from './vSocioPedidoFinanzas.vue'

import mSocioPedidoPdf from './mSocioPedidoPdf.vue'

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
    data: () => ({
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
            return this.vistas[this.$route.name]
        },
        availableTabs() {
            return [
                { id: 1, label: 'Contenido', show: true },
                { id: 2, label: 'Logística', show: true },
                { id: 3, label: 'Finanzas', show: true },
            ]
        },
        is_nuevo() {
            return this.$route.params[this.vista.pathKey] === 'nuevo'
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
    },
    methods: {
        runMethod(method, item) {
            this[method](item)
        },
        async loadNewData() {
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
        },
        async loadAvanceData() {
            const objectName = this.$route.path.includes('compras')
                ? 'mCompraPedido'
                : 'mVentaPedido'

            const dataGuardada = this.auth.usuario.avances[objectName]

            if (!dataGuardada) return this.auth.goBack(this.$router)

            this.$router.replace({
                name: this.$route.name,
                params: {
                    [this.vista.pathKey]: 'nuevo',
                },
            })

            //--- Cargamos socio ---//
            if (dataGuardada.socio) {
                this.auth.setLoading(true, 'Cargando socio...')
                const qrySocio = {
                    fltr: {
                        id: { op: 'Es', val: dataGuardada.socio },
                    },
                    cols: ['nombres', 'contactos', 'direcciones', 'pago_condicion'],
                }
                const resSocio = await get(`${urls.socios}?qry=${JSON.stringify(qrySocio)}`)
                this.auth.setLoading(false)

                if (resSocio.code === 0 && resSocio.data.length > 0) {
                    dataGuardada.socio1 = resSocio.data[0]
                }
            }

            //--- Cargamos moneda ---//
            if (dataGuardada.moneda) {
                this.auth.setLoading(true, 'Cargando moneda...')
                const qryMoneda = {
                    fltr: {
                        id: { op: 'Es', val: dataGuardada.moneda },
                    },
                    cols: ['id', 'nombre', 'simbolo'],
                }
                const resMoneda = await get(`${urls.monedas}?qry=${JSON.stringify(qryMoneda)}`)
                this.auth.setLoading(false)

                if (resMoneda.code === 0 && resMoneda.data.length > 0) {
                    dataGuardada.moneda1 = resMoneda.data[0]
                }
            }

            this.vista.data = dataGuardada
            // console.log(this.vista.data)
            this.setSocio(this.vista.data.socio1)
        },
        async loadExistingData() {
            const param_id = this.$route.params[this.vista.pathKey]

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
            const res = await get(`${this.vista.apiUrl}/uno/${param_id}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)

            if (res.code === 0 && res.data) {
                this.vista.data = res.data
                document.title = `Pedido ${this.vista.data[this.vista.titleKey]}`
                this.setSocio(this.vista.data.socio1)

                this.$nextTick(() => {
                    this.$refs.vSocioPedidoItems.sumarItems()
                })
            }
        },

        //--- Header left actions ---//
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
                this.vista.data.id = res.data.id

                this.$router.replace({
                    name: this.$route.name,
                    params: { [this.vista.pathKey]: res.data.id },
                })
            }

            this.vista.mode = 'view'
        },
        guardarAvance() {
            const objectName = this.$route.path.includes('compras')
                ? 'mCompraPedido'
                : 'mVentaPedido'

            this.auth.saveAvances(objectName, this.vista.data)

            this.auth.goBack(this.$router)
        },

        //--- header actions ---//
        async generarPdf() {
            const send = {
                socio_pedido: this.vista.data,
            }

            this.modals.setModal('mSocioPedidoPdf', 'Orden de compra', null, send, true)
        },
        ingresar() {
            this.openStockMove(1)
        },
        entregar() {
            this.openStockMove(2)
        },
        async facturar() {
            // const cantidad_traslados = await this.loadTrasladosPreviosCantidad(1)
            // if (cantidad_traslados == 0) {
            //     jmsg('warning', 'No se puede registrar facturas sin traslados previos')
            //     return
            // }

            // const cantidad_comprobantes = await this.loadComprobantesPreviosCantidad()

            // if (cantidad_comprobantes == 0) {
            //     this.$router.push({
            //         name: 'vCompraPedidoComprobante',
            //         params: { comprobante_id: 'nuevo' },
            //     })
            // } else {
            this.$router.push({ name: 'vCompraPedidoComprobantes' })
            // }
        },
        abrir() {
            this.abrirCerrar('1')
        },
        cerrar() {
            this.abrirCerrar('2')
        },

        //--- Methods --//
        setSocio(item) {
            this.vista.socio_elegido = { ...item }

            if (this.is_nuevo) {
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
        async openStockMove(tipo) {
            if (this.$route.path.includes('compras')) {
                if (tipo == 2) {
                    // const cantidad_traslados =
                    //     await this.loadTrasladosPreviosCantidad('abastacer_maquila')
                    // if (cantidad_traslados == 0) {
                    //     this.$router.push({
                    //         name: 'vCompraPedidoEntrega',
                    //         params: { traslado_id: 'nuevo' },
                    //     })
                    // } else {
                    this.$router.push({ name: 'vCompraPedidoEntregas' })
                    // }
                } else {
                    // const cantidad_traslados = await this.loadTrasladosPreviosCantidad('1')
                    // if (cantidad_traslados == 0) {
                    //     this.$router.push({
                    //         name: 'vCompraPedidoRecepcion',
                    //         params: { traslado_id: 'nuevo' },
                    //     })
                    // } else {
                    this.$router.push({ name: 'vCompraPedidoRecepciones' })
                    // }
                }
            } else {
                // const cantidad_traslados = await this.loadTrasladosPreviosCantidad('5')
                // if (cantidad_traslados == 0) {
                //     this.$router.push({
                //         name: 'vVentaPedidoEntrega',
                //         params: { traslado_id: 'nuevo' },
                //     })
                // } else {
                this.$router.push({ name: 'vVentaPedidoEntregas' })
                // }
            }
        },
        async abrirCerrar(estado) {
            const resQst = await jqst(
                `¿Está seguro de ${estado == 1 ? 'abrir' : 'cerrar'} el pedido?`,
            )
            if (resQst.isConfirmed == false) return

            if (this.vista.data.tipo == 1 && estado == 2) {
                const qry_ti = {
                    incl: ['transaccion1'],
                    cols: ['articulo', 'cantidad'],
                    fltr: { 'transaccion1.socio_pedido': { op: 'Es', val: this.vista.data.id } },
                }

                this.auth.setLoading(true, 'Cargando...')
                const res_ti = await get(`${urls.transaccion_items}?qry=${JSON.stringify(qry_ti)}`)
                this.auth.setLoading(false)

                if (res_ti.code != 0) return

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
                        }
                    }

                    itemsMap[articulo].comprobante += cantidad
                }

                // 2. acumular transacciones
                for (const a of res_ti.data) {
                    if (!itemsMap[a.articulo]) {
                        itemsMap[a.articulo] = {
                            comprobante: 0,
                            transaccion: 0,
                        }
                    }

                    itemsMap[a.articulo].transaccion += a.cantidad
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
                `Pedido ${estado == 1 ? 'abierto' : 'cerrado'} correctamente`,
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
                    tipo: { op: 'Es', val: this.vista.data.tipo },
                    activo: { op: 'Es', val: true },
                },
                cols: ['nombres', 'contactos', 'direcciones', 'pago_condicion'],
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
        async loadTrasladosPreviosCantidad(tipo) {
            const qry = {
                fltr: {
                    socio_pedido: { op: 'Es', val: this.vista.data.id },
                    tipo: { op: 'Es', val: tipo },
                },
            }

            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.transacciones}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)

            if (res.code != 0) return

            return res.data.length
        },
        async loadComprobantesPreviosCantidad() {
            const qry = {
                fltr: {
                    pedido_id: { op: 'Es', val: this.vista.data.id },
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
