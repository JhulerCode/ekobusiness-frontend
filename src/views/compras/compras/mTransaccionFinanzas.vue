<template>
    <div class="pedido-finanzas">
        <div class="container-datos">
            <JdSelect
                label="Condición de pago"
                :nec="true"
                :lista="useSystem.data.pago_condiciones || []"
                v-model="modal.transaccion.pago_condicion"
                :disabled="modal.mode == 3"
            />
        </div>

        <div class="container-datos">
            <JdInput
                label="Factura"
                v-model="modal.transaccion.factura"
                style="grid-column: 1/4"
                :disabled="modal.mode == 3"
            />
        </div>
    </div>
</template>

<script>
import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'
import { useSystem } from '@/pinia/system'

export default {
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),
        useSystem: useSystem(),

        modal: {},
    }),
    created() {
        this.modal = this.useModals.mTransaccion
    },
    methods: {},
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
