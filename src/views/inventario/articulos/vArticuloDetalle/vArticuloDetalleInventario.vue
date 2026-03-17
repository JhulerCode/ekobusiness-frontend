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
import { JdSwitch } from '@jhuler/components'
import { useVistas } from '@/pinia/vistas'

export default {
    components: {
        JdSwitch,
    },
    computed: {
        vistas: () => useVistas(),
    },
    data: () => ({
        vista: {},
    }),
    created() {
        this.vista = this.vistas.vArticuloDetalle
    },
}
</script>
