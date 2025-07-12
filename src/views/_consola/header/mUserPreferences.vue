<template>
    <JdModal modal="mUserPreferences" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <JdInput label="Color principal" :nec="true" type="color" v-model="modal.usuario.color" />
            <JdSelect label="Formato fecha" :nec="true" v-model="modal.usuario.format_date" :lista="fecha_formatos"
                mostrar="id" />
        </div>
    </JdModal>
</template>

<script>
import JdModal from '@/components/JdModal.vue'
import JdInput from '@/components/inputs/JdInput.vue'
import JdSelect from '@/components/inputs/JdSelect.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
// import { useVistas } from '@/pinia/vistas'

import { urls, patch } from '@/utils/crud'

export default {
    components: {
        JdModal,
        JdInput,
        JdSelect
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),

        modal: {},

        fecha_formatos: [
            { id: 'DD-MM-YYYY' },
            { id: 'MM-DD-YYYY' },
            { id: 'YYYY-MM-DD' },
            { id: 'DD-MM-YY' },
            { id: 'MM-DD-YY' },
            { id: 'YY-MM-DD' },
            { id: 'DD/MM/YYYY' },
            { id: 'MM/DD/YYYY' },
            { id: 'YYYY/MM/DD' },
            { id: 'DD/MM/YY' },
            { id: 'MM/DD/YY' },
            { id: 'YY/MM/DD' },
        ],

        buttons: [
            { text: 'Actualizar', action: 'modificar', show: true },
        ],
    }),
    created() {
        this.modal = this.useModals.mUserPreferences
        this.modal.usuario = JSON.parse(JSON.stringify(this.useAuth.usuario))
    },
    methods: {
        async modificar() {
            const send = {
                id: this.modal.usuario.colaborador,
                color: this.modal.usuario.color,
                format_date: this.modal.usuario.format_date
            }

            this.useAuth.setLoading(true, 'Actualizando...')
            const res = await patch(`${urls.colaboradores}/preferencias`, send)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useAuth.usuario.color = this.modal.usuario.color
            this.useAuth.setPrimaryColor(this.modal.usuario.color)
            this.useAuth.usuario.format_date = this.modal.usuario.format_date

            this.useModals.show.mUserPreferences = false
        }
    }
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: 20rem;
    gap: 0.5rem
}
</style>