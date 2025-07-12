<template>
    <JdModal modal="mConfigFiltros" :buttons="buttons" @button-click="(action) => this[action]()">
        <JdTable :columns="columns" :datos="modal.cols1.sort((a, b) => a.orden - b.orden) || []" :seeker="false"
            :download="false">

            <template v-slot:cOperacion="{ item }">
                <JdSelect :lista="operaciones[item.type]" id="op" mostrar="op" v-model="item.op"
                    @elegir="(a) => elegir(a, item)" />
            </template>

            <template v-slot:cValor="{ item }">
                <JdInput v-model="item.val"
                    v-if="item.type == 'text' && operaciones[item.type].find(a => a.op == item.op)?.show" />

                <JdInput type="number" v-model="item.val"
                    v-if="item.type == 'number' && operaciones[item.type].find(a => a.op == item.op)?.show" />

                <JdSelect :lista="item.lista" :mostrar="item.mostrar || 'nombre'" v-model="item.val"
                    v-if="item.type == 'select' && operaciones[item.type].find(a => a.op == item.op)?.show" />

                <div>
                    <JdInput type="date" v-model="item.val"
                        v-if="item.type === 'date' && operaciones[item.type].find(a => a.op == item.op)?.show" />

                    <JdInput type="date" v-model="item.val1"
                        v-if="item.type === 'date' && operaciones[item.type].find(a => a.op == item.op)?.show1" />
                </div>
            </template>
        </JdTable>
    </JdModal>
</template>

<script>
import JdModal from '@/components/JdModal.vue'
import JdInput from '@/components/inputs/JdInput.vue'
import JdSelect from '@/components/inputs/JdSelect.vue'
import JdTable from '@/components/JdTable.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'

import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdInput,
        JdSelect,
        JdTable,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),

        modal: null,

        operaciones: {
            text: [
                { op: 'Es', show: true },
                { op: 'No es', show: true },
                { op: 'Contiene', show: true },
                { op: 'No contiene', show: true },
                { op: 'Empieza con', show: true },
                { op: 'Termina con', show: true },
                { op: 'Está vacío', show: false },
                { op: 'No está vacío', show: false },
            ],
            number: [
                { op: '=', show: true },
                { op: '!=', show: true },
                { op: '>', show: true },
                { op: '<', show: true },
                { op: '>=', show: true },
                { op: '<=', show: true },
                { op: 'Está vacío', show: false },
                { op: 'No está vacío', show: false },
            ],
            select: [
                { op: 'Es', show: true },
                { op: 'No es', show: true },
                { op: 'Está vacío', show: false },
                { op: 'No está vacío', show: false },
            ],
            date: [
                { op: 'Es', show: true },
                { op: 'Es anterior a', show: true },
                { op: 'Es posterior a', show: true },
                { op: 'Es igual o anterior a', show: true },
                { op: 'Es igual o posterior a', show: true },
                { op: 'Está dentro de', show: true, show1: true },
                { op: 'Está vacío', show: false },
                { op: 'No está vacío', show: false },
            ]
        },

        columns: [
            {
                id: 'title',
                title: 'Propiedad',
                show: true,
                width: '10rem'
            },
            {
                id: 'op',
                title: 'Operación',
                slot: 'cOperacion',
                show: true,
                width: '10rem'
            },
            {
                id: 'val',
                title: 'Valor',
                slot: 'cValor',
                show: true,
                width: '12rem'
            },
        ],

        buttons: [
            { text: 'Limpiar', action: 'limpiar', tipo: 2, show: true },
            { text: 'Buscar', action: 'grabar', show: true },
        ],
    }),
    created() {
        this.modal = this.useModals.mConfigFiltros
        this.modal.cols1 = JSON.parse(JSON.stringify(this.modal.cols))
    },
    methods: {
        elegir(sel, item) {
            if (sel == null) {
                item.val = null
                item.val1 = null
            }

            if (this.operaciones[item.type].find(a => a.op == item.op)?.show == false) {
                item.val = null
                item.val1 = null
            }
        },
        limpiar() {
            for (const a of this.modal.cols1) {
                a.op = null
                a.val = null
                a.val1 = null
            }
        },
        checkDatos() {
            for (const a of this.modal.cols1) {
                if (this.operaciones[a.type] == null) continue
                const currentOp = this.operaciones[a.type].find(b => b.op == a.op)

                if (currentOp && currentOp.show) {
                    if (a.val === null || a.val === undefined || a.val === '') {
                        jmsg('error', `El valor no puede estar vacío en ${a.title}`)
                        return true
                    }
                }

                if (currentOp && currentOp.show1) {
                    if (a.val1 === null || a.val1 === undefined || a.val1 === '') {
                        jmsg('error', `El valor no puede estar vacío en ${a.title}`)
                        return true
                    }
                }
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

            // this.$emit('updated')
            this.modal.reload()
            this.useModals.show.mConfigFiltros = false
        },
    },
}
</script>

<style lang="scss" scoped></style>