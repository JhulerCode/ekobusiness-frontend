<template>
    <div class="container-datos">
        <JdInput
            label="Ecommerce URL"
            v-model="vista.data.ecommerce_url"
            :disabled="vista.mode != 'edit'"
            style="grid-column: 1/3"
        />
        <JdInput
            label="Facebook URL"
            v-model="vista.data.facebook_url"
            :disabled="vista.mode != 'edit'"
            style="grid-column: 3/5"
        />
        <JdInput
            label="Instagram URL"
            v-model="vista.data.instagram_url"
            :disabled="vista.mode != 'edit'"
            style="grid-column: 1/3"
        />
        <JdInput
            label="WhatsApp Ventas"
            v-model="vista.data.whatsapp_ventas"
            :disabled="vista.mode != 'edit'"
            style="grid-column: 3/5"
        />
        <JdInput
            label="WhatsApp Ventas URL"
            v-model="vista.data.whatsapp_ventas_url"
            :disabled="vista.mode != 'edit'"
            style="grid-column: 1/3"
        />
    </div>
</template>

<script>
import { useVistas } from '@/pinia/vistas'

export default {
    name: 'vEmpresaSocial',
    computed: {
        vistas: () => useVistas(),
        vista() {
            return this.vistas.vEmpresa
        },
    },
}
</script>
