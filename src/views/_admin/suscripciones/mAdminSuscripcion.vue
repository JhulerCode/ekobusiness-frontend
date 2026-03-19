<template>
    <JdModal modal="mAdminSuscripcion" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="general-datos">
            <JdSelectQuery
                label="Empresa / Cliente"
                :nec="true"
                v-model="modal.suscripcion.empresa"
                :lista="modal.empresas || []"
                @search="loadEmpresas"
                :spin="modal.spin_empresas"
                style="grid-column: 1/5"
            />

            <JdInput
                label="Nombre del Plan"
                v-model="modal.suscripcion.plan_nombre"
                style="grid-column: 1/3"
            />
            <JdSelect
                label="Periodo"
                :lista="periodos"
                v-model="modal.suscripcion.periodo"
                style="grid-column: 3/5"
            />

            <JdInput
                label="Límite de Usuarios"
                type="number"
                v-model="modal.suscripcion.limite_usuarios"
                style="grid-column: 1/3"
            />
            <JdSelect
                label="Estado"
                :lista="modal.suscripcion_estados || []"
                v-model="modal.suscripcion.estado"
                style="grid-column: 3/5"
            />

            <JdInput
                label="Fecha Inicio"
                type="date"
                v-model="modal.suscripcion.fecha_inicio"
                style="grid-column: 1/3"
            />
            <JdInput
                label="Fecha Vencimiento"
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
        this.loadDatosSistema()
    },
    methods: {
        showButtons() {
            if (this.modal.mode == 1) {
                this.buttons[0].show = true
            } else {
                this.buttons[1].show = true
            }
        },
        async loadDatosSistema() {
            const qry = ['suscripcion_estados']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)
            if (res.code != 0) return
            Object.assign(this.modal, res.data)
        },
        async loadEmpresas(txt) {
            if (!txt) {
                this.modal.empresas = []
                return
            }
            const qry = {
                fltr: { razon_social: { op: 'Contiene', val: txt } },
                cols: ['id', 'razon_social'],
                ordr: [['razon_social', 'ASC']],
            }
            this.modal.spin_empresas = true
            const res = await get(`${urls.admin_empresas}?qry=${JSON.stringify(qry)}`)
            this.modal.spin_empresas = false
            if (res.code != 0) return
            this.modal.empresas = res.data
        },
        checkDatos() {
            const props = ['empresa', 'plan_nombre', 'fecha_inicio', 'fecha_vencimiento']
            if (incompleteData(this.modal.suscripcion, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }
            return false
        },
        async crear() {
            if (this.checkDatos()) return
            this.useAuth.setLoading(true)
            const res = await post(urls.admin_suscripciones, this.modal.suscripcion)
            this.useAuth.setLoading(false)
            if (res.code != 0) return
            this.useVistas.addItem('vAdminSuscripciones', 'tableData', res.data)
            this.useModals.show.mAdminSuscripcion = false
        },
        async modificar() {
            if (this.checkDatos()) return
            this.useAuth.setLoading(true)
            const res = await patch(urls.admin_suscripciones, this.modal.suscripcion)
            this.useAuth.setLoading(false)
            if (res.code != 0) return
            this.useVistas.updateItem('vAdminSuscripciones', 'tableData', res.data)
            this.useModals.show.mAdminSuscripcion = false
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
