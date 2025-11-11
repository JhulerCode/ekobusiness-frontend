<template>
    <JdModal modal="mAsistencia" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <JdSelect
                label="Colaborador"
                :nec="true"
                v-model="modal.asistencia.colaborador"
                :lista="modal.colaboradores || []"
                mostrar="nombres_apellidos"
                :disabled="modal.mode == 3"
            />

            <JdInput
                label="Fecha de entrada"
                :nec="true"
                type="date"
                v-model="modal.asistencia.fecha_entrada"
                :disabled="modal.mode == 3"
            />

            <JdInput
                label="Hora de entrada"
                :nec="true"
                type="time"
                v-model="modal.asistencia.hora_entrada"
                :disabled="modal.mode == 3"
            />

            <JdInput
                label="Fecha de salida"
                :nec="true"
                type="date"
                v-model="modal.asistencia.fecha_salida"
                :disabled="modal.mode == 3"
            />

            <JdInput
                label="Hora de salida"
                :nec="true"
                type="time"
                v-model="modal.asistencia.hora_salida"
                :disabled="modal.mode == 3"
            />
        </div>
    </JdModal>
</template>

<script>
import { JdModal, JdInput, JdSelect } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, post, patch } from '@/utils/crud'
import { incompleteData } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdInput,
        JdSelect,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},

        buttons: [
            { text: 'Grabar', action: 'crear' },
            { text: 'Actualizar', action: 'modificar' },
        ],
    }),

    created() {
        this.modal = this.useModals.mAsistencia

        this.showButtons()
    },
    methods: {
        showButtons() {
            if (this.modal.mode == 1) {
                this.buttons[0].show = true
            } else if (this.modal.mode == 2) {
                this.buttons[1].show = true
            }
        },

        checkDatos() {
            const props = [
                'colaborador',
                'fecha_entrada',
                'hora_entrada',
                'fecha_salida',
                'hora_salida',
            ]

            if (incompleteData(this.modal.asistencia, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        async crear() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Creando...')
            const res = await post(urls.asistencias, this.modal.asistencia)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.addItem('vAsistencias', 'asistencias', res.data)

            this.useModals.show.mAsistencia = false
        },
        async modificar() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Actualizando...')
            const res = await patch(urls.asistencias, this.modal.asistencia)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.updateItem('vAsistencias', 'asistencias', res.data)
            this.useModals.show.mAsistencia = false
        },
    },
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: 30rem;
    gap: 0.5rem;
    height: fit-content;
}
</style>
