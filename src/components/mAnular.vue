<template>
    <JdModal modal="mAnular" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <JdTextArea :nec="true" label="Motivo" v-model="modal.motivo" />
        </div>
    </JdModal>
</template>

<script>
import JdModal from '@/components/JdModal.vue'
import JdTextArea from '@/components/inputs/JdTextArea.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { jmsg } from '@/utils/swal'
import { urls, patch } from '@/utils/crud'

export default {
    components: {
        JdModal,
        JdTextArea,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        modal: {},

        buttons: [
            { text: 'Anular', action: 'anular', spin: false, show: true },
        ],
    }),
    created() {
        this.modal = this.useModals.mAnular
    },
    methods: {
        async anular() {
            if (this.modal.motivo == '') return jmsg('warning', 'Ingrese el motivo')

            const send = {
                id: this.modal.item.id,
                anulado_motivo: this.modal.motivo,
                item: this.modal.item,
            }

            this.useAuth.setLoading(true, 'Anulando...')
            const res = await patch(`${urls[this.modal.url]}/anular`, send, 'Anulado con éxito')
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            // this.modal.item.estado = 0
            // this.modal.item.estado1 = { id: 0, nombre: 'ANULADO' }
            
            if (this.useVistas[this.modal.vista] && this.useVistas[this.modal.vista][this.modal.array]) {
                const toMod = this.useVistas[this.modal.vista][this.modal.array].find(a => a.id == this.modal.item.id)
                if (toMod) {
                    toMod.estado = 0
                    toMod.estado1 = { id: 0, nombre: 'ANULADO' }
                }
            }

            this.useModals.show.mAnular = false
        }
    },
}
</script>

<style lang="scss" scoped>
</style>