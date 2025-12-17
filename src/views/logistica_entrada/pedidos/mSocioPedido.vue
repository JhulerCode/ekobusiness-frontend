<template>
    <JdModal modal="mSocioPedido" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <div class="left">
                <JdSelect
                    :label="modal.socio_pedido.tipo == 1 ? 'Proveedor' : 'Cliente'"
                    :nec="true"
                    v-model="modal.socio_pedido.socio"
                    :lista="modal.socios || []"
                    mostrar="nombres_apellidos"
                    @elegir="setSocio"
                    :loaded="modal.sociosLoaded"
                    @reload="loadSocios"
                    :disabled="modal.mode == 3 || modal.socio_elegido?.id != null"
                    style="grid-column: 1/5"
                />

                <JdSelect
                    label="Contacto"
                    v-model="modal.socio_pedido.contacto"
                    :lista="modal.socio_elegido?.contactos || []"
                    :disabled="modal.mode == 3"
                    style="grid-column: 1/5"
                />

                <JdSelect
                    label="Moneda"
                    :nec="true"
                    :lista="modal.monedas || []"
                    :loaded="modal.monedasLoaded"
                    @reload="loadMonedas"
                    v-model="modal.socio_pedido.moneda"
                    :disabled="modal.mode == 3 || modal.socio_pedido.moneda != null"
                    style="grid-column: 1/4"
                />
                <!-- @elegir="setTipoCambio" -->
            </div>

            <div class="right">
                <JdInput
                    type="date"
                    label="Fecha de emisión"
                    :nec="true"
                    v-model="modal.socio_pedido.fecha"
                    :disabled="modal.mode == 3"
                    style="grid-column: 1/5"
                />

                <JdInput
                    type="date"
                    label="Fecha de entrega"
                    v-model="modal.socio_pedido.fecha_entrega"
                    :disabled="modal.mode == 3"
                    style="grid-column: 1/5"
                />

                <JdInput
                    label="Nro pedido"
                    v-model="modal.socio_pedido.codigo"
                    :disabled="modal.mode == 3"
                    style="grid-column: 1/5"
                />

                <JdSelect
                    label="Estado"
                    v-model="modal.socio_pedido.estado"
                    :lista="modal.pedido_estados || []"
                    :disabled="true"
                    style="grid-column: 1/3"
                />
            </div>
        </div>

        <div class="extra-datos">
            <ul class="pestanas">
                <li @click="pestana = 1" :class="{ 'pestana-activo': pestana == 1 }">Contenido</li>
                <li @click="pestana = 2" :class="{ 'pestana-activo': pestana == 2 }">Logística</li>
                <li @click="pestana = 3" :class="{ 'pestana-activo': pestana == 3 }">Finanzas</li>
            </ul>

            <div class="pestana-body">
                <mSocioPedidoItems v-if="pestana == 1" />
                <mSocioPedidoLogistica v-if="pestana == 2" />
                <mSocioPedidoFinanzas v-if="pestana == 3" />
            </div>
        </div>

        <div class="botom">
            <div class="left">
                <JdTextArea
                    label="Observaciones"
                    v-model="modal.socio_pedido.observacion"
                    :disabled="modal.mode == 3"
                />

                <small>{{ modal.socio_pedido.id }}</small>
            </div>

            <div class="totales">
                <span>Ope. gravadas:</span>
                <p>{{ redondear(modal.mtoOperGravadas) }}</p>

                <span>Ope. exoneradas:</span>
                <p>{{ redondear(modal.mtoOperExoneradas) }}</p>

                <span>Ope. inafectas:</span>
                <p>{{ redondear(modal.mtoOperInafectas) }}</p>

                <span>Subtotal:</span>
                <p>{{ redondear(modal.valorVenta) }}</p>

                <span>Impuesto:</span>
                <p>{{ redondear(modal.mtoIGV) }}</p>

                <strong>Importe total:</strong>
                <strong class="total">
                    {{ getItemFromArray(modal.socio_pedido.moneda, modal.monedas, 'simbolo') }}
                    {{ redondear(modal.mtoImpVenta) }}
                </strong>
            </div>
        </div>
    </JdModal>
</template>

<script>
import { JdModal, JdInput, JdSelect, JdTextArea } from '@jhuler/components'

import mSocioPedidoItems from './mSocioPedidoItems.vue'
import mSocioPedidoLogistica from './mSocioPedidoLogistica.vue'
import mSocioPedidoFinanzas from './mSocioPedidoFinanzas.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, post, patch } from '@/utils/crud'
import { getItemFromArray, redondear, incompleteData } from '@/utils/mine'
import { jqst, jmsg } from '@/utils/swal'

import dayjs from 'dayjs'

