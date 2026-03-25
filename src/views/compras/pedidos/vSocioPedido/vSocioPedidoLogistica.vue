<template>
    <div class="pedido-logistica">
        <div class="container-datos">
            <JdSelect
                label="Tipo de entrega"
                :nec="true"
                :lista="useSystem.data.entrega_tipos || []"
                v-model="vista.data.entrega_tipo"
                :disabled="vista.mode == 'view'"
                @elegir="setDireccionEntrega(null)"
                style="grid-column: 1/3"
            />

            <JdInput
                label="Costo de envío"
                type="number"
                v-model="vista.data.entrega_costo"
                :disabled="vista.mode == 'view'"
                style="grid-column: 3/5"
                v-if="vista.data.entrega_tipo == 'envio'"
            />
        </div>

        <div class="container-datos">
            <JdSelect
                label="Direcciones"
                v-model="vista.direccion_elegida"
                :lista="direcciones"
                :disabled="vista.mode == 'view'"
                @elegir="setDireccionEntrega"
                v-if="vista.mode != 'view'"
                style="grid-column: 1/4"
            />

            <JdInput
                label="Distrito"
                v-model="vista.data.entrega_ubigeo"
                :disabled="vista.mode == 'view'"
                style="grid-column: 1/4"
            />

            <JdTextArea
                label="Dirección de entrega"
                v-model="vista.data.direccion_entrega"
                :disabled="vista.mode == 'view'"
                style="grid-column: 1/5"
            />

            <JdInput
                label="Número"
                v-model="vista.data.entrega_direccion_datos.numero"
                :disabled="vista.mode == 'view'"
                style="grid-column: 1/3"
            />

            <JdInput
                label="Piso / Dpto"
                v-model="vista.data.entrega_direccion_datos.piso"
                :disabled="vista.mode == 'view'"
                style="grid-column: 1/3"
            />

            <JdTextArea
                label="Referencia"
                v-model="vista.data.entrega_direccion_datos.referencia"
                :disabled="vista.mode == 'view'"
                style="grid-column: 1/4"
            />
        </div>
    </div>
</template>

<script>
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useSystem } from '@/pinia/system'

export default {
    data: () => ({
        auth: useAuth(),
        vistas: useVistas(),
        useSystem: useSystem(),
    }),
    computed: {
        vista() {
            return this.vistas[this.$route.name] || { data: {} }
        },
        direcciones() {
            if (this.vista.data.tipo == 1) {
                return this.vista.data.entrega_tipo == 'retiro'
                    ? this.vista.socio_elegido?.direcciones || []
                    : this.auth.empresa?.direcciones || []
            } else {
                return this.vista.data.entrega_tipo == 'retiro'
                    ? this.auth.empresa?.direcciones || []
                    : this.vista.socio_elegido?.direcciones || []
            }
        },
    },
    created() {
        this.setMiDireccion()
    },
    methods: {
        setMiDireccion() {
            if (this.vista.mode != 'view' && this.$route.params.id === 'nuevo') {
                if (this.vista.data.tipo == 1) {
                    if (this.vista.data.direccion_entrega) return
                    const direccion_principal = this.auth.empresa.direcciones.find(
                        (a) => a.principal == true,
                    )
                    if (direccion_principal) {
                        this.vista.direccion_elegida = direccion_principal.id
                        this.setDireccionEntrega(direccion_principal)
                    }
                }
            }
        },
        setDireccionEntrega(item) {
            if (item == null) {
                this.vista.direccion_elegida = null
                this.vista.data.entrega_ubigeo = null
                this.vista.data.direccion_entrega = null
                this.vista.data.entrega_direccion_datos = {}
                return
            }

            this.vista.data.entrega_ubigeo = item.ubigeo
            this.vista.data.direccion_entrega = item.direccion
            this.vista.data.entrega_direccion_datos = {
                numero: item.numero,
                piso: item.piso,
                referencia: item.referencia,
            }
        },
    },
}
</script>

<style lang="scss" scoped>
.pedido-logistica {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 3rem;
}
</style>
