<template>
    <div class="container-datos">
        <JdTable
            :columns="modal.columns_componentes"
            :datos="modal.articulo.combo_componentes || []"
            :colAct="true"
            :seeker="false"
            :download="false"
            :showResumen="false"
            :agregarFila="addComponente"
            style="grid-column: 1/3"
        >
            <template v-slot:cAction="{ item }">
                <JdButton
                    tipo="2"
                    :small="true"
                    icon="fa-solid fa-trash-can"
                    title="Eliminar"
                    @click="removeComponente(item)"
                />
            </template>
        </JdTable>
    </div>
</template>

<script>
import { JdButton, JdTable } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get } from '@/utils/crud'
import { genCorrelativo } from '@/utils/mine'

export default {
    components: {
        JdTable,
        JdButton,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},
    }),
    created() {
        this.modal = this.useModals.mArticulo
        this.setColums()

        if (this.modal.mode != 1 && !this.modal.articulo_componentes_loaded) {
            this.loadArticuloComponentes()
        }
    },
    methods: {
        setColums() {
            this.modal.columns_componentes = [
                {
                    id: 'articulo',
                    title: 'Artículo',
                    width: '30rem',
                    input: true,
                    select_query: {
                        mostrar: 'nombre',
                        search: this.loadArticulos,
                    },
                    show: true,
                },
                {
                    id: 'cantidad',
                    title: 'Cantidad',
                    type: 'number',
                    input: true,
                    width: '6rem',
                    show: true,
                },
            ]
        },

        async loadArticuloComponentes() {
            this.modal.articulo_componentes_loaded = true
            this.modal.articulo.combo_componentes = []

            const qry = {
                fltr: {
                    articulo_principal: { op: 'Es', val: this.modal.articulo.id },
                },
                cols: { exclude: [] },
                incl: ['articulo1'],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.combo_componentes}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            for (const a of res.data) {
                a.table_columns = {
                    articulo_lista: [{ ...a.articulo1 }],
                }
            }

            this.modal.articulo.combo_componentes = res.data
        },
        async loadArticulos(txtBuscar, fila, column) {
            if (!txtBuscar) {
                fila.table_columns[column.id + '_lista'].length = 0
                return
            }

            const qry = {
                fltr: {
                    type: { op: 'Es', val: 'consumable' },
                    activo: { op: 'Es', val: true },
                    nombre: { op: 'Contiene', val: txtBuscar },
                },
                cols: ['nombre'],
                ordr: [['nombre', 'ASC']],
            }

            fila.table_columns[column.id + '_spin'] = true
            const res = await get(`${urls.articulos}?qry=${JSON.stringify(qry)}`)
            fila.table_columns[column.id + '_spin'] = false

            if (res.code !== 0) return

            fila.table_columns[column.id + '_lista'] = res.data
        },

        async addComponente() {
            this.modal.articulo.combo_componentes.push({
                table_columns: {},
                id: crypto.randomUUID(),
                orden: genCorrelativo(this.modal.articulo.combo_componentes),
            })
        },
        async removeComponente(item) {
            const i = this.modal.articulo.combo_componentes.findIndex((a) => a.id == item.id)
            this.modal.articulo.combo_componentes.splice(i, 1)
        },
    },
}
</script>