export default {
    components: {
        JdModal,
        JdInput,
        JdSelect,
        JdTextArea,

        mSocioPedidoItems,
        mSocioPedidoLogistica,
        mSocioPedidoFinanzas,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),
        getItemFromArray,
        redondear,

        modal: {},
        pestana: 1,

        buttons: [
            { text: 'Guardar avance', action: 'guardarAvance', tipo: '2' },
            { text: 'Nuevo', action: 'nuevo', tipo: '2' },
            { text: 'Grabar', action: 'grabar' },
            { text: 'Actualizar', action: 'modificar' },
        ],
    }),
    async created() {
        this.modal = this.useModals.mSocioPedido

        this.showButtons()

        this.loadEmpresa()
        this.loadDatosSistema()

        if (this.modal.mode == 1) {
            this.setTotalesCero()
            this.loadSocios()
            this.loadMonedas()
        }
    },
    methods: {
        showButtons() {
            if (this.modal.mode == 1) {
                this.buttons[0].show = true
                this.buttons[2].show = true
            } else if (this.modal.mode == 2) {
                this.buttons[3].show = true
            }

            if (this.useAuth.verifyPermiso('vCompraPedidos:crear', 'vVentaPedidos:crear')) {
                this.buttons[1].show = true
            }
        },

        setTotalesCero() {
            this.modal.mtoOperGravadas = 0
            this.modal.mtoOperExoneradas = 0
            this.modal.mtoOperInafectas = 0
            this.modal.valorVenta = 0
            this.modal.mtoIGV = 0
            this.modal.mtoImpVenta = 0
        },
        initPedido() {
            this.modal.socio_pedido = {
                tipo: this.modal.socio_pedido.tipo,
                fecha: dayjs().format('YYYY-MM-DD'),
                estado: 1,
                socio_pedido_items: [],
                entrega_tipo: 'envio',
                entrega_direccion_datos: {},
            }

            this.modal.mode = 1
            this.modal.socio_elegido = {}
            this.setTotalesCero()
        },
        async nuevo() {
            if (this.modal.mode == 3 || this.modal.socio_pedido.socio_pedido_items.length == 0) {
                this.initPedido()
            } else {
                const resQst = await jqst('¿Está seguro de generar un nuevo pedido?')
                if (resQst.isConfirmed) this.initPedido()
            }

            if (this.modal.mode != 1) this.loadSocios()
        },

        // setTipoCambio() {
        //     // this.modal.socio_pedido.tipo_cambio = getItemFromArray(this.modal.socio_pedido.moneda, this.modal.monedas, 'tipo_cambio')
        //     this.modal.socio_pedido.tipo_cambio = null
        // },
        setSocio(item) {
            this.modal.socio_elegido = { ...item }

            //--- Contacto principal ---//
            this.modal.socio_pedido.contacto = this.modal.socio_elegido.contactos.find(
                (a) => a.principal == true,
            )?.id
            this.modal.socio_pedido.pago_condicion = this.modal.socio_elegido.pago_condicion

            //--- Dirección principal ---//
            if (this.modal.socio_pedido.tipo == 2) {
                const direccion_principal = this.modal.socio_elegido.direcciones.find(
                    (a) => a.principal == true,
                )

                this.modal.direccion_elegida = direccion_principal.id
                this.modal.socio_pedido.entrega_ubigeo = direccion_principal.ubigeo
                this.modal.socio_pedido.direccion_entrega = direccion_principal.direccion
                this.modal.socio_pedido.entrega_direccion_datos = {
                    numero: direccion_principal.numero,
                    piso: direccion_principal.piso,
                    referencia: direccion_principal.referencia,
                }
            }
        },

        checkDatos() {
            const props = ['tipo', 'fecha', 'socio', 'moneda', 'entrega_tipo', 'pago_condicion']

            if (incompleteData(this.modal.socio_pedido, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            for (const a of this.modal.socio_pedido.socio_pedido_items) {
                const props1 = [
                    'articulo',
                    'nombre',
                    'unidad',
                    'has_fv',
                    'cantidad',
                    'pu',
                    'igv_afectacion',
                    'igv_porcentaje',
                ]

                if (incompleteData(a, props1)) {
                    jmsg('warning', 'Ingrese los datos necesarios de los articulos')
                    return true
                }
            }

            return false
        },
        shapeDatos() {
            if (this.modal.mode == 1) {
                if (
                    this.modal.socio_pedido.codigo == '' ||
                    this.modal.socio_pedido.codigo == null
                ) {
                    this.modal.socio_pedido.codigo = crypto.randomUUID()
                }
            }

            this.modal.socio_pedido.socio_datos = {
                doc_numero: this.modal.socio_elegido.doc_numero,
                nombres: this.modal.socio_elegido.nombres,
            }

            this.modal.socio_pedido.contacto_datos = this.modal.socio_elegido.contactos.find(
                (a) => a.id == this.modal.socio_pedido.contacto,
            )

            this.modal.socio_pedido.monto = this.modal.mtoImpVenta.toFixed(2)
            // this.setTipoCambio()
        },
        async grabar() {
            if (this.checkDatos()) return
            this.shapeDatos()

            this.useAuth.setLoading(true, 'Grabando...')
            const res = await post(urls.socio_pedidos, this.modal.socio_pedido)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const vista = this.modal.socio_pedido.tipo == 1 ? 'vCompraPedidos' : 'vVentaPedidos'
            this.useVistas.addItem(vista, 'pedidos', res.data, 'first')
            this.useModals.show.mSocioPedido = false
        },
        async modificar() {
            if (this.checkDatos()) return
            this.shapeDatos()

            this.useAuth.setLoading(true, 'Actualizando...')
            const res = await patch(urls.socio_pedidos, this.modal.socio_pedido)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const vista = this.modal.socio_pedido.tipo == 1 ? 'vCompraPedidos' : 'vVentaPedidos'
            this.useVistas.updateItem(vista, 'pedidos', res.data)
            this.useModals.show.mSocioPedido = false
        },
        async guardarAvance() {
            const resQst = await jqst('¿Está seguro de guardar y reemplazar el guardado anterior?')
            if (resQst.isConfirmed) {
                const card = this.modal.socio_pedido.tipo == 1 ? 'mCompraPedido' : 'mVentaPedido'
                this.useAuth.avances[card] = this.modal.socio_pedido
                this.useModals.show.mSocioPedido = false
            }
        },

        async loadEmpresa() {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.empresas}/uno/${this.useAuth.usuario.empresa}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.empresa = res.data
        },
        async loadSocios() {
            const qry = {
                fltr: {
                    tipo: { op: 'Es', val: this.modal.socio_pedido.tipo },
                    activo: { op: 'Es', val: true },
                },
                cols: [
                    'nombres',
                    'apellidos',
                    'nombres_apellidos',
                    'contactos',
                    'direcciones',
                    'precio_lista',
                    'pago_condicion',
                ],
                incl: ['precio_lista1'],
                ordr: [
                    ['nombres', 'ASC'],
                    ['apellidos', 'ASC'],
                ],
            }

            this.modal.socios = []
            this.modal.sociosLoaded = false
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.socios}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)
            this.modal.sociosLoaded = true

            if (res.code !== 0) return

            this.modal.socios = res.data

            //--- Cuando se recupera del guardado ---//
            if (this.modal.socio_pedido.socio) {
                this.modal.socio_elegido = this.modal.socios.find(
                    (a) => a.id == this.modal.socio_pedido.socio,
                )
            }
        },
        async loadMonedas() {
            const qry = {
                fltr: {},
                cols: ['id', 'nombre', 'simbolo'],
                ordr: [
                    ['estandar', 'DESC'],
                    ['nombre', 'ASC'],
                ],
            }

            this.modal.monedas = []
            this.useAuth.setLoading(true, 'Cargando...')
            this.modal.monedasLoaded = false
            const res = await get(`${urls.monedas}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)
            this.modal.monedasLoaded = true

            if (res.code != 0) return

            this.modal.monedas = res.data
        },
        async loadDatosSistema() {
            const qry = [
                'pedido_estados',
                'entrega_tipos',
                'pago_condiciones',
                'pago_metodos',
                'comprobante_tipos',
            ]

            this.useAuth.setLoading(true, 'Cargando...')
            this.modal.datosSistemaLoaded = false
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)
            this.modal.datosSistemaLoaded = true

            if (res.code != 0) return

            Object.assign(this.modal, res.data)
        },
    },
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2rem;
    gap: 2rem;

    .left {
        display: grid;
        grid-template-columns: repeat(4, 7rem);
        gap: 0.5rem;
        height: fit-content;
    }

    .right {
        display: grid;
        grid-template-columns: repeat(4, 5rem);
        gap: 0.5rem;
        height: fit-content;
    }
}

.extra-datos {
    border: var(--border);

    .pestanas {
        display: flex;
        background-color: var(--bg-color2);

        li {
            padding: 0.3rem 0.5rem;
            font-size: 0.8rem;
            cursor: pointer;
        }

        .pestana-activo {
            background-color: var(--bg-color);
        }
    }

    .pestana-body {
        padding: 1rem;
        height: 20rem;
        width: 60rem;
        overflow-y: auto;
    }
}

.botom {
    display: flex;
    justify-content: space-between;
    margin-top: 2rem;
    gap: 2rem;

    .left {
        display: grid;
        grid-template-columns: 30rem;
        gap: 0.5rem;
        height: fit-content;
    }

    .totales {
        background-color: var(--bg-color2);
        padding: 1rem;
        border-radius: 0.5rem;
        display: grid;
        grid-template-columns: 10rem 10rem;
        gap: 0.5rem;
        align-items: center;
        height: fit-content;

        p {
            text-align: right;
        }

        .total {
            font-size: 1.4rem;
            text-align: right;
        }
    }
}
</style>
