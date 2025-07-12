<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Categorías de productos terminados</strong>

            <div class="buttons">
                <JdButton text="Nuevo" title="Crear nuevo" @click="nuevo()"
                    v-if="useAuth.verifyPermiso('vProductoCategorias_crear')" />
            </div>
        </div>

        <JdTable :name="tableName" :columns="columns" :datos="vista.articulo_categorias || []" :colAct="true"
            :configFiltros="openConfigFiltros" :configCols="true" :reload="loadCategorias" :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod">
        </JdTable>
    </div>

    <mArticuloCategoria v-if="useModals.show.mArticuloCategoria" />

    <mConfigCols v-if="useModals.show.mConfigCols" />
    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
import JdButton from '@/components/inputs/JdButton.vue'
import JdTable from '@/components/JdTable.vue'

import mConfigCols from '@/components/mConfigCols.vue'
import mConfigFiltros from '@/components/mConfigFiltros.vue'

import mArticuloCategoria from '@/views/logistica_entrada/categorias/mArticuloCategoria.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get, delet } from '@/utils/crud'
import { jqst } from '@/utils/swal'

export default {
    components: {
        JdButton,
        JdTable,

        mConfigCols,
        mConfigFiltros,

        mArticuloCategoria,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},

        tableName: 'vProductoCategorias',
        columns: [
            {
                id: 'nombre',
                title: 'Nombre',
                type: 'text',
                width: '20rem',
                show: true,
                seek: true,
                sort: true
            },
            {
                id: 'descripcion',
                title: 'Descripción',
                type: 'text',
                width: '20rem',
                show: true,
                seek: false,
                sort: false
            },
            {
                id: 'activo',
                title: 'Activo?',
                prop: 'activo1.nombre',
                type: 'select',
                format: 'yesno',
                width: '15rem',
                show: true,
                seek: false,
                sort: false
            },
        ],
        tableRowOptions: [
            { id: 1, label: 'Editar', icon: 'fa-solid fa-pen-to-square', action: 'editar', permiso: 'vProductoCategorias_editar' },
            { id: 2, label: 'Eliminar', icon: 'fa-solid fa-trash-can', action: 'eliminar', permiso: 'vProductoCategorias_eliminar' },
        ],
    }),
    created() {
        this.vista = this.useVistas.vProductoCategorias
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return

        this.loadCategorias()
    },
    methods: {
        setQuery() {
            this.vista.qry = {
                fltr: { tipo: { op: 'Es', val: 2 } },
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
        },
        async loadCategorias() {
            this.setQuery()

            this.vista.articulo_categorias = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulo_categorias}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.articulo_categorias = res.data
        },

        nuevo() {
            const item = { tipo: 2, activo: true }

            this.useModals.setModal('mArticuloCategoria', 'Nueva categoría', 1, item)
        },

        async openConfigFiltros() {
            await this.loadDatosSistema()

            const cols = this.columns
            cols.find(a => a.id == 'activo').lista = this.vista.estados

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadCategorias
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },

        runMethod(method, item) {
            this[method](item)
        },
        async editar(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulo_categorias}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mArticuloCategoria', 'Editar categoría', 2, res.data)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.articulo_categorias, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vProductoCategorias', 'articulo_categorias', item)
        },

        async loadDatosSistema() {
            const qry = ['estados']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.vista, res.data)
        },
    },

}
</script>

<style lang="scss" scoped></style>