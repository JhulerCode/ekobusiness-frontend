<template>
    <JdModal modal="mSocioPedido" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <div class="left">
                <JdSelect
                    :label="modal.item.tipo == 1 ? 'Proveedor' : 'Cliente'"
                    :nec="true"
                    v-model="modal.item.socio"
                    :lista="modal.socios || []"
                    mostrar="nombres_apellidos"
                    @elegir="setSocio"
                    :loaded="modal.sociosLoaded"
                    @reload="loadSocios()"
                    :disabled="modal.mode == 3 || modal.socio?.id != null"
                    style="grid-column: 1/5"
                />

                <JdSelect
                    label="Contacto"
                    :nec="modal.item.tipo == 1"
                    v-model="modal.item.contacto"
                    :lista="modal.socio?.contactos || []"
                    :disabled="modal.mode == 3"
                    style="grid-column: 1/5"
                />

                <JdSelect
                    label="Moneda"
                    :nec="true"
                    v-model="modal.item.moneda"
                    :lista="modal.monedas || []"
                    :loaded="modal.monedasLoaded"
                    @reload="loadMonedas"
                    @elegir="setTipoCambio"
                    :disabled="modal.mode == 3 || modal.item.moneda != null"
                    style="grid-column: 1/4"
                />

                <JdSelect
                    label="Condición de pago"
                    :nec="true"
                    :loaded="modal.datosSistemaLoaded"
                    @reload="loadDatosSistema"
                    v-model="modal.item.pago_condicion"
                    :lista="modal.pago_condiciones || []"
                    :disabled="modal.mode == 3"
                    style="grid-column: 1/5"
                />
            </div>

            <div class="right">
                <JdInput
                    type="date"
                    label="Fecha de emisión"
                    :nec="true"
                    v-model="modal.item.fecha"
                    :disabled="modal.mode == 3"
                    style="grid-column: 1/5"
                />

                <JdInput
                    type="date"
                    label="Fecha de entrega"
                    v-model="modal.item.fecha_entrega"
                    :disabled="modal.mode == 3"
                    style="grid-column: 1/5"
                />

                <JdInput
                    label="Nro pedido"
                    v-model="modal.item.codigo"
                    :disabled="modal.mode == 3"
                    style="grid-column: 1/5"
                />

                <JdSelect
                    label="Estado"
                    v-model="modal.item.estado"
                    :lista="modal.pedido_estados || []"
                    :disabled="true"
                    style="grid-column: 1/3"
                />

                <!-- <small v-if="modal.item.moneda">TC: {{ modal.item.tipo_cambio }}</small> -->

                <!-- <JdSwitch
                    label="Pagado?"
                    v-model="modal.item.pagado"
                    :disabled="modal.mode == 3"
                    style="grid-column: 1/5"
                /> -->
            </div>
        </div>

        <mSocioPedidoItems />

        <div class="botom">
            <div class="left">
                <JdSelect
                    label="Direcciones"
                    :nec="true"
                    v-model="modal.direccion_entrega"
                    :lista="
                        (modal.item.tipo == 1
                            ? modal.empresa?.direcciones
                            : modal.socio?.direcciones) || []
                    "
                    :disabled="modal.mode == 3"
                    @elegir="setDireccionEntrega"
                    v-if="modal.mode != 3"
                />

                <JdTextArea
                    label="Dirección de entrega"
                    v-model="modal.item.direccion_entrega"
                    :disabled="modal.mode == 3"
                />

                <JdTextArea
                    label="Observaciones"
                    v-model="modal.item.observacion"
                    :disabled="modal.mode == 3"
                />

                <small>{{ modal.item.id }}</small>
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
                    {{ getItemFromArray(modal.item.moneda, modal.monedas, 'simbolo') }}
                    {{ redondear(modal.mtoImpVenta) }}
                </strong>
            </div>
        </div>
    </JdModal>
</template>

<script>
import { JdModal, JdInput, JdSelect, JdTextArea } from '@jhuler/components'

import mSocioPedidoItems from './mSocioPedidoItems.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, post, patch } from '@/utils/crud'
import { getItemFromArray, redondear, incompleteData, genId } from '@/utils/mine'
import { jqst, jmsg } from '@/utils/swal'

import dayjs from 'dayjs'

