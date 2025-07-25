<template>
    <JdModal modal="mMaquina" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <JdInput label="Código" :nec="true" v-model="maquina.codigo" v-if="maquina.tipo == 2" />
            <JdInput label="Nombre" :nec="true" v-model="maquina.nombre" />
            <JdInput label="Fecha de compra" type="date" :nec="true" v-model="maquina.fecha_compra" />

            <template v-if="maquina.tipo == 1">
                <JdSelect label="Tipo de producción" :nec="true" :lista="modal.produccion_tipos || []"
                    v-model="maquina.produccion_tipo" />
                <JdInput label="Velocidad (und/min)" :nec="true" type="number" v-model="maquina.velocidad" />
                <JdInput label="Tiempo de limpieza (min)" :nec="true" type="number" v-model="maquina.limpieza_tiempo" />
            </template>
        </div>
    </JdModal>
</template>

<script>
import JdModal from '@/components/JdModal.vue'
import JdInput from '@/components/inputs/JdInput.vue'
import JdSelect from '@/components/inputs/JdSelect.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, post, patch } from '@/utils/crud'
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
        maquina: {},

        buttons: [
            { text: 'Grabar', action: 'crear', spin: false },
            { text: 'Actualizar', action: 'modificar', spin: false },
        ],
    }),
    created() {
        this.modal = this.useModals.mMaquina
        this.maquina = this.useModals.mMaquina.item

        this.showButtons()
        this.loadDatosSistema()
    },
    methods: {
        showButtons() {
            if (this.useModals.mMaquina.mode == 1) {
                this.buttons[0].show = true
            }
            else {
                this.buttons[1].show = true
            }
        },

        checkDatos() {
            const props = ['nombre']

            if (this.maquina.tipo == 1) props.push('produccion_tipo', 'velocidad', 'limpieza_tiempo')
            if (this.maquina.tipo == 2) props.push('codigo')

            if (incompleteData(this.maquina, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        async crear() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Creando...')
            const res = await post(urls.maquinas, this.maquina)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const vista = this.maquina.tipo == 1 ? 'vMaquinas' : 'vEquipos'
            this.useVistas.addItem(vista, 'maquinas', res.data)
            this.useModals.show.mMaquina = false
        },
        async modificar() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Actualizando...')
            const res = await patch(urls.maquinas, this.maquina)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const vista = this.maquina.tipo == 1 ? 'vMaquinas' : 'vEquipos'
            this.useVistas.updateItem(vista, 'maquinas', res.data)
            this.useModals.show.mMaquina = false
        },

        async loadDatosSistema() {
            const qry = ['produccion_tipos']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.modal, res.data)
        },
    }
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: 30rem;
    gap: 0.5rem;
}
</style>
