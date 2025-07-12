<template>
    <JdModal modal="mProduccionDevolucion" :buttons="buttons" @button-click="(action) => this[action]()">
        <p class="mrg-btm1">
            {{ transaccion.transaccion_items[0].articulo1.nombre  }}
        </p>

        <div class="container-datos">
            <JdInput type="date" :nec="true" label="Fecha" v-model="transaccion.fecha" />
            <JdInput type="number" :nec="true" label="Cantidad" v-model="transaccion.transaccion_items[0].cantidad" />
        </div>
    </JdModal>
</template>

<script>
import JdModal from "@/components/JdModal.vue"
import JdInput from "@/components/inputs/JdInput.vue"

import { useModals } from "@/pinia/modals"
import { useVistas } from "@/pinia/vistas"

import { urls, post } from "@/utils/crud"
import { jmsg } from "@/utils/swal"

export default {
    components: {
        JdModal,
        JdInput,
    },
    data: () => ({
        useModals: useModals(),
        useVistas: useVistas(),

        buttons: [
            { text: 'Grabar', action: 'grabar', spin: false, show: true },
        ],
    }),
    created() {
        this.transaccion = this.useModals.mProduccionDevolucion.item
    },
    methods: {
        checkDatos() {
            if (!this.transaccion.fecha || !this.transaccion.fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
                jmsg('error', 'Ingrese la fecha')
                return true
            }

            if (this.transaccion.transaccion_items[0].cantidad == null) {
                jmsg('error', 'Ingrese la cantidad')
                return true
            }

            return false
        },
        async grabar() {
            if (this.checkDatos()) return

            this.buttons[0].spin = true
            const res = await post(`${urls.transacciones}/produccion-salida`, this.transaccion)
            this.buttons[0].spin = false

            if (res.code != 0) return

            this.$emit('devuelto', res.data)
            this.useModals.show.mProduccionDevolucion = false
        },
    },
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: 15rem;
    gap: 0.5rem 1rem;
}
</style>