export default {
    components: {
        JdModal,
        JdInput,
        JdSelect,
        JdTextArea,

        mSocioPedidoItems,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),
        getItemFromArray,
        redondear,

        modal: {},

        buttons: [
            { text: 'Guardar avance', action: 'guardarAvance', tipo: '2' },
            { text: 'Nuevo', action: 'nuevo', show: true, tipo: '2' },
            { text: 'Grabar', action: 'grabar' },
            { text: 'Actualizar', action: 'modificar' },
        ],
    }),
    async created() {
        this.modal = this.useModals.mSocioPedido

        this.showButtons()
        if (this.modal.mode == 1) {
            this.setTotalesCero()
            this.loadSocios()
            this.loadMonedas()
        }

        await this.loadDatosSistema()
        this.setMiDireccion()
    },
    methods: {
        showButtons() {
            if (this.modal.mode == 1) {
                this.buttons[0].show = true
                this.buttons[2].show = true
            } else if (this.modal.mode == 2) {
                this.buttons[3].show = true
            }
        },

        setMiDireccion() {
            if (this.modal.mode == 1) {
                if (this.modal.item.tipo == 1) {
                    if (this.modal.item.direccion_entrega) return
                    const direccion_principal = this.modal.empresa.direcciones.find(
                        (a) => a.principal == true,
                    )
                    this.modal.direccion_entrega = direccion_principal.id
                    this.modal.item.direccion_entrega = direccion_principal.direccion
                }
            }
        },
        setDireccionEntrega(item) {
            if (item == null) return

            if (this.modal.item.tipo == 1) {
                this.modal.item.direccion_entrega = item.direccion
            } else if (this.modal.item.tipo == 2) {
                this.modal.item.direccion_entrega = item.direccion
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
            this.modal.item = {
                tipo: this.modal.item.tipo,
                fecha: dayjs().format('YYYY-MM-DD'),
                estado: 1,
                socio_pedido_items: [],
            }

            this.modal.mode = 1
            this.modal.socio = {}
            this.setTotalesCero()
            this.setMiDireccion()
        },
        async nuevo() {
            if (this.modal.mode == 3 || this.modal.item.socio_pedido_items.length == 0) {
                this.initPedido()
            } else {
                const resQst = await jqst('¿Está seguro de generar un nuevo pedido?')
                if (resQst.isConfirmed) this.initPedido()
            }

            if (this.modal.mode != 1) this.loadSocios()
        },

        setTipoCambio() {
            // this.modal.item.tipo_cambio = getItemFromArray(this.modal.item.moneda, this.modal.monedas, 'tipo_cambio')
            this.modal.item.tipo_cambio = null
        },
        setSocio(item) {
            this.modal.socio = { ...item }

            this.modal.item.contacto = this.modal.socio.contactos.find(
                (a) => a.principal == true,
            )?.id
            this.modal.item.pago_condicion = this.modal.socio.pago_condicion

            if (this.modal.item.tipo == 2) {
                const direccion_principal = this.modal.socio.direcciones.find(
                    (a) => a.principal == true,
                )
                this.modal.direccion_entrega = direccion_principal.id
                this.modal.item.direccion_entrega = direccion_principal.direccion
            }
        },

        checkDatos() {
            const props = ['tipo', 'fecha', 'socio', 'moneda', 'pago_condicion']

            if (this.modal.item.tipo == 1) {
                props.push('contacto')

                const contacto_datos = this.modal.socio.contactos.find(
                    (a) => a.id == this.modal.item.contacto,
                )

                if (contacto_datos == undefined) {
                    jmsg('warning', 'Seleccione un contacto')
                    return true
                }
            }

            if (incompleteData(this.modal.item, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            for (const a of this.modal.item.socio_pedido_items) {
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
                // console.log(a.nombre)
                if (incompleteData(a, props1)) {
                    jmsg('warning', 'Ingrese los datos necesarios de los articulos')
                    return true
                }
            }

            return false
        },
        shapeDatos() {
            if (this.modal.mode == 1) {
                if (this.modal.item.codigo == '' || this.modal.item.codigo == null) {
                    this.modal.item.codigo = genId()
                }
            }

            this.modal.item.socio_datos = {
                doc_numero: this.modal.socio.doc_numero,
                nombres: this.modal.socio.nombres,
            }

            this.modal.item.contacto_datos = this.modal.socio.contactos.find(
                (a) => a.id == this.modal.item.contacto,
            )

            this.modal.item.monto = this.modal.mtoImpVenta.toFixed(2)
            this.setTipoCambio()
        },
        async grabar() {
            if (this.checkDatos()) return
            this.shapeDatos()

            this.useAuth.setLoading(true, 'Grabando...')
            const res = await post(urls.socio_pedidos, this.modal.item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const vista = this.modal.item.tipo == 1 ? 'vCompraPedidos' : 'vVentaPedidos'
            this.useVistas.addItem(vista, 'pedidos', res.data)
            this.useModals.show.mSocioPedido = false
        },
        async modificar() {
            if (this.checkDatos()) return
            this.shapeDatos()
            this.useAuth.setLoading(true, 'Actualizando...')
            const res = await patch(urls.socio_pedidos, this.modal.item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const vista = this.modal.item.tipo == 1 ? 'vCompraPedidos' : 'vVentaPedidos'
            this.useVistas.updateItem(vista, 'pedidos', res.data)
            this.useModals.show.mSocioPedido = false
        },
        async guardarAvance() {
            const resQst = await jqst('¿Está seguro de guardar y reemplazar el guardado anterior?')
            if (resQst.isConfirmed) {
                const card = this.modal.item.tipo == 1 ? 'mCompraPedido' : 'mVentaPedido'
                this.useAuth.avances[card] = this.modal.item
                this.useModals.show.mSocioPedido = false
            }
        },

        async loadSocios() {
            const qry = {
                fltr: {
                    tipo: { op: 'Es', val: this.modal.item.tipo },
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
            if (this.modal.item.socio) {
                this.modal.socio = this.modal.socios.find((a) => a.id == this.modal.item.socio)
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
            const qry = ['empresa', 'unidades', 'pedido_estados', 'pago_condiciones']

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

.botom {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
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
