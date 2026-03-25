<template>
    <div class="container-datos">
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
