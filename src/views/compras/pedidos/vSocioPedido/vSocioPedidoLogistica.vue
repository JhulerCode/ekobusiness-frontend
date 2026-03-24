<template>
    <div class="pedido-logistica">
        <div class="container-datos">
            <JdSelect
                label="Tipo de entrega"
                :nec="true"
                :lista="useSystem.data.entrega_tipos || []"
                v-model="vista.data.entrega_tipo"
                :disabled="vista.mode == 'view'"
                style="grid-column: 1/3"
            />

            <template v-if="vista.data.entrega_tipo == 'envio'">
                <JdSelect
                    label="Direcciones"
                    :nec="true"
                    v-model="vista.direccion_elegida"
                    :lista="direcciones"
                    :disabled="vista.mode == 'view'"
                    @elegir="setDireccionEntrega"
                    v-if="vista.mode != 'view'"
                    style="grid-column: 1/3"
                />

                <JdInput
                    label="Distrito"
                    :nec="true"
                    v-model="vista.data.entrega_ubigeo"
                    :disabled="vista.mode == 'view'"
                    style="grid-column: 1/4"
                />

                <JdTextArea
                    label="Dirección de entrega"
                    :nec="true"
                    v-model="vista.data.direccion_entrega"
                    :disabled="vista.mode == 'view'"
                    style="grid-column: 1/4"
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
            </template>
        </div>

        <div>
            <JdInput
                label="Costo de envío"
                type="number"
                v-model="vista.data.entrega_costo"
                :disabled="vista.mode == 'view'"
                style="grid-column: 1/3"
                v-if="vista.data.entrega_tipo == 'envio'"
            />
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
        direcciones() {
            if (this.vista.data.tipo == 1) {
                return this.auth.empresa?.direcciones || []
            } else {
                return (this.vista.data.entre_tipo == 'retiro') // Se corrigió 'entre_tipo' si era un typo en original
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

    .container-datos {
        display: grid;
        grid-template-columns: repeat(3, 11rem);
        gap: 0.5rem;
    }
}
</style>
