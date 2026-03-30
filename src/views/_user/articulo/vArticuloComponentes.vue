<template>
    <div class="container-datos">
        <JdTable
            :columns="columns_componentes"
            :datos="vista.data.combo_componentes || []"
            :rowOptions="rowActions"
            rowOptionsMode="buttons"
            @rowOptionSelected="runMethod"
            :inputsDisabled="vista.mode == 'view'"
            :agregarFila="vista.mode == 'view' ? null : addComponente"
            style="grid-column: 1/3"
        />
    </div>
</template>

<script>
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { urls, get } from '@/utils/crud'
import { genCorrelativo } from '@/utils/mine'

export default {
    data: () => ({
        auth: useAuth(),
        vistas: useVistas(),
    }),
    computed: {
        vista() {
            return this.vistas[this.$route.name] || { data: {} }
        },
        columns_componentes() {
            return [
                {
                    id: 'articulo',
                    title: 'Artículo',
                    width: '30rem',
                    input: true,
                    select_query: {
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
        rowActions() {
            if (this.vista.mode == 'view') return []
            return [
                {
                    icon: 'fa-solid fa-trash-can',
                    title: 'Eliminar',
                    action: 'removeComponente',
                },
            ]
        },
    },
    methods: {
        runMethod(method, item) {
            this[method](item)
        },
        async loadArticuloComponentes() {
            this.vista.articulo_componentes_loaded = true
            this.vista.data.combo_componentes = []

            const qry = {
                fltr: {
                    articulo_principal: { op: 'Es', val: this.vista.data.id },
                },
                cols: { exclude: [] },
                incl: ['articulo1'],
            }

            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.combo_componentes}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)

            if (res.code != 0) return

            for (const a of res.data) {
                a.table_columns = {
                    articulo_lista: [{ ...a.articulo1 }],
                }
            }

            this.vista.data.combo_componentes = res.data
        },
        async addComponente() {
            this.vista.data.combo_componentes.push({
                id: crypto.randomUUID(),
                orden: genCorrelativo(this.vista.data.combo_componentes),
            })
        },
        async removeComponente(item) {
            const i = this.vista.data.combo_componentes.findIndex((a) => a.id == item.id)
            this.vista.data.combo_componentes.splice(i, 1)
        },

        // --- Datos auxiliares ---
        async loadArticulos(txtBuscar) {
            const qry = {
                fltr: {
                    type: { op: 'Es', val: 'consumable' },
                    activo: { op: 'Es', val: true },
                },
                cols: ['nombre'],
                ordr: [['nombre', 'ASC']],
                limt: 25,
            }

            if (txtBuscar) {
                qry.fltr.nombre = { op: 'Contiene', val: txtBuscar }
            }

            const res = await get(`${urls.articulos}?qry=${JSON.stringify(qry)}`)

            if (res.code !== 0) return []

            return res.data
        },
    },
}
</script>

<style lang="scss" scoped></style>
