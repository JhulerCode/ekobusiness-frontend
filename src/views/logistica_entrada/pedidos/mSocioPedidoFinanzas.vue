<template>
    <div class="pedido-finanzas">
        <div class="container-datos">
            <JdSelect
                label="Condición de pago"
                :nec="true"
                :lista="modal.pago_condiciones || []"
                v-model="modal.socio_pedido.pago_condicion"
                :disabled="modal.mode == 3"
            />

            <JdSelect
                label="Método de pago"
                :lista="modal.pago_metodos || []"
                v-model="modal.socio_pedido.pago_metodo"
                :disabled="modal.mode == 3"
            />

            <JdInput
                label="Id de pago"
                v-model="modal.socio_pedido.pago_id"
                :disabled="modal.mode == 3"
            />
        </div>

        <div class="container-datos">
            <JdSelect
                label="Comprobante solicitado"
                :lista="modal.comprobante_tipos"
                v-model="modal.socio_pedido.comprobante_tipo"
                :disabled="modal.mode == 3"
            />

            <template v-if="modal.socio_pedido.tipo == 2 && modal.socio_pedido.comprobante_tipo == '01'">
                <JdInput
                    label="RUC"
                    v-model="modal.socio_pedido.comprobante_ruc"
                    :disabled="modal.mode == 3"
                />

                <JdInput
                    label="Razón social"
                    type="number"
                    v-model="modal.socio_pedido.comprobante_razon_social"
                    :disabled="modal.mode == 3"
                />
            </template>
        </div>
    </div>
</template>

<script>
import { JdSelect, JdInput } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get } from '@/utils/crud'
// import { jmsg } from '@/utils/swal'
// import { tryOficialExcel, getItemFromArray } from '@/utils/mine'

export default {
    components: {
        JdSelect,
        JdInput,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},
    }),
    created() {
        this.modal = this.useModals.mSocioPedido
    },
    methods: {
        setDireccionEntrega(item) {
            if (item == null) {
                this.modal.socio_pedido.entrega_ubigeo = null
                this.modal.socio_pedido.direccion_entrega = null
                this.modal.socio_pedido.entrega_direccion_datos = {}
                return
            }

            this.modal.socio_pedido.entrega_ubigeo = item.ubigeo
            this.modal.socio_pedido.direccion_entrega = item.direccion
            this.modal.socio_pedido.entrega_direccion_datos = { ...item.datos_adicionales }
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
.pedido-finanzas {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 3rem;

    .container-datos {
        display: grid;
        gap: 0.5rem 2rem;
    }
}
</style>
