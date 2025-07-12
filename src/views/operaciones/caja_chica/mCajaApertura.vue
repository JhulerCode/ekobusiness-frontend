<template>
    <JdModal modal="mCajaApertura" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <JdInput label="Fecha apertura" :nec="true" type="date" v-model="caja_apertura.fecha_apertura"
                :disabled="modal.mode != 1" />
            <JdInput label="Monto apertura" :nec="true" type="number" v-model="caja_apertura.monto_apertura"
                :disabled="modal.mode != 1" />
        </div>

        <div class="container-datos mrg-top1" v-if="[2, 3].includes(modal.mode)">
            <JdInput label="Fecha cierre" :nec="true" type="date" v-model="caja_apertura.fecha_cierre"
                :disabled="modal.mode != 2" />
            <JdInput label="Monto cierre" :nec="true" type="number" v-model="caja_apertura.monto_cierre"
                :disabled="modal.mode != 2" />
        </div>

        <div class="container-resumen" v-if="modal.mode != 1">
            <div class="monto-resumen">
                <p>{{ redondear(egresos) }}</p>
                <small>Egresos</small>
            </div>

            <div class="monto-resumen">
                <p>{{ redondear(caja_apertura.monto_apertura - egresos) }}</p>
                <small>Saldo disponible</small>
            </div>
        </div>



        <div class="container-movimientos" v-if="[3, 4].includes(modal.mode)">
            <p class="mrg-btm1">
                <strong>--- Movimientos ---</strong>
            </p>

            <div class="container-agregar"
                v-if="modal.mode == 4 && useAuth.verifyPermiso('vCajaMovimientos_crear', 'vCajaMovimientos_editar')">
                <div class="container-nuevo">
                    <JdInput label="Fecha" :nec="true" type="date" v-model="modal.nuevo.fecha" />
                    <JdInput label="Detalle" :nec="true" type="text" v-model="modal.nuevo.detalle" />
                    <JdInput label="Monto" :nec="true" type="number" v-model="modal.nuevo.monto" />

                    <JdButton text="Grabar" tipo="2" @click="addMovimiento"
                        v-if="useAuth.verifyPermiso('vCajaMovimientos_crear') && modal.nuevo?.id == null" />

                    <JdButton icon="fa-solid fa-pen-to-square" text="Actualizar" tipo="2" @click="editarMovimiento"
                        v-if="useAuth.verifyPermiso('vCajaMovimientos_editar') && modal.nuevo?.id != null" />
                </div>
            </div>

            <JdTable :columns="columns" :datos="caja_apertura?.caja_movimientos || []" maxHeight="30rem"
                :colAct="modal.mode != 3" :reload="loadCajaMovimientos" :rowOptions="tableRowOptions"
                @rowOptionSelected="runMethod" ref="jdtable">
            </JdTable>
        </div>
    </JdModal>
</template>

