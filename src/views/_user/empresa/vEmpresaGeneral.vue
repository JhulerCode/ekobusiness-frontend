<template>
    <div class="container-datos">
        <JdInput label="Teléfono" v-model="vista.data.telefono" :disabled="vista.mode != 'edit'" />
        <JdInput label="Correo" v-model="vista.data.correo" :disabled="vista.mode != 'edit'" />
        <JdInput
            label="IGV %"
            :nec="true"
            type="number"
            v-model="vista.data.igv_porcentaje"
            :disabled="vista.mode != 'edit'"
        />
        <JdInput
            label="Número Yape"
            v-model="vista.data.yape_number"
            :disabled="vista.mode != 'edit'"
        />
        <JdInput
            label="Subdominio"
            :nec="true"
            v-model="vista.data.subdominio"
            :disabled="!is_nuevo"
        />
    </div>
</template>

<script>
import { useVistas } from '@/pinia/vistas'

export default {
    name: 'vEmpresaGeneral',
    computed: {
        vistas: () => useVistas(),
        vista() {
            return this.vistas.vEmpresa
        },
        is_nuevo() {
            return this.$route.params[this.vista.pathKey] === 'nuevo'
        },
    },
}
</script>
