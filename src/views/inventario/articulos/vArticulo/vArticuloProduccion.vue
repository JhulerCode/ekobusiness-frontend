<template>
    <div class="container-datos">
        <JdInput label="Tipo de producción" v-model="lineaNombre" :disabled="true" />

        <JdInput
            label="Sobres en caja"
            type="number"
            v-model="vista.data.filtrantes"
            :disabled="vista.mode != 'edit'"
        />
    </div>
</template>

<script>
import { useVistas } from '@/pinia/vistas'

export default {
    computed: {
        vistas: () => useVistas(),
        lineaNombre() {
            return this.vista.data?.linea1?.nombre || ''
        },
    },
    data: () => ({
        vista: {},
    }),
    created() {
        this.vista = this.vistas.vArticuloDetalle
    },
}
</script>