<script>
import JdModal from '@/components/JdModal.vue'
import JdInput from '@/components/inputs/JdInput.vue'
import JdButton from '@/components/inputs/JdButton.vue'
import JdTable from '@/components/JdTable.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, post, patch, delet, get } from '@/utils/crud'
import { incompleteData, redondear } from '@/utils/mine'
import { jmsg, jqst } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdInput,
        JdButton,
        JdTable,
    },
    computed: {
        egresos() {
            // Suma todos los montos de los movimientos
            if (!this.caja_apertura || !this.caja_apertura.caja_movimientos) return 0
            return this.caja_apertura.caja_movimientos.reduce((acc, mov) => acc + (mov.monto || 0), 0)
        }
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),
        redondear,

        modal: {},
        caja_apertura: {},

        buttons: [
            { text: 'Grabar', action: 'crear', spin: false },
            { text: 'Actualizar', action: 'modificar', spin: false },
        ],

        columns: [
            {
                id: 'fecha',
                title: 'Fecha',
                format: 'date',
                width: '8rem',
                show: true,
                seek: true,
                sort: true
            },
            {
                id: 'detalle',
                title: 'Detalle',
                width: '20rem',
                show: true,
                seek: true,
            },
            {
                id: 'monto',
                title: 'Monto',
                format: 'decimal',
                width: '10rem',
                show: true,
                seek: true,
            }
        ],
        tableRowOptions: [
            { id: 1, label: 'Editar', icon: 'fa-solid fa-pen-to-square', action: 'editMovimiento', permiso: 'vCajaMovimientos_editar' },
            { id: 2, label: 'Eliminar', icon: 'fa-solid fa-trash-can', action: 'deleteMovimiento', permiso: 'vCajaMovimientos_eliminar', ocultar: { estado: 2 } },
        ],
    }),
    created() {
        this.modal = this.useModals.mCajaApertura
        this.modal.nuevo = {}
        this.caja_apertura = this.useModals.mCajaApertura.item

        if (this.modal.mode == 3) {
            setTimeout(() => {
                this.$refs.jdtable.sortData(this.columns[0], 'desc')
            }, 100)
        }

        this.showButtons()
    },
    methods: {
        showButtons() {
            if (this.modal.mode == 1) {
                this.buttons[0].show = true
            }
            else if (this.modal.mode == 2) {
                this.buttons[1].show = true
            }
        },

        checkDatos() {
            let props = []

            if (this.modal.mode == 1) {
                props = ['fecha_apertura', 'monto_apertura']
            }
            else if (this.modal.mode == 2) {
                props = ['fecha_cierre', 'monto_cierre']
            }

            if (incompleteData(this.caja_apertura, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        async crear() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Grabando...')
            const res = await post(urls.caja_aperturas, this.caja_apertura)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.addItem('vCajaAperturas', 'caja_aperturas', res.data)
            this.useModals.show.mCajaApertura = false
        },
        async modificar() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Grabando...')
            const res = await patch(urls.caja_aperturas, this.caja_apertura)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.updateItem('vCajaAperturas', 'caja_aperturas', res.data)
            this.useModals.show.mCajaApertura = false
        },

        initCajaMovimiento() {
            this.modal.nuevo = {}
        },
        checkDatos1() {
            const props = ['fecha', 'detalle', 'monto']

            if (incompleteData(this.modal.nuevo, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        async addMovimiento() {
            if (this.checkDatos1()) return

            const send = {
                ...this.modal.nuevo,
                tipo: 2,
                caja_apertura: this.caja_apertura.id
            }

            this.useAuth.setLoading(true, 'Grabando...')
            const res = await post(urls.caja_movimientos, send)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.caja_apertura.caja_movimientos.unshift(res.data)
            this.$refs.jdtable.sortData(this.columns[0], 'desc')
            this.initCajaMovimiento()
        },
        async editarMovimiento() {
            if (this.checkDatos1()) return

            this.useAuth.setLoading(true, 'Actualizando...')
            const res = await patch(urls.caja_movimientos, this.modal.nuevo)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.caja_apertura.caja_movimientos.splice(this.modal.nuevo.i, 1, this.modal.nuevo)
            this.$refs.jdtable.sortData(this.columns[0], 'desc')
            this.initCajaMovimiento()
        },

        runMethod(method, item) {
            this[method](item)
        },
        editMovimiento(item) {
            this.modal.nuevo = JSON.parse(JSON.stringify(item))
        },
        async deleteMovimiento(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.caja_movimientos, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vCaja', 'articulo_categorias', item)
            this.caja_apertura.caja_movimientos = this.caja_apertura.caja_movimientos.filter(a => a.id != item.id)
        },

        async loadCajaMovimientos() {
            this.caja_apertura.caja_movimientos = []

            const qry = {
                fltr: {
                    caja_apertura: { op: 'Es', val: this.caja_apertura.id },
                },
                cols: ['id', 'fecha', 'detalle', 'monto'],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.caja_movimientos}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.caja_apertura.caja_movimientos = res.data
        },
    }
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem 1rem;
}

.container-resumen {
    margin-top: 2rem;
    display: flex;
    justify-content: space-around;

    .monto-resumen {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        p {
            font-size: 1.4rem;
        }
    }
}

.container-agregar {
    margin-bottom: 2rem;

    .container-nuevo {
        display: grid;
        grid-template-columns: 20rem 20rem;
        gap: 0.5rem 1rem;
    }
}

.container-movimientos {
    margin-top: 2rem;
}
</style>