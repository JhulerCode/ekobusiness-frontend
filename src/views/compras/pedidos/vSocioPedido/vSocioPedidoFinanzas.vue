<template>
    <div class="pedido-finanzas">
        <div class="container-datos">
            <JdSelect
                label="Condición de pago"
                :nec="true"
                :lista="useSystem.data.pago_condiciones || []"
                v-model="vista.data.pago_condicion"
                :disabled="vista.mode == 'view'"
            />

            <JdSelect
                label="Método de pago"
                :lista="useSystem.data.pago_metodos || []"
                v-model="vista.data.pago_metodo"
                :disabled="vista.mode == 'view'"
            />

            <JdInput
                label="Id de pago"
                v-model="vista.data.pago_id"
                :disabled="vista.mode == 'view'"
            />
        </div>

        <div class="container-datos">
            <JdSelect
                label="Comprobante solicitado"
                :lista="useSystem.data.comprobante_tipos"
                v-model="vista.data.comprobante_tipo"
                :disabled="vista.mode == 'view'"
            />

            <template
                v-if="vista.data.tipo == 2 && vista.data.comprobante_tipo == '01'"
            >
                <JdInput
                    label="RUC"
                    v-model="vista.data.comprobante_ruc"
                    :disabled="vista.mode == 'view'"
                />

                <JdInput
                    label="Razón social"
                    v-model="vista.data.comprobante_razon_social"
                    :disabled="vista.mode == 'view'"
                />
            </template>
        </div>
    </div>
</template>

<script>
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useSystem } from '@/pinia/system'
import VIEW_CONFIG from './socio_pedido.config.js'

export default {
    data: () => ({
        auth: useAuth(),
        vistas: useVistas(),
        useSystem: useSystem(),
    }),
    computed: {
        vista() {
            return this.vistas[VIEW_CONFIG.name]
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
