<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Colaboradores</strong>

            <div class="buttons">
                <JdButton text="Nuevo" title="Crear nuevo" @click="nuevo()"
                    v-if="useAuth.verifyPermiso('vColaboradores:crear')" />
            </div>
        </div>

        <JdTable :name="tableName" :columns="columns" :datos="vista.colaboradores || []" :colAct="true"
            :configFiltros="openConfigFiltros" :configCols="true" :reload="loadColaboradores"
            :rowOptions="tableRowOptions" @rowOptionSelected="runMethod">
        </JdTable>
    </div>

    <mColaborador v-if="useModals.show.mColaborador" />

    <mConfigCols v-if="useModals.show.mConfigCols" />
    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
import JdButton from '@/components/inputs/JdButton.vue'
import JdTable from '@/components/JdTable.vue'

import mConfigCols from '@/components/mConfigCols.vue'
import mConfigFiltros from '@/components/mConfigFiltros.vue'

import mColaborador from './mColaborador.vue'

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

        mColaborador,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},

        tableName: 'vColaboradores',
        columns: [
            {
                id: 'nombres',
                title: 'Nombres',
                type: 'text',
                width: '10rem',
                show: true,
                seek: true,
                sort: true
            },
            {
                id: 'apellidos',
                title: 'Apellidos',
                type: 'text',
                width: '10rem',
                show: true,
                seek: true,
                sort: true
            },
            {
                id: 'doc_tipo',
                title: 'Tipo de documento',
                prop: 'doc_tipo1.nombre',
                type: 'select',
                width: '10rem',
                show: true,
                seek: true,
                sort: true
            },
            {
                id: 'doc_numero',
                title: 'Número de documento',
                type: 'text',
                width: '10rem',
                show: true,
                seek: true,
                sort: true
            },
            {
                id: 'fecha_nacimiento',
                title: 'Fecha de nacimiento',
                type: 'date',
                width: '8rem',
                show: true,
                seek: true,
                sort: true
            },
            {
                id: 'sexo',
                title: 'Sexo',
                prop: 'sexo1.nombre',
                type: 'select',
                width: '8rem',
                show: true,
                seek: true,
                sort: true
            },
            {
                id: 'correo',
                title: 'Email',
                type: 'text',
                width: '10rem',
                show: true,
                seek: true,
                sort: true
            },
            {
                id: 'telefono',
                title: 'Teléfono',
                type: 'text',
                width: '10rem',
                show: true,
                seek: true,
                sort: true
            },
            {
                id: 'direccion',
                title: 'Dirección',
                type: 'text',
                width: '10rem',
                show: true,
                seek: true,
                sort: true
            },
            {
                id: 'cargo',
                title: 'Cargo',
                type: 'text',
                width: '10rem',
                show: true,
                seek: true,
                sort: true
            },
            {
                id: 'activo',
                title: 'Activo?',
                prop: 'activo1.nombre',
                type: 'select',
                format: 'yesno',
                width: '5rem',
                show: true,
                seek: true,
                sort: true
            },
            {
                id: 'has_signin',
                title: 'Tiene usuario?',
                prop: 'has_signin1.nombre',
                type: 'select',
                format: 'yesno',
                width: '5rem',
                show: true,
                seek: true,
                sort: true
            }
        ],
        tableRowOptions: [
            { label: 'Ver', icon: 'fa-regular fa-folder-open', action: 'ver', permiso: 'vColaboradores:ver' },
            { label: 'Editar', icon: 'fa-solid fa-pen-to-square', action: 'editar', permiso: 'vColaboradores:editar' },
            { label: 'Eliminar', icon: 'fa-solid fa-trash-can', action: 'eliminar', permiso: 'vColaboradores:eliminar' },
        ],
    }),
    created() {
        this.vista = this.useVistas.vColaboradores
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return

        if (this.useAuth.verifyPermiso('vColaboradores:listar') == true) this.loadColaboradores()
    },
    methods: {
        setQuery() {
            this.vista.qry = {
                fltr: {},
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
        },
        async loadColaboradores() {
            this.setQuery()

            this.vista.colaboradores = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.colaboradores}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.colaboradores = res.data
        },

        nuevo() {
            const item = { activo: true, has_signin: false }

            this.useModals.setModal('mColaborador', 'Nuevo colaborador', 1, item)
        },

        async openConfigFiltros() {
            await this.loadDatosSistema()

            const cols = this.columns
            cols.find(a => a.id == 'sexo').lista = this.vista.generos
            cols.find(a => a.id == 'doc_tipo').lista = this.vista.documentos_identidad
            cols.find(a => a.id == 'activo').lista = this.vista.estados

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadColaboradores
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },

        runMethod(method, item) {
            this[method](item)
        },
        async ver(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.colaboradores}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mColaborador', 'Ver colaborador', 3, res.data)
        },
        async editar(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.colaboradores}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mColaborador', 'Editar colaborador', 2, res.data)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.colaboradores, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vColaboradores', 'colaboradores', item)
        },

        async loadDatosSistema() {
            const qry = ['generos', 'documentos_identidad', 'estados']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.vista, res.data)
        },
    },

}
</script>

<style lang="scss" scoped></style>
