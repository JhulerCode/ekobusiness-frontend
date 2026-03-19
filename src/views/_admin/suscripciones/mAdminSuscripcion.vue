<template>
    <JdModal
        modal="mAdminSuscripcion"
        :buttons="buttons"
        @button-click="(action) => this[action]()"
    >
        <div class="general-datos">
            <JdSelectQuery
                label="Empresa / Cliente"
                :nec="true"
                v-model="modal.suscripcion.empresa"
                :selectedObject="modal.suscripcion.empresa1"
                :search="loadEmpresas"
                mostrar="razon_social"
                style="grid-column: 1/5"
            />

            <JdInput
                label="Nombre del Plan"
                :nec="true"
                v-model="modal.suscripcion.plan_nombre"
                style="grid-column: 1/3"
            />

            <JdSelect
                label="Periodo"
                :nec="true"
                :lista="periodos"
                v-model="modal.suscripcion.periodo"
                style="grid-column: 3/5"
            />

            <JdInput
                label="Límite de Usuarios"
                :nec="true"
                type="number"
                v-model="modal.suscripcion.limite_usuarios"
                style="grid-column: 1/3"
            />

            <JdInput
                label="Precio"
                :nec="true"
                type="number"
                v-model="modal.suscripcion.precio"
                style="grid-column: 1/3"
            />

            <JdSelectQuery
                label="Moneda"
                :nec="true"
                v-model="modal.suscripcion.moneda"
                :selectedObject="modal.suscripcion.moneda1"
                :search="loadMonedas"
                style="grid-column: 3/5"
            />

            <JdInput
                label="Fecha Inicio"
                :nec="true"
                type="date"
                v-model="modal.suscripcion.fecha_inicio"
                style="grid-column: 1/3"
            />

            <JdInput
                label="Fecha Vencimiento"
                :nec="true"
                type="date"
                v-model="modal.suscripcion.fecha_vencimiento"
                style="grid-column: 3/5"
            />

            <JdInput
                label="Observaciones"
                type="textarea"
                v-model="modal.suscripcion.observaciones"
                style="grid-column: 1/5"
            />
        </div>
    </JdModal>
</template>

<script>
import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'
import { urls, post, patch, get } from '@/utils/crud'
import { incompleteData } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

export default {
    name: 'mAdminSuscripcion',
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},
        periodos: [
            { id: 'mensual', nombre: 'Mensual' },
            { id: 'anual', nombre: 'Anual' },
        ],
        buttons: [
            { text: 'Activar Plan', action: 'crear', spin: false, show: false },
            { text: 'Actualizar', action: 'modificar', spin: false, show: false },
        ],
    }),
    created() {
        this.modal = this.useModals.mAdminSuscripcion
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
            const props = [
                'empresa',
                'plan_nombre',
                'periodo',
                'limite_usuarios',
                'precio',
                'moneda',
                'fecha_inicio',
                'fecha_vencimiento',
            ]
            if (incompleteData(this.modal.suscripcion, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }
            return false
        },
        async crear() {
            if (this.checkDatos()) return
            this.useAuth.setLoading(true)
            const res = await post(urls.suscripciones, this.modal.suscripcion)
            this.useAuth.setLoading(false)
            if (res.code != 0) return
            this.useVistas.addItem('vAdminSuscripciones', 'tableData', res.data)
            this.useModals.show.mAdminSuscripcion = false
        },
        async modificar() {
            if (this.checkDatos()) return
            this.useAuth.setLoading(true)
            const res = await patch(urls.suscripciones, this.modal.suscripcion)
            this.useAuth.setLoading(false)
            if (res.code != 0) return
            this.useVistas.updateItem('vAdminSuscripciones', 'tableData', res.data)
            this.useModals.show.mAdminSuscripcion = false
        },

        // --- Datos auxiliares ---
        async loadEmpresas(txt) {
            const qry = {
                fltr: {},
                cols: ['razon_social'],
                ordr: [['razon_social', 'ASC']],
                limt: 25,
            }

            if (txt) {
                qry.fltr.razon_social = { op: 'Contiene', val: txt }
            }

            const res = await get(`${urls.empresas}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            return res.data
        },
        async loadMonedas(txt) {
            const qry = {
                fltr: {},
                cols: ['nombre'],
                ordr: [['nombre', 'ASC']],
                limt: 25,
            }

            if (txt) {
                qry.fltr.nombre = { op: 'Contiene', val: txt }
            }

            const res = await get(`${urls.monedas}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            return res.data
        },
    },
}
</script>

<style lang="scss" scoped>
.general-datos {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    padding: 1rem;
}
</style>
