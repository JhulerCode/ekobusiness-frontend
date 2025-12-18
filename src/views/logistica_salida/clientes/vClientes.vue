<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Clientes</strong>

            <div class="buttons">
                <JdButton
                    text="Nuevo"
                    @click="nuevo()"
                    v-if="useAuth.verifyPermiso('vClientes:crear')"
                />
            </div>
        </div>

        <JdTable
            :name="tableName"
            :columns="columns"
            :datos="vista.socios || []"
            :colAct="true"
            :configFiltros="openConfigFiltros"
            :configCols="true"
            :reload="loadSocios"
            :actions="tableActions"
            @actionClick="runMethod"
            :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod"
            ref="jdtable"
        >
        </JdTable>
    </div>

    <mSocio v-if="useModals.show.mSocio" />

    <mConfigCols v-if="useModals.show.mConfigCols" />
    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
    <mEditar v-if="useModals.show.mEditar" @updated="updatedBulk" />
</template>

<script>
import { JdButton, JdTable, mConfigFiltros, mConfigCols, mEditar } from '@jhuler/components'

import mSocio from '@/views/logistica_entrada/proveedores/mSocio.vue'

import { useModals } from '@/pinia/modals'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'

import { urls, get, delet } from '@/utils/crud'
import { jqst } from '@/utils/swal'

export default {
    components: {
        JdTable,
        JdButton,

        mSocio,

        mConfigCols,
        mConfigFiltros,
        mEditar,
    },
    data: () => ({
        useModals: useModals(),
        useAuth: useAuth(),
        useVistas: useVistas(),

        vista: {},

        tableName: 'vClientes',
        columns: [
            {
                id: 'doc_tipo',
                title: 'Tipo documento',
                prop: 'doc_tipo1.nombre',
                type: 'select',
                editable: true,
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'doc_numero',
                title: 'Nro documento',
                type: 'text',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'nombres',
                title: 'Razón social o nombre',
                type: 'text',
                width: '20rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'correo',
                title: 'E-mail',
                type: 'text',
                width: '10rem',
                show: true,
                seek: true,
                sort: false,
            },
            {
                id: 'telefono1',
                title: 'Teléfono',
                type: 'text',
                width: '10rem',
                show: true,
                seek: true,
                sort: false,
            },
            {
                id: 'activo',
                title: 'Activo?',
                prop: 'activo1.nombre',
                format: 'yesno',
                type: 'select',
                editable: true,
                width: '10rem',
                show: true,
                seek: false,
                sort: false,
            },
        ],
        tableActions: [
            { icon: 'fa-solid fa-pen-to-square', text: 'Editar', action: 'editarBulk' },
            { icon: 'fa-solid fa-trash-can', text: 'Eliminar', action: 'eliminarBulk' },
        ],
        tableRowOptions: [
            {
                label: 'Ver',
                icon: 'fa-regular fa-folder-open',
                action: 'ver',
                permiso: 'vClientes:ver',
            },
            {
                label: 'Editar',
                icon: 'fa-solid fa-pen-to-square',
                action: 'editar',
                permiso: 'vClientes:editar',
            },
            {
                label: 'Eliminar',
                icon: 'fa-solid fa-trash-can',
                action: 'eliminar',
                permiso: 'vClientes:eliminar',
            },
        ],
    }),
    created() {
        this.vista = this.useVistas.vClientes
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return

        if (this.useAuth.verifyPermiso('vClientes:listar') == true) this.loadSocios()
    },
    methods: {
        setQuery() {
            this.vista.qry = {
                fltr: { tipo: { op: 'Es', val: 2 } },
                ordr: [
                    ['nombres', 'ASC'],
                    ['apellidos', 'ASC'],
                ],
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
        },
        async loadSocios() {
            this.setQuery()

            this.vista.socios = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.socios}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.socios = res.data
        },

        nuevo() {
            const item = {
                tipo: 2,
                doc_tipo: 6,
                direcciones: [],
                contactos: [],
                bancos: [],
                documentos: [],
                activo: true,
            }

            this.useModals.setModal('mSocio', 'Nuevo cliente', 1, item)
        },

        async openConfigFiltros() {
            await this.loadDatosSistema()

            const cols = this.columns
            for (const a of cols) {
                if (a.id == 'doc_tipo') a.lista = this.vista.documentos_identidad
                if (a.id == 'activo') a.lista = this.vista.estados
            }

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadSocios,
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },

        async eliminarBulk() {
            const ids = this.vista.socios.filter((a) => a.selected).map((b) => b.id)

            const resQst = await jqst(`¿Está seguro de eliminar ${ids.length} registros?`)
            if (resQst.isConfirmed == false) return

            const send = { id: 'bulk', ids }
            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(`${urls.socios}/bulk`, send)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.vista.socios = this.vista.socios.filter((a) => !a.selected)
            this.$refs['jdtable'].toogleSelectItems()
        },
        async editarBulk() {
            await this.loadDatosSistema()

            const cols = this.columns
            for (const a of this.columns) {
                if (a.id == 'doc_tipo') a.lista = this.vista.documentos_identidad
                if (a.id == 'activo') a.lista = this.vista.estados
            }

            const ids = this.vista.socios.filter((a) => a.selected).map((b) => b.id)

            const send = {
                uri: 'socios',
                nuevo: {},
                cols,
                ids,
            }

            this.useModals.setModal('mEditar', `Editar ${ids.length} registros`, null, send, true)
        },
        updatedBulk(item) {
            for (const a of this.vista.socios) {
                if (!item.ids.includes(a.id)) continue

                a.selected = false
                a[item.prop] = item.val
                if (item.val1) a[`${item.prop}1`] = item.val1
            }

            this.$refs['jdtable'].toogleSelectItems()
        },

        runMethod(method, item) {
            this[method](item)
        },
        async ver(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.socios}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mSocio', 'Ver cliente', 3, res.data)
        },
        async editar(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.socios}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mSocio', 'Editar cliente', 2, res.data)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.socios, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vClientes', 'socios', item)
        },

        // async loadListasPrecios() {
        //     const qry = {
        //         fltr: { activo: { op: 'Es', val: true } },
        //         ordr: [['nombre', 'ASC']],
        //     }

        //     this.vista.precios_listas = []
        //     this.useAuth.setLoading(true, 'Cargando...')
        //     const res = await get(`${urls.precio_listas}?qry=${JSON.stringify(qry)}`)
        //     this.useAuth.setLoading(false)

        //     if (res.code != 0) return

        //     this.vista.precios_listas = res.data
        // },
        async loadDatosSistema() {
            const qry = ['documentos_identidad', 'estados']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.vista, res.data)
        },
    },
}
</script>

<style lang="scss" scoped></style>
