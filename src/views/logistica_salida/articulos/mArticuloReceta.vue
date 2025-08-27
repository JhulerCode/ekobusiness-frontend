<template>
    <JdModal modal="mArticuloReceta">
        <div class="agregar" v-if="useAuth.verifyPermiso('vReceta:crear')">
            <JdSelectQuery
                label="Artículo"
                :nec="true"
                v-model="nuevo.articulo"
                :spin="spinArticulos"
                :lista="articulos"
                @search="searchArticulos"
                @elegir="setArticulo"
                style="grid-column: 1/5"
            />

            <JdInput
                type="number"
                label="Cantidad"
                :nec="true"
                v-model="nuevo.cantidad"
                style="grid-column: 1/3"
            />

            <JdButton text="Agregar" @click="crear" />
        </div>

        <JdTable
            :columns="columns"
            :datos="receta.receta_insumos || []"
            :seeker="false"
            :download="false"
            :colAct="true"
            :reload="loadReceta"
            class="jd-table"
            height="25rem"
            @onChange="(action, a) => this[action](a)"
            :inputsDisabled="!this.useAuth.verifyPermiso('vReceta:editar')"
        >
            <template v-slot:cAction="{ item }">
                <JdButton
                    :small="true"
                    tipo="2"
                    icon="fa-solid fa-trash-can"
                    title="Eliminar"
                    @click="quitar(item)"
                    v-if="this.useAuth.verifyPermiso('vReceta:eliminar')"
                />
            </template>

            <template v-slot:cOrden="{ item }">
                <div class="acts">
                    <JdButton
                        icon="fa-solid fa-angle-down"
                        :small="true"
                        tipo="2"
                        @click="upDown(item, 1)"
                        v-if="
                            receta.receta_insumos.findIndex((a) => a.id == item.id) !=
                            receta.receta_insumos.length - 1
                        "
                    />

                    <span v-else></span>

                    <JdButton
                        icon="fa-solid fa-angle-up"
                        :small="true"
                        tipo="2"
                        @click="upDown(item, 2)"
                        v-if="receta.receta_insumos.findIndex((a) => a.id == item.id) != 0"
                    />
                </div>
            </template>
        </JdTable>
    </JdModal>
</template>

<script>
import JdModal from '@/components/JdModal.vue'
import JdSelectQuery from '@/components/inputs/JdSelectQuery.vue'
import JdInput from '@/components/inputs/JdInput.vue'
import JdButton from '@/components/inputs/JdButton.vue'
import JdTable from '@/components/JdTable.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, post, patch, delet } from '@/utils/crud'
import { getItemFromArray } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdSelectQuery,
        JdInput,
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
        articulos: [],
        spinArticulos: false,

        columns: [
            {
                id: 'orden',
                title: 'Ordenar',
                slot: 'cOrden',
                width: '5rem',
                show: true,
            },
            {
                id: 'articulo',
                title: 'Artículo',
                prop: 'articulo1.nombre',
                width: '25rem',
                show: true,
            },
            {
                id: 'unidad',
                title: 'Unidad',
                prop: 'articulo1.unidad',
                width: '5rem',
                show: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                toRight: true,
                input: true,
                type: 'number',
                onchange: 'modificar',
                width: '6rem',
                show: true,
            },
        ],
    }),
    created() {
        this.modal = this.useModals.mArticuloReceta
        this.receta = this.useModals.mArticuloReceta.item

        if (this.useAuth.verifyPermiso('vReceta:editar') == false) this.columns[0].show = false

        this.loadReceta()
    },
    methods: {
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
                },
            }

            this.spinArticulos = true
            const res = await get(`${urls.articulos}?qry=${JSON.stringify(qry)}`)
            this.spinArticulos = false

            if (res.code !== 0) return

            this.articulos = JSON.parse(JSON.stringify(res.data))
        },
        setArticulo(a) {
            if (a == null) {
                this.nuevo = {}
            } else {
                this.nuevo.nombre = a.nombre
                this.nuevo.unidad = a.unidad
            }
        },
        async crear() {
            if (this.nuevo.articulo == null || this.nuevo.cantidad == null)
                return jmsg('warning', 'Selecciona un artículo e ingrese la cantidad')

            const i = this.receta.receta_insumos.findIndex((a) => a.articulo == this.nuevo.articulo)
            if (i !== -1) return jmsg('warning', 'El artículo ya está agregado')

            this.useAuth.setLoading(true, 'Agregando...')
            const res = await post(urls.receta_insumos, {
                ...this.nuevo,
                articulo_principal: this.receta.id,
                orden: this.receta.receta_insumos.length + 1,
            })
            this.useAuth.setLoading(false)

            if (res.code !== 0) return

            this.receta.receta_insumos.push(res.data)

            this.nuevo = {}
        },
        async quitar(item) {
            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.receta_insumos, item)
            this.useAuth.setLoading(false)

            if (res.code !== 0) return

            const i = this.receta.receta_insumos.findIndex((a) => a.articulo == item.articulo)
            this.receta.receta_insumos.splice(i, 1)
        },
        async modificar(item) {
            this.useAuth.setLoading(true, 'Modificando...')
            const res = await patch(urls.receta_insumos, item, false)
            this.useAuth.setLoading(false)

            if (res.code != 0) return false

            return true
        },
        async upDown(item, k) {
            const i = this.receta.receta_insumos.findIndex((a) => a.id == item.id)

            const o = k == 1 ? item.orden + 1 : item.orden - 1
            const j = k == 1 ? i + 1 : i - 1

            const peer = this.receta.receta_insumos[j]

            await this.modificar({ ...item, orden: o })
            await this.modificar({ ...peer, orden: item.orden })
            // if (res == false) return

            peer.orden = item.orden
            item.orden = o

            this.receta.receta_insumos.sort((a, b) => a.orden - b.orden)
        },

        async loadReceta() {
            const qry = {
                fltr: {
                    articulo_principal: { op: 'Es', val: this.receta.id },
                },
                cols: ['articulo', 'cantidad', 'orden'],
                incl: ['articulo1'],
            }

            this.receta.receta_insumos = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.receta_insumos}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false, '')

            if (res.code != 0) return

            this.receta.receta_insumos = res.data
        },
    },
}
</script>

<style lang="scss" scoped>
.agregar {
    display: grid;
    grid-template-columns: repeat(4, 10rem);
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.jd-table {
    .acts {
        display: grid;
        grid-template-columns: 1.75rem 1.75rem;
        gap: 0.5rem;
    }
}
</style>
