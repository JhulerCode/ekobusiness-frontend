<template>
    <JdModal modal="mPrecioLista" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <JdInput
                label="Nombre"
                :nec="true"
                v-model="precio_lista.nombre"
                style="grid-column: 1/4"
            />

            <JdInput
                label="Descripción"
                v-model="precio_lista.descripcion"
                style="grid-column: 1/5"
            />

            <JdSelect
                label="Moneda"
                :nec="true"
                v-model="precio_lista.moneda"
                :lista="modal.monedas"
                style="grid-column: 1/4"
                :loaded="modal.monedasLoaded"
                @reload="loadMonedas"
            />

            <JdSwitch label="Activo" v-model="precio_lista.activo" style="grid-column: 1/4" />
        </div>
    </JdModal>
</template>

<script>
import { JdModal, JdInput, JdSelect, JdSwitch } from '@jhuler/components'

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
        JdSwitch,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},
        precio_lista: {},

        buttons: [
            { text: 'Grabar', action: 'crear', spin: false },
            { text: 'Actualizar', action: 'modificar', spin: false },
        ],
    }),
    created() {
        this.modal = this.useModals.mPrecioLista
        this.precio_lista = this.useModals.mPrecioLista.item

        this.showButtons()
        this.loadMonedas()
    },
    methods: {
        showButtons() {
            if (this.useModals.mPrecioLista.mode == 1) {
                this.buttons[0].show = true
            } else {
                this.buttons[1].show = true
            }
        },

        checkDatos() {
            if (incompleteData(this.precio_lista, ['nombre', 'moneda'])) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        async crear() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true)
            const res = await post(urls.precio_listas, this.precio_lista)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.addItem('vPrecioListas', 'precio_listas', res.data)
            this.useModals.show.mPrecioLista = false
        },
        async modificar() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true)
            const res = await patch(urls.precio_listas, this.precio_lista)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.updateItem('vPrecioListas', 'precio_listas', res.data)
            this.useModals.show.mPrecioLista = false
        },

        async loadMonedas() {
            const qry = {
                fltr: {},
                cols: ['id', 'nombre', 'simbolo', 'estandar'],
            }

            this.modal.monedasLoaded = false
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.monedas}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)
            this.modal.monedasLoaded = true

            if (res.code != 0) return

            this.modal.monedas = res.data
        },
    },
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: repeat(4, 7rem);
    gap: 0.5rem;
}
</style>
