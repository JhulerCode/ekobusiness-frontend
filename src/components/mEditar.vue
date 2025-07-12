<template>
    <JdModal modal="mEditar" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <div>
                <p>Propiedad para actualizar</p>
                <JdSelect v-model="modal.nuevo.prop" :lista="modal.cols" mostrar="title" @elegir="setAtributo" />
            </div>

            <div v-if="modal.elegido?.id">
                <p>Valor</p>

                <JdInput v-model="modal.nuevo.val" v-if="modal.elegido.type == 'text'" />

                <JdInput v-model="modal.nuevo.val" type="number" v-if="modal.elegido.type == 'number'" />

                <JdSelect v-model="modal.nuevo.val" :lista="modal.elegido.lista || []"
                    v-if="modal.elegido.type == 'select'" />

                <JdSwitch v-model="modal.nuevo.val" v-if="modal.elegido.type == 'boolean'" />
            </div>
        </div>
    </JdModal>
</template>

<script>
import JdModal from '@/components/JdModal.vue'
import JdInput from '@/components/inputs/JdInput.vue'
import JdSelect from '@/components/inputs/JdSelect.vue'
import JdSwitch from '@/components/inputs/JdSwitch.vue'

import { useModals } from '@/pinia/modals'
import { useAuth } from '@/pinia/auth'

import { urls, patch } from '@/utils/crud'
import { incompleteData } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdInput,
        JdSelect,
        JdSwitch,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),

        buttons: [
            { text: 'Actualizar', action: 'modificar', show: true },
        ],
    }),
    created() {
        this.modal = this.useModals.mEditar
    },
    methods: {
        setAtributo(item) {
            this.modal.elegido = this.modal.cols.find(a => a.id == item.id)
            this.modal.nuevo.val = null
        },
        checkDatos() {
            const props = ['prop', 'val']

            if (incompleteData(this.modal.nuevo, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        shapeDatos() {
            this.modal.nuevo.id = 'bulk'
            this.modal.nuevo.ids = this.modal.ids
            
            if (this.modal.elegido.lista) {
                this.modal.nuevo.val1 = this.modal.elegido.lista.find(a => a.id == this.modal.nuevo.val)
            }
        },
        async modificar() {
            if (this.checkDatos()) return
            this.shapeDatos()

            this.useAuth.setLoading(true, 'Actualizando...')
            const res = await patch(`${urls[this.modal.uri]}/bulk`, this.modal.nuevo)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.$emit('updated', this.modal.nuevo)
            this.useModals.show.mEditar = false
        },
    }
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: 20rem;
    gap: 1rem;

    p {
        margin-bottom: 0.5rem;
    }
}
</style>