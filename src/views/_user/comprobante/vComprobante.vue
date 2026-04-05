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
                label="Proveedor"
                :nec="true"
                :search="loadSocios"
                mostrar="nombres"
                v-model="vista.data.socio"
                :selectedObject="vista.data.socio1"
                :disabled="vista.mode == 'view'"
                style="grid-column: 1/3"
            />

            <JdInput
                type="date"
                label="Fecha Emisión"
                :nec="true"
                v-model="vista.data.fecha_emision"
                :disabled="vista.mode == 'view'"
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

            <div style="grid-column: 4/5" class="serie-correlativo">
                <JdInput
                    v-model="vista.data.serie"
                    placeholder="Serie"
                    :disabled="vista.mode == 'view'"
                />
                -
                <JdInput
                    v-model="vista.data.correlativo"
                    placeholder="Correlativo"
                    :disabled="vista.mode == 'view'"
                />
            </div>
        </template>

        <template #pestanas-body>
            <vComprobanteItems v-if="vista.pestana == 1" />
        </template>
    </VistaDetalleLayout>
</template>

<script>
import vComprobanteItems from './vComprobanteItems.vue'

import VIEW_CONFIG from '../comprobante/comprobante.config.js'
import { useSystem } from '@/pinia/system'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { urls, get } from '@/utils/crud'

export default {
    components: { vComprobanteItems },
    data: () => ({
        VIEW_CONFIG,
        system: useSystem(),
        auth: useAuth(),
        vistas: useVistas(),
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
    async created() {
        await this.system.load([
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
            this.vista.data = {
                fecha_emision: new Date().toISOString().split('T')[0],
                comprobante_items: [],
            }

            if (this.$route.params.traslado_id) await this.loadTraslado()
        },
        async loadExistingData() {
            const param_id = this.$route.params[this.vista.pathKey]

            const qry = {
                incl: ['socio1', 'moneda1', 'createdBy1'],
            }

            this.auth.setLoading(true, 'Cargando pedido...')
            const res = await get(`${this.vista.apiUrl}/uno/${param_id}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)

            if (res.code === 0 && res.data) {
                this.vista.data = res.data
                document.title = `Comprobante ${this.vista.data[this.vista.title_key || this.vista.titleKey]}`
                // this.setSocio(this.vista.data.socio1)

                if (this.$route.params.traslado_id) await this.loadTraslado()
            }
        },
        async loadTraslado(data = null) {
            const traslado_id = this.$route.params.traslado_id
            const vTraslado = this.$route.path.includes('compras')
                ? 'vCompraTraslado'
                : 'vVentaTraslado'

            this.vista.traslado = {}

            if (data) {
                this.vista.traslado = data
            } else {
                const qry = {
                    incl: ['socio1', 'moneda1', 'transaccion_items'],
                    iccl: {
                        transaccion_items: { incl: ['articulo1'] },
                    },
                }
                this.auth.setLoading(true, 'Cargando traslado...')
                const res = await get(
                    `${urls.transacciones}/uno/${traslado_id}?qry=${JSON.stringify(qry)}`,
                )
                this.auth.setLoading(false)
                if (res.code === 0) this.vista.traslado = res.data
            }

            if (this.vista.traslado?.id) {
                this.vistas.initVista(vTraslado, 'detail')
                this.vistas.updateVista(vTraslado, {
                    titleKey: 'guia',
                    pathKey: 'traslado_id',
                    data: this.vista.traslado,
                    loaded: true,
                })

                if (this.is_nuevo) {
                    this.vista.data.socio = this.vista.traslado.socio
                    this.vista.data.socio1 = this.vista.traslado.socio1
                    this.vista.data.moneda = this.vista.traslado.moneda
                    this.vista.data.moneda1 = this.vista.traslado.moneda1
                    this.vista.data.traslado_id = this.vista.traslado.id

                    const igv_porcentaje = this.auth.empresa.igv_porcentaje

                    this.vista.data.comprobante_items = this.vista.traslado.transaccion_items.map(
                        (ti) => {
                            const item = {
                                id: crypto.randomUUID(),
                                articulo: ti.articulo,
                                articulo1: {
                                    id: ti.articulo1?.id,
                                    nombre: ti.articulo1?.nombre,
                                },
                                unidad: ti.articulo1?.unidad,
                                cantidad: Number(ti.cantidad),
                                pu: Number(ti.pu || 0),
                                igv_afectacion: ti.articulo1?.igv_afectacion,
                                igv_porcentaje:
                                    ti.articulo1?.igv_afectacion == '10' ? igv_porcentaje : 0,
                                transaccion_item: ti.id,
                            }

                            item.mtoValorVenta = item.cantidad * item.pu
                            item.igv =
                                item.igv_afectacion == '10'
                                    ? item.mtoValorVenta * (item.igv_porcentaje / 100)
                                    : 0
                            item.total = item.mtoValorVenta + item.igv

                            return item
                        },
                    )
                }
            }
        },
        //--- Auxiliar data ---//
        async loadSocios(txtBuscar) {
            const qry = {
                fltr: {
                    tipo: { op: 'Es', val: 1 },
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
    },
}
</script>

<style lang="scss" scoped>
.serie-correlativo {
    display: flex;
    gap: 1rem;
}
</style>
