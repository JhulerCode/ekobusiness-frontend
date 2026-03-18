<template>
    <JdModal modal="mMoneda" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <JdInput label="Nombre" :nec="true" v-model="modal.moneda.nombre" />
            <JdInput label="Código" :nec="true" v-model="modal.moneda.codigo" />
            <JdInput label="Símbolo" :nec="true" v-model="modal.moneda.simbolo" />
            <JdInput label="En plural" :nec="true" v-model="modal.moneda.plural" />
        </div>
    </JdModal>
</template>

<script>
import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, post, patch } from '@/utils/crud'
import { incompleteData } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

export default {
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},

        buttons: [
            { text: 'Grabar', action: 'crear', spin: false },
            { text: 'Actualizar', action: 'modificar', spin: false },
        ],
    }),
    created() {
        this.modal = this.useModals.mMoneda

        this.showButtons()
    },
    methods: {
        showButtons() {
            if (this.modal.mode == 1) {
                this.buttons[0].show = true
            } else {
                this.buttons[1].show = true
            }
        },

        checkDatos() {
            const props = ['nombre', 'codigo', 'simbolo', 'plural']

            if (incompleteData(this.modal.moneda, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        async crear() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Creando...')
            const res = await post(urls.monedas, this.modal.moneda)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.addItem('vMonedas', 'tableData', res.data)
            this.useModals.show.mMoneda = false
        },
        async modificar() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Actualizando...')
            const res = await patch(urls.monedas, this.modal.moneda)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.updateItem('vMonedas', 'tableData', res.data)
            this.useModals.show.mMoneda = false
        },
    },
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: 20rem;
    gap: 0.5rem;
}
</style>