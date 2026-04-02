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
            <vComprobanteItems v-if="vista.pestana == 5" />
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
                document.title = `Comprobante ${this.vista.data[this.vista.titleKey]}`
                // this.setSocio(this.vista.data.socio1)
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
