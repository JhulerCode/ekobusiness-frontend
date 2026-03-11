<template>
    <div class="pedido-finanzas">
        <div class="container-datos">
            <JdSelect
                label="Condición de pago"
                :nec="true"
                :lista="modal.pago_condiciones || []"
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
import { JdSelect, JdInput } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

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
