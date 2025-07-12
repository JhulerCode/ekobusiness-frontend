<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Listas de precios</strong>

            <div class="buttons">
                <JdButton text="Nuevo" title="Crear nuevo" @click="nuevo()"
                    v-if="useAuth.verifyPermiso('vPrecioListas_crear')" />
            </div>
        </div>

        <JdTable :name="tableName" :columns="columns" :datos="vista.precio_listas || []" :colAct="true"
            :configFiltros="openConfigFiltros" :reload="loadListaPrecios" :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod">
        </JdTable>
    </div>

    <mPrecioLista v-if="useModals.show.mPrecioLista" />
    <mPrecioListaItems v-if="useModals.show.mPrecioListaItems" />

    <mConfigCols v-if="useModals.show.mConfigCols" />
    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
import JdButton from '@/components/inputs/JdButton.vue'
import JdTable from '@/components/JdTable.vue'

import mConfigCols from '@/components/mConfigCols.vue'
import mConfigFiltros from '@/components/mConfigFiltros.vue'

import mPrecioLista from '@/views/logistica_entrada/precios/mPrecioLista.vue'
import mPrecioListaItems from '@/views/logistica_entrada/precios/mPrecioListaItems.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get, delet } from '@/utils/crud'
import { jqst } from '@/utils/swal'

export default {
    components: {
        JdTable,
        JdButton,

        mConfigCols,
        mConfigFiltros,

        mPrecioLista,
        mPrecioListaItems,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},

        tableName: 'vPrecioListas',
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
                id: 'moneda',
                title: 'Moneda',
                prop: 'moneda1.nombre',
                type: 'select',
                width: '10rem',
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
                width: '10rem',
                show: true,
                seek: false,
                sort: false
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
        ],
        tableRowOptions: [
            { id: 1, label: 'Editar', icon: 'fa-solid fa-pen-to-square', action: 'editar', permiso: 'vPrecioListas_editar' },
            { id: 2, label: 'Eliminar', icon: 'fa-solid fa-trash-can', action: 'eliminar', permiso: 'vPrecioListas_eliminar' },
            { id: 3, label: 'Artículos', icon: 'fa-solid fa-tags', action: 'verArticulos', permiso: 'vPrecioListaItems' },
        ],
    }),
    created() {
        this.vista = this.useVistas.vPrecioListas
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return

        this.loadListaPrecios()
    },
    methods: {
        setQuery() {
            this.vista.qry = {
                fltr: {},
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
        },
        async loadListaPrecios() {
            this.setQuery()

            this.vista.precio_listas = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.precio_listas}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.precio_listas = res.data
        },

        nuevo() {
            const item = { activo: true }

            this.useModals.setModal('mPrecioLista', 'Nueva lista de precios', 1, item)
        },

        async openConfigFiltros() {
            await this.loadDatosSistema()
            await this.loadMonedas()

            const cols = this.columns
            cols.find(a => a.id == 'moneda').lista = this.vista.monedas
            cols.find(a => a.id == 'activo').lista = this.vista.estados

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadListaPrecios
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },

        runMethod(method, item) {
            this[method](item)
        },
        async editar(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.precio_listas}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mPrecioLista', 'Editar lista de precios', 2, res.data)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.precio_listas, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vPrecioListas', 'precio_listas', item)
        },
        async verArticulos(item) {
            const send = {
                precio_lista: item.id,
            }

            this.useModals.setModal('mPrecioListaItems', item.nombre, null, send, true)
        },

        async loadMonedas() {
            const qry = {
                fltr: {},
                cols: ['id', 'nombre', 'simbolo', 'estandar'],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.monedas}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.vista.monedas = res.data
        },
        async loadDatosSistema() {
            const qry = ['estados', 'monedas']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.vista, res.data)
        },
    },
}
</script>

<style lang="scss" scoped></style>