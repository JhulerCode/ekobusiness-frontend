<template>
    <JdModal
        modal="mProduccionInsumosDevolucion"
        :buttons="buttons"
        @button-click="(action) => this[action]()"
    >
        <p class="mrg-btm1">
            {{ modal.articulo.nombre }}
        </p>

        <div class="container-datos">
            <JdInput type="date" :nec="true" label="Fecha" v-model="modal.transaccion.fecha" />

            <JdInput
                type="number"
                :nec="true"
                label="Cantidad"
                v-model="modal.transaccion.cantidad"
            />
        </div>
    </JdModal>
</template>

<script>
import JdModal from '@/components/JdModal.vue'
import JdInput from '@/components/inputs/JdInput.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, post } from '@/utils/crud'
import { incompleteData } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdInput,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        buttons: [{ text: 'Grabar', action: 'grabar', show: true }],
    }),
    created() {
        this.modal = this.useModals.mProduccionInsumosDevolucion
    },
    methods: {
        checkDatos() {
            const props = ['fecha', 'articulo', 'cantidad', 'lote_padre']

            if (incompleteData(this.modal.transaccion, props)) {
                jmsg('warning', 'Completa los campos requeridos')
                return true
            }

            return false
        },
        async grabar() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Grabando...')
            const res = await post(`${urls.kardex}/produccion-insumos`, this.modal.transaccion)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.$emit('devuelto', res.data)
            this.useModals.show.mProduccionInsumosDevolucion = false
        },
    },
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: 15rem 15rem;
    gap: 0.5rem 1rem;
}
</style>
