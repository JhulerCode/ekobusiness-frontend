<template>
    <JdModal modal="mConfigFiltros" :buttons="buttons" @button-click="(action) => this[action]()">
        <JdTable
            :columns="columns"
            :datos="modal.cols1.sort((a, b) => a.orden - b.orden) || []"
            :seeker="false"
            :download="false"
        >
            <template v-slot:cOperacion="{ item }">
                <JdSelect
                    :lista="operaciones[item.type]"
                    id="op"
                    mostrar="op"
                    v-model="item.op"
                    @elegir="(a) => elegir(a, item)"
                />
            </template>

            <template v-slot:cValor="{ item }">
                <JdInput
                    v-model="item.val"
                    v-if="
                        item.type == 'text' &&
                        operaciones[item.type].find((a) => a.op == item.op)?.show
                    "
                />

                <JdInput
                    type="number"
                    v-model="item.val"
                    v-if="
                        item.type == 'number' &&
                        operaciones[item.type].find((a) => a.op == item.op)?.show
                    "
                />

                <JdSelect
                    :lista="item.lista || []"
                    :mostrar="item.mostrar || 'nombre'"
                    v-model="item.val"
                    @elegir="(a) => elegir(a, item)"
                    v-if="
                        item.type == 'select' &&
                        operaciones[item.type].find((a) => a.op == item.op)?.show
                    "
                />

                <JdSelectQuery
                    :lista="item.lista || []"
                    :mostrar="item.mostrar || 'nombre'"
                    :spin="item.loading"
                    v-model="item.val"
                    @search="(txt) => handleRelationalSearch(txt, item)"
                    @elegir="(a) => elegir(a, item)"
                    v-if="
                        item.type == 'related' &&
                        operaciones[item.type].find((a) => a.op == item.op)?.show
                    "
                />

                <div v-if="item.type === 'date'" class="tipo-date">
                    <JdInput
                        type="date"
                        v-model="item.val"
                        v-if="operaciones[item.type].find((a) => a.op == item.op)?.show"
                    />

                    <JdInput
                        type="date"
                        v-model="item.val1"
                        v-if="operaciones[item.type].find((a) => a.op == item.op)?.show1"
                    />
                </div>

                <div v-if="item.type === 'datetime'">
                    <JdInput
                        type="datetime-local"
                        v-model="item.val"
                        v-if="operaciones[item.type].find((a) => a.op == item.op)?.show"
                    />

                    <JdInput
                        type="datetime-local"
                        v-model="item.val1"
                        v-if="operaciones[item.type].find((a) => a.op == item.op)?.show1"
                    />
                </div>
            </template>
        </JdTable>
    </JdModal>
</template>

<script>
import { JdModal, JdTable, JdInput, JdSelect } from '@jhuler/components'
import JdSelectQuery from '@/components/inputs/JdSelectQuery.vue'

import { useAuth } from '@/pinia/auth'
import { useSystem } from '@/pinia/system'
import { useModals } from '@/pinia/modals'
import { urls, get } from '@/utils/crud'

