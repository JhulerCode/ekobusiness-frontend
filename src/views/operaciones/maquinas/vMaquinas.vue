<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Maquinas</strong>

            <div class="buttons">
                <JdButton text="Nuevo" title="Crear nuevo" @click="nuevo()"
                    v-if="useAuth.verifyPermiso('vMaquinas_crear')" />
            </div>
        </div>

        <JdTable :name="tableName" :columns="columns" :datos="vista.maquinas || []" :colAct="true"
            :configFiltros="openConfigFiltros" :reload="loadMaquinas" :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod">
        </JdTable>
    </div>

    <mMaquina v-if="useModals.show.mMaquina" />

    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
import JdButton from '@/components/inputs/JdButton.vue'
import JdTable from '@/components/JdTable.vue'

import mConfigFiltros from '@/components/mConfigFiltros.vue'

import mMaquina from '@/views/operaciones/maquinas/mMaquina.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get, delet } from '@/utils/crud'
import { jqst } from '@/utils/swal'

export default {
    components: {
        JdButton,
        JdTable,

        mConfigFiltros,

        mMaquina,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},

        tableName: 'vMaquinas',
        columns: [
            {
                id: 'nombre',
                title: 'Nombre',
                type: 'text',
                width: '15rem',
                show: true,
                seek: true,
                sort: true
            },
            {
                id: 'produccion_tipo',
                title: 'Tipo de producción',
                prop: 'produccion_tipo1.nombre',
                type: 'select',
                width: '15rem',
                show: true,
                seek: true,
                sort: true
            },
            {
                id: 'velocidad',
                title: 'Velocidad (und/min)',
                type: 'number',
                width: '8rem',
                show: true,
                seek: true,
                sort: true
            },
            {
                id: 'limpieza_tiempo',
                title: 'Tiempo de limpieza (min)',
                type: 'number',
                width: '8rem',
                show: true,
                seek: true,
                sort: true
            },
        ],
        tableRowOptions: [
            { id: 1, label: 'Editar', icon: 'fa-solid fa-pen-to-square', action: 'editar', permiso: 'vMaquinas_editar' },
            { id: 2, label: 'Eliminar', icon: 'fa-solid fa-trash-can', action: 'eliminar', permiso: 'vMaquinas_eliminar' },
        ],
    }),
    created() {
        this.vista = this.useVistas.vMaquinas
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return

        this.loadMaquinas()
    },
    methods: {
        setQuery() {
            this.vista.qry = {
                fltr: { tipo: { op: 'Es', val: 1 } },
                cols: ['codigo', 'nombre', 'produccion_tipo', 'velocidad', 'limpieza_tiempo'],
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
        },
        async loadMaquinas() {
            this.setQuery()

            this.vista.maquinas = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.maquinas}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.maquinas = res.data
        },

        nuevo() {
            const item = { tipo: 1 }

            this.useModals.setModal('mMaquina', 'Nueva máquina', 1, item)
        },

        async openConfigFiltros() {
            await this.loadDatosSistema()

            const cols = this.columns
            cols.find(a => a.id == 'produccion_tipo').lista = this.vista.produccion_tipos

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadMaquinas
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },

        runMethod(method, item) {
            this[method](item)
        },
        async editar(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.maquinas}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mMaquina', 'Editar documento', 2, res.data)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.maquinas, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vMaquinas', 'maquinas', item)
        },

        async loadDatosSistema() {
            const qry = ['produccion_tipos']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.vista, res.data)
        },
    },
}
</script>

<style lang="scss" scoped></style>