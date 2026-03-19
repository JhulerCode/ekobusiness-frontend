<template>
    <div class="container-datos">
        <JdInput label="Teléfono" v-model="vista.data.telefono" :disabled="vista.mode != 'edit'" />
        <JdInput label="Correo" v-model="vista.data.correo" :disabled="vista.mode != 'edit'" />
        <JdInput
            label="IGV %"
            type="number"
            v-model="vista.data.igv_porcentaje"
            :disabled="vista.mode != 'edit'"
        />
        <JdInput
            label="Número Yape"
            v-model="vista.data.yape_number"
            :disabled="vista.mode != 'edit'"
        />
        <JdInput label="Subdominio" v-model="vista.data.subdominio" :disabled="true" />
    </div>
</template>

<script>
import { useVistas } from '@/pinia/vistas'

export default {
    name: 'vEmpresaDetalleGeneral',
    computed: {
        vistas: () => useVistas(),
        vista() {
            return this.vistas.vEmpresa
        },
    },
}
</script>
