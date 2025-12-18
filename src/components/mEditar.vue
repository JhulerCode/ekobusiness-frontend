<template>
    <JdModal modal="mEditar" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <div>
                <p>Propiedad para actualizar</p>
                <JdSelect
                    v-model="modal.nuevo.prop"
                    :lista="modal.cols1"
                    mostrar="title"
                    @elegir="setAtributo"
                />
            </div>

            <div v-if="modal.elegido?.id">
                <p>Valor</p>

                <JdInput v-model="modal.nuevo.val" v-if="modal.elegido.type == 'text'" />

                <JdInput
                    v-model="modal.nuevo.val"
                    type="number"
                    v-if="modal.elegido.type == 'number'"
                />

                <JdSelect
                    :lista="modal.elegido.lista || []"
                    :mostrar="modal.elegido.mostrar || 'nombre'"
                    :loaded="typeof colsMap[modal.elegido.id].reload == 'function'"
                    @reload="runMethod(modal.elegido)"
                    v-model="modal.nuevo.val"
                    v-if="modal.elegido.type == 'select'"
                />

                <JdSwitch v-model="modal.nuevo.val" v-if="modal.elegido.type == 'boolean'" />
            </div>
        </div>
    </JdModal>
</template>

<script>
// import JdModal from '../JdModal.vue'

// import JdInput from '../inputs/JdInput.vue'
// import JdSelect from '../inputs/JdSelect.vue'
// import JdSwitch from '../inputs/JdSwitch.vue'
import { JdModal, JdInput, JdSelect, JdSwitch } from '@jhuler/components'

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

        buttons: [{ text: 'Actualizar', action: 'modificar', show: true }],
    }),
    computed: {
        colsMap() {
            return this.modal.cols.reduce((obj, a) => ((obj[a.id] = a), obj), {})
        },
    },
    created() {
        this.modal = this.useModals.mEditar

        this.modal.cols1 = JSON.parse(
            JSON.stringify(this.modal.cols.filter((a) => a.editable == true)),
        )
    },
    methods: {
        setAtributo(item) {
            // this.modal.elegido = this.modal.cols1.find((a) => a.id == item.id)
            this.modal.elegido = item
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
                this.modal.nuevo.val1 = this.modal.elegido.lista.find(
                    (a) => a.id == this.modal.nuevo.val,
                )
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

        async runMethod(item) {
            item.lista = await this.colsMap[item.id].reload();
            this.colsMap[item.id].lista = item.lista;
        },
    },
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
