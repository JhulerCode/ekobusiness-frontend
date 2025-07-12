<template>
    <JdModal modal="mConfigCols" :buttons="buttons" @button-click="(action) => this[action]()">
        <JdTable :columns="columns" :datos="modal.cols1.sort((a, b) => a.orden - b.orden) || []" :seeker="false" :download="false">
            <template v-slot:cOrden="{ item }">
                <div class="acts">
                    <JdButton icon="fa-solid fa-angle-down" :small="true" tipo="2" @click="upDown(item, 1)"
                        v-if="item.orden < modal.cols1.length - 1" />

                    <span v-else></span>

                    <JdButton icon="fa-solid fa-angle-up" :small="true" tipo="2" @click="upDown(item, 2)"
                        v-if="item.orden > 0" />
                </div>
            </template>

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
import JdModal from '@/components/JdModal.vue'
import JdTable from '@/components/JdTable.vue'
import JdCheckBox from '@/components/inputs/JdCheckBox.vue'
import JdButton from './inputs/JdButton.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'

import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdTable,
        JdCheckBox,
        JdButton,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),

        modal: null,

        columns: [
            // {
            //     id: 'orden',
            //     title: 'Orden',
            //     slot: 'cOrden',
            //     width: '5rem',
            //     show: true
            // },
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
            {
                title: 'Buscar',
                slot: 'cSeek',
                width: '6rem',
                show: true,
            },
            {
                title: 'Ordenar',
                slot: 'cSort',
                width: '6rem',
                show: true,
            },
            {
                id: 'orden',
                title: 'Orden',
                slot: 'cOrden',
                width: '5rem',
                show: true
            },
        ],

        buttons: [
            { text: 'Grabar', action: 'grabar', show: true },
        ],
    }),
    computed: {
        // cols1Ordenado() {
        //     const cols = [...this.modal.cols1]
        //     return cols.sort((a, b) => a.orden - b.orden)
        // }
    },
    created() {
        this.modal = this.useModals.mConfigCols
        this.modal.cols1 = JSON.parse(JSON.stringify(this.modal.cols))
        this.setOrden()
    },
    methods: {
        showChanged(item) {
            if (item.show == false) {
                item.seek = false
                item.sort = false
            }
        },
        checkDatos() {
            if (this.modal.cols1.every(a => a.show == false)) {
                jmsg('warning', 'Seleccione al menos una columna para mostrar')
                return true
            }

            return false
        },
        async grabar() {
            if (this.checkDatos()) return

            //----- ASIGNAR A COLS ORIGINIAL ----- //
            const cols1Map = this.modal.cols1.reduce((obj, a) => (obj[a.id] = a, obj), {})

            for (const a of this.modal.cols) {
                Object.assign(a, cols1Map[a.id])
            }

            //----- GUARDAR LAS COLUMNAS EN PINIA ----- //
            this.useAuth.saveTableColumns(this.modal.table, this.modal.cols1)

            this.modal.reload()
            this.useModals.show.mConfigCols = false
        },

        setOrden() {
            if (this.modal.cols1[0].orden >= 0) return

            for (let i = 0; i < this.modal.cols1.length; i++) {
                this.modal.cols1[i].orden = i
            }
        },
        async upDown(item, k) {
            const i = this.modal.cols1.findIndex(a => a.id == item.id)

            const o = k == 1 ? item.orden + 1 : item.orden - 1
            const j = k == 1 ? i + 1 : i - 1

            const peer = this.modal.cols1[j]

            peer.orden = item.orden
            item.orden = o
        },
    },
}
</script>

<style lang="scss" scoped>
.acts {
    display: grid;
    grid-template-columns: 1.75rem 1.75rem;
    gap: 0.5rem;
}
</style>