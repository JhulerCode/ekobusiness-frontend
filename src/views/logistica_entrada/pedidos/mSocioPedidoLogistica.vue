<template>
    <div class="pedido-logistica">
        <div class="container-datos">
            <JdSelect
                label="Tipo de entrega"
                :nec="true"
                :lista="modal.entrega_tipos || []"
                v-model="modal.socio_pedido.entrega_tipo"
                :disabled="modal.mode == 3"
                style="grid-column: 1/3"
            />

            <template v-if="modal.socio_pedido.entrega_tipo == 'envio'">
                <JdSelect
                    label="Direcciones"
                    :nec="true"
                    v-model="modal.direccion_elegida"
                    :lista="direcciones"
                    :disabled="modal.mode == 3"
                    @elegir="setDireccionEntrega"
                    v-if="modal.mode != 3"
                    style="grid-column: 1/3"
                />

                <JdInput
                    label="Distrito"
                    :nec="true"
                    v-model="modal.socio_pedido.entrega_ubigeo"
                    :disabled="modal.mode == 3"
                    style="grid-column: 1/4"
                />

                <JdTextArea
                    label="Dirección de entrega"
                    :nec="true"
                    v-model="modal.socio_pedido.direccion_entrega"
                    :disabled="modal.mode == 3"
                    style="grid-column: 1/4"
                />

                <JdInput
                    label="Número"
                    v-model="modal.socio_pedido.entrega_direccion_datos.numero"
                    :disabled="modal.mode == 3"
                    style="grid-column: 1/3"
                />

                <JdInput
                    label="Piso / Dpto"
                    v-model="modal.socio_pedido.entrega_direccion_datos.piso"
                    :disabled="modal.mode == 3"
                    style="grid-column: 1/3"
                />

                <JdTextArea
                    label="Referencia"
                    v-model="modal.socio_pedido.entrega_direccion_datos.referencia"
                    :disabled="modal.mode == 3"
                    style="grid-column: 1/4"
                />
            </template>
        </div>

        <div>
            <JdInput
                label="Costo de envío"
                type="number"
                v-model="modal.socio_pedido.entrega_costo"
                :disabled="modal.mode == 3"
                style="grid-column: 1/3"
                v-if="modal.socio_pedido.entrega_tipo == 'envio'"
            />
        </div>
    </div>
</template>

<script>
import { JdSelect, JdInput, JdTextArea } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get } from '@/utils/crud'

export default {
    components: {
        JdSelect,
        JdInput,
        // JdSelectQuery,
        JdTextArea,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},
    }),
    computed: {
        direcciones() {
            if (this.modal.socio_pedido.tipo == 1) {
                return this.modal.empresa?.direcciones || []
            } else {
                return this.modal.entre_tipo == 'retiro'
                    ? this.modal.empresa?.direcciones || []
                    : this.modal.socio_elegido?.direcciones || []
            }
        },
    },
    created() {
        this.modal = this.useModals.mSocioPedido

        this.setMiDireccion()
    },
    methods: {
        setMiDireccion() {
            if (this.modal.mode == 1) {
                if (this.modal.socio_pedido.tipo == 1) {
                    if (this.modal.socio_pedido.direccion_entrega) return

                    const direccion_principal = this.modal.empresa.direcciones.find(
                        (a) => a.principal == true,
                    )

                    this.modal.direccion_elegida = direccion_principal.id
                    this.setDireccionEntrega(direccion_principal)
                }
            }
        },
        setDireccionEntrega(item) {
            if (item == null) {
                this.modal.socio_pedido.entrega_ubigeo = null
                this.modal.socio_pedido.direccion_entrega = null
                this.modal.socio_pedido.entrega_direccion_datos = {}
                return
            }

            this.modal.socio_pedido.entrega_ubigeo = item.ubigeo
            this.modal.socio_pedido.direccion_entrega = item.direccion
            this.modal.socio_pedido.entrega_direccion_datos = {
                numero: item.numero,
                piso: item.piso,
                referencia: item.referencia,
            }
        },
        async searchUbigeos(txtBuscar) {
            if (!txtBuscar) {
                this.modal.ubigeos.length = 0
                return
            }

            const qry = {
                fltr: {
                    distrito: { op: 'Contiene', val: txtBuscar },
                },
                ordr: [['distrito', 'ASC']],
                cols: ['departamento', 'provincia', 'distrito', 'nombre'],
            }

            this.modal.spinUbigeos = true
            const res = await get(`${urls.ubigeos}?qry=${JSON.stringify(qry)}`)
            this.modal.spinUbigeos = false

            if (res.code !== 0) return

            this.modal.ubigeos = JSON.parse(JSON.stringify(res.data))
        },
    },
}
</script>

<style lang="scss" scoped>
.pedido-logistica {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 3rem;

    .container-datos {
        display: grid;
        grid-template-columns: repeat(3, 11rem);
        gap: 0.5rem;
    }
}
</style>
