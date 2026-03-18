<template>
    <JdModal modal="mPrecioCompra" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <JdSelectQuery
                label="Artículo"
                v-model="modal.precio.articulo"
                :spin="modal.spinArticulos"
                :lista="modal.articulos"
                @search="loadArticulos"
                style="grid-column: 1/4"
            />

            <JdSelectQuery
                label="Proveedor"
                v-model="modal.precio.socio"
                :spin="modal.spinSocios"
                :lista="modal.socios"
                mostrar="nombres"
                @search="loadSocios"
                style="grid-column: 1/4"
            />

            <JdSelect
                label="Moneda"
                :nec="true"
                v-model="modal.precio.currency_id"
                :lista="modal.monedas"
                style="grid-column: 1/2"
                :loaded="modal.monedasLoaded"
                @reload="loadMonedas"
            />

            <JdInput
                label="Valor unitario"
                :nec="true"
                v-model="modal.precio.price"
                style="grid-column: 1/2"
            />
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
            { text: 'Grabar', action: 'crear', spin: false },
            { text: 'Actualizar', action: 'modificar', spin: false },
        ],
    }),
    created() {
        this.modal = this.useModals.mPrecioCompra

        this.showButtons()
        this.loadMonedas()
    },
    methods: {
        showButtons() {
            if (this.useModals.mPrecioCompra.mode == 1) {
                this.buttons[0].show = true
            } else {
                this.buttons[1].show = true
            }
        },

        checkDatos() {
            const props = ['articulo', 'socio', 'currency_id', 'price']

            if (incompleteData(this.modal.precio, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        async crear() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true)
            const res = await post(urls.articulo_suppliers, this.modal.precio)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.addItem('vPreciosCompra', 'tableData', res.data)
            this.useModals.show.mPrecioCompra = false
        },
        async modificar() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true)
            const res = await patch(urls.articulo_suppliers, this.modal.precio)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.updateItem('vPreciosCompra', 'tableData', res.data)
            this.useModals.show.mPrecioCompra = false
        },

        async loadArticulos(txtBuscar) {
            if (!txtBuscar) {
                this.modal.articulos.length = 0
                return
            }

            const qry = {
                fltr: {
                    activo: { op: 'Es', val: true },
                    purchase_ok: { op: 'Es', val: true },
                    nombre: { op: 'Contiene', val: txtBuscar },
                },
                cols: ['nombre'],
                ordr: [['nombre', 'ASC']],
            }

            this.modal.spinArticulos = true
            const res = await get(`${urls.articulos}?qry=${JSON.stringify(qry)}`)
            this.modal.spinArticulos = false

            if (res.code != 0) return

            this.modal.articulos = JSON.parse(JSON.stringify(res.data))
        },
        async loadSocios(txtBuscar) {
            if (!txtBuscar) {
                this.modal.socios.length = 0
                return
            }

            const qry = {
                fltr: {
                    activo: { op: 'Es', val: true },
                    nombres: { op: 'Contiene', val: txtBuscar },
                },
                cols: ['nombres'],
                ordr: [['nombres', 'ASC']],
            }

            this.modal.spinSocios = true
            const res = await get(`${urls.socios}?qry=${JSON.stringify(qry)}`)
            this.modal.spinSocios = false

            if (res.code !== 0) return

            this.modal.socios = res.data
        },
        async loadMonedas() {
            const qry = {
                fltr: {},
                cols: ['id', 'nombre', 'simbolo', 'estandar'],
                ordr: [
                    ['estandar', 'DESC'],
                    ['nombre', 'ASC'],
                ],
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
    grid-template-columns: repeat(2, 20rem);
    gap: 0.5rem;
}
</style>
