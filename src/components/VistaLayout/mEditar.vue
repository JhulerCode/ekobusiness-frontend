<template>
    <JdModal modal="mEditar" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <div>
                <p>Propiedad para actualizar</p>
                <JdSelect
                    v-model="modal.nuevo.prop"
                    :lista="modal.cols1"
                    mostrar="title"
                    @elegir="setAtributo"
                />
            </div>

            <div v-if="modal.elegido?.id">
                <p>Valor</p>

                <JdInput v-model="modal.nuevo.val" v-if="modal.elegido.type == 'text'" />

                <JdInput
                    v-model="modal.nuevo.val"
                    type="number"
                    v-if="modal.elegido.type == 'number'"
                />

                <JdSelect
                    :lista="modal.elegido.lista || []"
                    :mostrar="modal.elegido.mostrar || 'nombre'"
                    v-model="modal.nuevo.val"
                    v-if="modal.elegido.type == 'select'"
                />

                <JdSelectQuery
                    :lista="modal.elegido.lista || []"
                    :mostrar="modal.elegido.mostrar || 'nombre'"
                    :spin="modal.elegido.loading"
                    v-model="modal.nuevo.val"
                    @search="(txt) => handleRelationalSearch(txt, modal.elegido)"
                    v-if="modal.elegido.type == 'related'"
                />

                <JdSwitch v-model="modal.nuevo.val" v-if="modal.elegido.type == 'boolean'" />
            </div>
        </div>
    </JdModal>
</template>

<script>
import { JdModal, JdInput, JdSelect, JdSwitch } from '@jhuler/components'

import JdSelectQuery from '@/components/inputs/JdSelectQuery.vue'

import { useModals } from '@/pinia/modals'
import { useAuth } from '@/pinia/auth'
import { useSystem } from '@/pinia/system'

import { urls, get, patch } from '@/utils/crud'
import { incompleteData } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdInput,
        JdSelect,
        JdSwitch,
        JdSelectQuery,
    },
    data: () => ({
        useAuth: useAuth(),
        useSystem: useSystem(),
        useModals: useModals(),

        buttons: [{ text: 'Actualizar', action: 'modificar', show: true }],
    }),
    computed: {
        colsMap() {
            return this.modal.cols.reduce((obj, a) => ((obj[a.id] = a), obj), {})
        },
    },
    async created() {
        this.modal = this.useModals.mEditar
        this.modal.cols1 = JSON.parse(
            JSON.stringify(this.modal.cols.filter((a) => a.editable == true)),
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
        }
    },
    methods: {
        setAtributo(item) {
            // this.modal.elegido = this.modal.cols1.find((a) => a.id == item.id)
            this.modal.elegido = item
            this.modal.nuevo.val = null
        },
        checkDatos() {
            const props = ['prop', 'val']

            if (incompleteData(this.modal.nuevo, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        shapeDatos() {
            this.modal.nuevo.id = 'bulk'
            this.modal.nuevo.ids = this.modal.ids

            if (this.modal.elegido.lista) {
                this.modal.nuevo.val1 = this.modal.elegido.lista.find(
                    (a) => a.id == this.modal.nuevo.val,
                )
            }
        },
        async modificar() {
            if (this.checkDatos()) return
            this.shapeDatos()

            this.useAuth.setLoading(true, 'Actualizando...')
            const res = await patch(`${urls[this.modal.uri]}/bulk`, this.modal.nuevo)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.$emit('updated', this.modal.nuevo)
            this.useModals.show.mEditar = false
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
.container-datos {
    display: grid;
    grid-template-columns: 20rem;
    gap: 1rem;

    p {
        margin-bottom: 0.5rem;
    }
}
</style>
