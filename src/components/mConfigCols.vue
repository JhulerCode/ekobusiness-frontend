<template>
    <JdModal modal="mConfigCols" :buttons="buttons" @button-click="(action) => this[action]()">
        <JdTable
            :columns="columns"
            :datos="modal.cols1 || []"
            :seeker="false"
            :download="false"
            :rowReorderable="true"
        >
            <template v-slot:cShow="{ item }">
                <JdCheckBox v-model="item.show" @change="showChanged(item)" />
            </template>

            <template v-slot:cSeek="{ item }">
                <JdCheckBox v-model="item.seek" v-if="item.show" />
            </template>

            <template v-slot:cSort="{ item }">
                <JdCheckBox v-model="item.sort" v-if="item.show" />
            </template>
        </JdTable>
    </JdModal>
</template>

<script>
import { JdModal, JdCheckBox } from '@jhuler/components'
import JdTable from '@/components/JdTable/JdTable.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'

import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdTable,
        JdCheckBox,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),

        modal: null,

        columns: [
            {
                title: 'Nombre',
                prop: 'title',
                width: '10rem',
                show: true,
            },
            {
                title: 'Mostrar',
                slot: 'cShow',
                width: '6rem',
                show: true,
            },
        ],

        buttons: [{ text: 'Grabar', action: 'grabar', show: true }],
    }),
    created() {
        this.modal = this.useModals.mConfigCols
        this.modal.cols1 = JSON.parse(JSON.stringify(this.modal.cols))
        if (this.modal.cols1.length && this.modal.cols1[0].orden === undefined) {
            this.modal.cols1.forEach((c, i) => (c.orden = i + 1))
        }
        this.modal.cols1.sort((a, b) => (a.orden || 0) - (b.orden || 0))
    },
    methods: {
        showChanged(item) {
            if (item.show == false) {
                item.seek = false
                item.sort = false
            }
        },
        checkDatos() {
            if (this.modal.cols1.every((a) => a.show == false)) {
                jmsg('warning', 'Seleccione al menos una columna para mostrar')
                return true
            }

            return false
        },
        async grabar() {
            if (this.checkDatos()) return

            // --- ASIGNAR A COLS ORIGINIAL --- //
            const cols1Map = this.modal.cols1.reduce((obj, a) => ((obj[a.id] = a), obj), {})

            for (const a of this.modal.cols) {
                Object.assign(a, cols1Map[a.id])
            }
            this.modal.cols.sort((a, b) => (a.orden || 0) - (b.orden || 0))

            // --- GUARDAR LAS COLUMNAS EN PINIA --- //
            this.useAuth.saveTableColumns(this.modal.table, this.modal.cols1)

            this.modal.reload()
            this.useModals.show.mConfigCols = false
        },
    },
}
</script>
