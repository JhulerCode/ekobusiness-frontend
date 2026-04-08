<template>
    <div class="container-datos">
        <JdInput
            label="Stock mínimo"
            type="number"
            v-model="vista.data.stock_minimo"
            :disabled="vista.mode != 'edit'"
        />

        <JdSwitch
            label="Tiene fecha de vencimiento?"
            v-model="vista.data.has_fv"
            :disabled="vista.mode != 'edit'"
        />
    </div>
</template>

<script>
import { useVistas } from '@/pinia/vistas'

export default {
    computed: {
        vista() {
            return this.vistas[this.$route.name] || { data: {} }
        },
    },
    data: () => ({
        vistas: useVistas(),
    }),
}
</script>
