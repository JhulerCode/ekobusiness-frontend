<template>
    <JdModal modal="mPrecioListaItems">
        <div>
            <div class="container-datos" v-if="this.useAuth.verifyPermiso('vPrecioListaItems_crear')">
                <JdSelectQuery label="Artículo" v-model="nuevo.articulo" :spin="spinArticulos" :lista="articulos"
                    @search="searchArticulos" style="grid-column: 1/5" />

                <JdInput label="Precio" type="number" :nec="true" v-model="nuevo.precio" style="grid-column: 1/3" />

                <JdButton text="Agregar" @click="crear()" />
            </div>

            <JdTable :columns="columns" :datos="modal.precio_lista_items || []" maxHeight="29rem" :colAct="true"
                :reload="loadPrecioListaItems" @onChange="(action, a) => this[action](a)"
                :inputsDisabled="!this.useAuth.verifyPermiso('vPrecioListaItems_editar')">

                <template v-slot:cAction="{ item }">
                    <JdButton icon="fa-solid fa-trash-can" title="Eliminar" tipo="2" :small="true"
                        @click="eliminar(item)" v-if="this.useAuth.verifyPermiso('vPrecioListaItems_eliminar')" />
                </template>
            </JdTable>
        </div>
    </JdModal>
</template>

<script>
import JdModal from '@/components/JdModal.vue'
import JdInput from '@/components/inputs/JdInput.vue'
import JdSelectQuery from '@/components/inputs/JdSelectQuery.vue'
import JdButton from '@/components/inputs/JdButton.vue'
import JdTable from '@/components/JdTable.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, post, patch, delet } from '@/utils/crud'
import { incompleteData, getItemFromArray } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdInput,
        JdSelectQuery,
        JdButton,
        JdTable,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),
        getItemFromArray,

        modal: {},
        nuevo: {},
        spinArticulos: false,
        articulos: [],

        columns: [
            {
                id: 'articulo',
                title: 'Artículo',
                prop: 'articulo1.nombre',
                width: '25rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'unidad',
                title: 'Unidad',
                prop: 'articulo1.unidad',
                width: '5rem',
                show: true,
                seek: false,
                sort: true,
            },
            {
                id: 'precio',
                title: 'Precio',
                prop: 'precio',
                input: true,
                type: 'number',
                onchange: 'modificar',
                width: '10rem',
                show: true,
            },
        ],
    }),
    created() {
        this.modal = this.useModals.mPrecioListaItems
        this.loadPrecioListaItems()
    },
    methods: {
        async loadPrecioListaItems() {
            const qry = {
                fltr: { precio_lista: { op: 'Es', val: this.modal.precio_lista } },
                cols: ['articulo', 'precio']
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.precio_lista_items}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code !== 0) return

            this.modal.precio_lista_items = res.data
        },

        checkDatos(item) {
            if (incompleteData(item, ['articulo', 'precio'])) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        shapeDatos() {
            this.nuevo.precio_lista = this.modal.precio_lista
        },
        async crear() {
            if (this.checkDatos(this.nuevo)) return
            this.shapeDatos()

            this.useAuth.setLoading(true, 'Creando...')
            const res = await post(urls.precio_lista_items, this.nuevo)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.precio_lista_items.push(res.data)
            this.nuevo = {}
        },
        async modificar(item) {
            if (this.checkDatos(item)) return

            this.useAuth.setLoading(true, 'Modificando...')
            const res = await patch(urls.precio_lista_items, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            // const i = this.modal.precio_lista_items.findIndex(a => a.id == item.id)
            // this.modal.precio_lista_items.splice(i, 1, item)
        },
        async eliminar(item) {
            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.precio_lista_items, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const i = this.modal.precio_lista_items.findIndex(a => a.id == item.id)
            this.modal.precio_lista_items.splice(i, 1)
        },

        async searchArticulos(txtBuscar) {
            if (!txtBuscar) {
                this.articulos.length = 0
                return
            }

            const qry = {
                fltr: {
                    tipo: { op: 'Es', val: 1 },
                    activo: { op: 'Es', val: true },
                    nombre: { op: 'Contiene', val: txtBuscar },
                }
            }

            this.spinArticulos = true
            const res = await get(`${urls.articulos}?qry=${JSON.stringify(qry)}`)
            this.spinArticulos = false

            if (res.code !== 0) return

            this.articulos = JSON.parse(JSON.stringify(res.data))
        },
    }
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: repeat(4, 10rem);
    gap: 0.5rem;
    margin-bottom: 1rem;
}
</style>