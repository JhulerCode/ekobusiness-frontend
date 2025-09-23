<template>
    <JdModal modal="mTipoCambios">
        <div class="mrg-btm1">
            {{ modal.moneda?.nombre }}
        </div>

        <div class="container-datos" v-if="useAuth.verifyPermiso('vTipoCambios:crear', 'vTipoCambios:editar')">
            <JdInput label="Fecha" :nec="true" type="date" v-model="tipo_cambio.fecha" />
            <JdInput label="Compra" :nec="true" type="number" v-model="tipo_cambio.compra" />
            <JdInput label="Venta" :nec="true" type="number" v-model="tipo_cambio.venta" />

            <JdButton icon="fa-solid fa-plus" text="Agregar" tipo="2" @click="crear()"
                v-if="useAuth.verifyPermiso('vTipoCambios:crear') && tipo_cambio.id == null" />

            <JdButton icon="fa-solid fa-pen-to-square" text="Actualizar" tipo="2" @click="editar()"
                v-if="useAuth.verifyPermiso('vTipoCambios:editar') && tipo_cambio.id != null" />
        </div>

        <JdTable :columns="columns" :datos="modal.tipo_cambios || []" maxHeight="30rem" :reload="loadTipoCambios"
            :colAct="true" :rowOptions="tableRowOptions" @rowOptionSelected="runMethod">
        </JdTable>
    </JdModal>
</template>

<script>
import { JdModal, JdInput, JdTable, JdButton } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, post, patch, delet } from '@/utils/crud'
import { incompleteData } from '@/utils/mine'
import { jmsg, jqst } from '@/utils/swal'
import dayjs from 'dayjs'

export default {
    components: {
        JdModal,
        JdInput,
        JdTable,
        JdButton,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},
        tipo_cambio: {},

        // buttons: [
        //     { text: 'Grabar', action: 'crear', spin: false },
        //     { text: 'Actualizar', action: 'modificar', spin: false },
        // ],

        columns: [
            {
                id: 'fecha',
                title: 'Fecha',
                format: 'date',
                width: '8rem',
                show: true,
                seek: true,
            },
            {
                id: 'compra',
                title: 'Compra',
                width: '8rem',
                show: true,
                seek: true,
            },
            {
                id: 'venta',
                title: 'Venta',
                width: '8rem',
                show: true,
                seek: true,
            },
        ],
        tableRowOptions: [
            { id: 1, label: 'Editar', icon: 'fa-solid fa-pen-to-square', action: 'edit', permiso: 'vTipoCambios:editar' },
            { id: 2, label: 'Eliminar', icon: 'fa-solid fa-trash-can', action: 'eliminar', permiso: 'vTipoCambios:eliminar', ocultar: { estado: 2 } },
        ],
    }),
    created() {
        this.modal = this.useModals.mTipoCambios

        this.initTipoCambio()
        this.loadTipoCambios()
    },
    methods: {
        initTipoCambio() {
            this.tipo_cambio = {
                fecha: dayjs().format('YYYY-MM-DD'),
            }
        },
        async loadTipoCambios() {
            const qry = {
                fltr: {},
                cols: ['fecha', 'compra', 'venta', 'moneda']
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.tipo_cambios}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.tipo_cambios = res.data
        },

        checkDatos() {
            const props = ['fecha', 'compra', 'venta']

            if (incompleteData(this.tipo_cambio, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        async crear() {
            if (this.checkDatos()) return

            this.tipo_cambio.moneda = this.modal.moneda.id

            this.useAuth.setLoading(true, 'Creando...')
            const res = await post(urls.tipo_cambios, this.tipo_cambio)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.tipo_cambios.unshift(res.data)
            this.initTipoCambio()
        },
        async editar() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Actualizando...')
            const res = await patch(urls.tipo_cambios, this.tipo_cambio)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.tipo_cambios.splice(this.tipo_cambio.i, 1, this.tipo_cambio)
            this.initTipoCambio()
        },

        runMethod(method, item) {
            this[method](item)
        },
        edit(item) {
            this.tipo_cambio = JSON.parse(JSON.stringify(item))
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.tipo_cambios, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.tipo_cambios = this.modal.tipo_cambios.filter(a => a.id != item.id)
        },
    }
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: 15rem 15rem;
    gap: 0.5rem;
    margin-bottom: 2rem;
}
</style>