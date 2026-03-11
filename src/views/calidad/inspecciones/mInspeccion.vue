<template>
    <JdModal modal="mInspeccion" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <JdInput
                label="Fecha"
                :nec="true"
                type="date"
                v-model="modal.inspeccion.fecha"
                :disabled="modal.mode == 3"
            />
            <JdSelect
                label="Cliente"
                :nec="true"
                :lista="modal.socios"
                mostrar="nombres"
                v-model="modal.inspeccion.socio"
                :disabled="modal.mode == 3"
            />
            <JdInput
                label="Puntuación"
                :nec="true"
                type="number"
                v-model="modal.inspeccion.puntuacion"
                :disabled="modal.mode == 3"
            />
            <JdInput
                label="Puntuación máxima"
                :nec="true"
                type="number"
                v-model="modal.inspeccion.puntuacion_maxima"
                :disabled="modal.mode == 3"
            />
        </div>

        <div>
            <div class="agregar">
                <strong>--- Correcciones ---</strong>
                <JdButton
                    icon="fa-solid fa-plus"
                    text="Agregar"
                    tipo="2"
                    @click="addNew()"
                    v-if="modal.mode != 3"
                />
            </div>

            <JdTable
                :columns="columns"
                :datos="modal.inspeccion.correcciones"
                :seeker="false"
                :colAct="modal.mode != 3"
                :download="false"
                :inputsDisabled="modal.mode == 3"
            >
                <template v-slot:cAction="{ item }">
                    <JdButton
                        icon="fa-solid fa-trash"
                        title="Eliminar"
                        tipo="2"
                        :small="true"
                        @click="removeItem(item)"
                    />
                </template>
            </JdTable>
        </div>
    </JdModal>
</template>

<script>
import { JdModal, JdInput, JdSelect, JdButton, JdTable } from '@jhuler/components'

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
        JdButton,
        JdTable,
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

        columns: [
            {
                id: 'correccion',
                title: 'Detalle',
                width: '20rem',
                input: true,
                type: 'text',
                show: true,
            },
            {
                id: 'estado',
                title: 'Realizado?',
                input: true,
                type: 'check',
                width: '5rem',
                show: true,
            },
        ],
    }),
    created() {
        this.modal = this.useModals.mInspeccion

        this.showButtons()

        if (this.modal.mode != 3) {
            this.loadSocios()
        }
    },
    methods: {
        showButtons() {
            if (this.modal.mode == 1) {
                this.buttons[0].show = true
            } else if (this.modal.mode == 2) {
                this.buttons[1].show = true
            }
        },

        addNew() {
            this.modal.inspeccion.correcciones.push({
                id: crypto.randomUUID(),
                correccion: '',
                estado: false,
            })
        },
        removeItem(item) {
            this.modal.inspeccion.correcciones = this.modal.inspeccion.correcciones.filter(
                (a) => a.id != item.id,
            )
        },

        checkDatos() {
            const props = ['fecha', 'socio', 'puntuacion', 'puntuacion_maxima']

            if (incompleteData(this.modal.inspeccion, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        async crear() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Creando...')
            const res = await post(urls.inspecciones, this.modal.inspeccion)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.addItem('vInspecciones', 'tableData', res.data)
            this.useModals.show.mInspeccion = false
        },
        async modificar() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Actualizando...')
            const res = await patch(urls.inspecciones, this.modal.inspeccion)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.updateItem('vInspecciones', 'tableData', res.data)
            this.useModals.show.mInspeccion = false
        },

        async loadSocios() {
            const qry = {
                fltr: { tipo: { op: 'Es', val: 2 }, activo: { op: 'Es', val: true } },
                cols: ['nombres'],
                ordr: [['nombres', 'ASC']],
            }

            this.modal.socios = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.socios}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code !== 0) return

            this.modal.socios = res.data
        },
    },
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: 30rem;
    gap: 0.5rem;
    margin-bottom: 2rem;
}

.agregar {
    display: flex;
    justify-content: space-between;
    // align-items: center;
    margin-bottom: 1rem;
}
</style>
