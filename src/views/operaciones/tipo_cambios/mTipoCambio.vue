<template>
    <JdModal modal="mTipoCambio" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <JdInput label="Fecha" :nec="true" type="date" v-model="modal.tipo_cambio.fecha" />
            <JdSelectQuery
                label="Moneda"
                :nec="true"
                :search="loadMonedas"
                :selectedObject="modal.tipo_cambio.moneda1"
                v-model="modal.tipo_cambio.moneda"
            />
            <JdInput label="Compra" :nec="true" type="number" v-model="modal.tipo_cambio.compra" />
            <JdInput label="Venta" :nec="true" type="number" v-model="modal.tipo_cambio.venta" />
        </div>
    </JdModal>
</template>

<script>
import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, post, patch } from '@/utils/crud'
import { incompleteData } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

export default {
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
        this.modal = this.useModals.mTipoCambio
        this.showButtons()
    },
    methods: {
        showButtons() {
            if (this.useModals.mTipoCambio.mode == 1) {
                this.buttons[0].show = true
            } else {
                this.buttons[1].show = true
            }
        },

        checkDatos() {
            const props = ['fecha', 'compra', 'venta']

            if (incompleteData(this.modal.tipo_cambio, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        async crear() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Creando...')
            const res = await post(urls.tipo_cambios, this.modal.tipo_cambio)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.addItem('vTipoCambios', 'tableData', res.data, 'first')
            this.useModals.show.mTipoCambio = false
        },
        async modificar() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Actualizando...')
            const res = await patch(urls.tipo_cambios, this.modal.tipo_cambio)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.updateItem('vTipoCambios', 'tableData', this.modal.tipo_cambio)
            this.useModals.show.mTipoCambio = false
        },

        // --- auxiliar data ---
        async loadMonedas(txtBuscar) {
            const qry = {
                fltr: {},
                cols: ['id', 'nombre', 'simbolo'],
                ordr: [['nombre', 'ASC']],
                limt: 25,
            }

            if (txtBuscar) {
                qry.fltr.nombre = { op: 'Contiene', val: txtBuscar }
            }

            const res = await get(`${urls.monedas}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            return res.data
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