import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdInput,
        JdSelect,
        JdTable,
        JdSelectQuery,
    },
    data: () => ({
        useAuth: useAuth(),
        useSystem: useSystem(),
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
            date: [
                { op: 'Es', show: true },
                { op: 'Es anterior a', show: true },
                { op: 'Es posterior a', show: true },
                { op: 'Es igual o anterior a', show: true },
                { op: 'Es igual o posterior a', show: true },
                { op: 'Está dentro de', show: true, show1: true },
                { op: 'Está vacío', show: false },
                { op: 'No está vacío', show: false },
            ],
            datetime: [
                { op: 'Es', show: true },
                { op: 'Es anterior a', show: true },
                { op: 'Es posterior a', show: true },
                { op: 'Es igual o anterior a', show: true },
                { op: 'Es igual o posterior a', show: true },
                { op: 'Está dentro de', show: true, show1: true },
                { op: 'Está vacío', show: false },
                { op: 'No está vacío', show: false },
            ],
            select: [
                { op: 'Es', show: true },
                { op: 'No es', show: true },
                { op: 'Está vacío', show: false },
                { op: 'No está vacío', show: false },
            ],
            related: [
                { op: 'Es', show: true },
                { op: 'No es', show: true },
                { op: 'Está vacío', show: false },
                { op: 'No está vacío', show: false },
            ],
        },

        columns: [
            {
                id: 'title',
                title: 'Propiedad',
                show: true,
                width: '10rem',
            },
            {
                id: 'op',
                title: 'Operación',
                slot: 'cOperacion',
                show: true,
                width: '12rem',
            },
            {
                id: 'val',
                title: 'Valor',
                slot: 'cValor',
                show: true,
                width: '20rem',
            },
        ],

        buttons: [
            { text: 'Limpiar', action: 'limpiar', tipo: 2, show: true },
            { text: 'Buscar', action: 'grabar', show: true },
        ],
    }),
    computed: {
        colsMap() {
            return this.modal.cols.reduce((obj, a) => ((obj[a.id] = a), obj), {})
        },
    },
    async created() {
        this.modal = this.useModals.mConfigFiltros
        this.modal.cols1 = JSON.parse(
            JSON.stringify(this.modal.cols.filter((a) => a.filtrable != false)),
        )

        for (const a of this.modal.cols1) {
            // Inicializar props reactivas
            a.loading = false
            a.fullLista = null
            if (!a.lista) a.lista = []

            // Si tiene systemKey, la traemos del store de sistema
            if (a.systemKey) {
                // Asegurarnos que esté cargado en el store
                const currentData = this.useSystem.get(a.systemKey)
                if (currentData.length === 0) {
                    await this.useSystem.load([a.systemKey])
                }
                a.lista = this.useSystem.get(a.systemKey)
            }



            // Si ya tiene un valor (ej: recarga) y es relacional, cargamos ese registro específico para mostrar el texto
            if (a.val && a.relatedUrl && (a.type === 'related' || a.type === 'select')) {
                this.loadSpecificItem(a)
            }
        }
    },
    methods: {
        elegir(sel, item) {
            if (sel == null) {
                item.val = null
                item.val1 = null
                item.valLabel = null
            } else if (item.type === 'related' || item.type === 'select') {
                // Guardar la etiqueta descriptiva para el buscador (chips)
                item.valLabel = sel[item.mostrar || 'nombre']
            }

            if (this.operaciones[item.type].find((a) => a.op == item.op)?.show == false) {
                item.val = null
                item.val1 = null
            }
        },
        limpiar() {
            for (const a of this.modal.cols1) {
                a.op = null
                a.val = null
                a.val1 = null
                a.valLabel = null
            }
        },
        checkDatos() {
            for (const a of this.modal.cols1) {
                if (this.operaciones[a.type] == null) continue
                const currentOp = this.operaciones[a.type].find((b) => b.op == a.op)

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

            // --- ASIGNAR A COLS ORIGINIAL --- //
            const cols1Map = this.modal.cols1.reduce((obj, a) => ((obj[a.id] = a), obj), {})

            for (const a of this.modal.cols) {
                Object.assign(a, cols1Map[a.id])
            }

            // --- GUARDAR LAS COLUMNAS EN PINIA --- //
            this.useAuth.saveTableColumns(this.modal.table, this.modal.cols1)

            this.modal.reload(true)
            this.useModals.show.mConfigFiltros = false
        },
        async loadSpecificItem(item) {
            const url = urls[item.relatedUrl] || item.relatedUrl
            if (!url) return

            item.loading = true
            const qry = {
                fltr: { id: { op: 'Es', val: item.val } },
                cols: [item.mostrar || 'nombre'],
            }
            const res = await get(`${url}?qry=${JSON.stringify(qry)}`)
            item.loading = false

            if (res.code == 0 && res.data[0]) {
                item.lista.push(res.data[0])
                item.valLabel = res.data[0][item.mostrar || 'nombre']
            }
        },

        async handleRelationalSearch(txt, item) {
            const url = urls[item.relatedUrl] || item.relatedUrl

            // 1. Búsqueda local (para systemKey o listas ya cargadas)
            if (!url) {
                if (!item.fullLista) item.fullLista = [...(item.lista || [])]

                const search = (txt || '').toLowerCase()
                item.lista = item.fullLista.filter((l) =>
                    String(l[item.mostrar || 'nombre'])
                        .toLowerCase()
                        .includes(search),
                )
                return
            }

            // 2. Búsqueda remota (para JdSelectQuery / related)
            item.loading = true
            const qry = {
                cols: [item.mostrar || 'nombre'],
                fltr: {},
                ordr: [[item.mostrar || 'nombre', 'ASC']],
                limit: 25,
            }

            if (txt) {
                qry.fltr[item.mostrar || 'nombre'] = { op: 'Contiene', val: txt }
            }

            const res = await get(`${url}?qry=${JSON.stringify(qry)}`)
            item.loading = false

            if (res.code == 0) {
                item.lista = res.data
            }
        },
    },
}
</script>

<style lang="scss" scoped>
.tipo-date {
    display: flex;
    gap: 0.5rem;
}
</style>
