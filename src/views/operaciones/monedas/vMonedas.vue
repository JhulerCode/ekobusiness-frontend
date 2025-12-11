<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Monedas</strong>

            <div class="buttons">
                <JdButton
                    text="Nuevo"
                    title="Crear nuevo"
                    @click="nuevo()"
                    v-if="useAuth.verifyPermiso('vMonedas:crear')"
                />
            </div>
        </div>

        <JdTable
            :name="tableName"
            :columns="columns"
            :datos="vista.monedas || []"
            :colAct="true"
            :configFiltros="openConfigFiltros"
            :reload="loadMonedas"
            :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod"
        >
        </JdTable>
    </div>

    <mMoneda v-if="useModals.show.mMoneda" />
    <mTipoCambios v-if="useModals.show.mTipoCambios" />

    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
import { JdButton, JdTable, mConfigFiltros } from '@jhuler/components'

import mMoneda from './mMoneda.vue'
import mTipoCambios from './mTipoCambios.vue'

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

        mMoneda,
        mTipoCambios,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},

        tableName: 'vMonedas',
        columns: [
            {
                id: 'nombre',
                title: 'Nombre',
                type: 'text',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'codigo',
                title: 'Código',
                type: 'text',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'simbolo',
                title: 'Símbolo',
                type: 'text',
                width: '5rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'plural',
                title: 'En plural',
                type: 'text',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
        ],
        tableRowOptions: [
            {
                id: 1,
                label: 'Editar',
                icon: 'fa-solid fa-pen-to-square',
                action: 'editar',
                permiso: 'vMonedas:editar',
            },
            {
                id: 2,
                label: 'Eliminar',
                icon: 'fa-solid fa-trash-can',
                action: 'eliminar',
                permiso: 'vMonedas:eliminar',
                ocultar: { estandar: true },
            },
            {
                id: 3,
                label: 'Tipos de cambio',
                icon: 'fa-solid fa-dollar-sign',
                action: 'openTiposCambio',
                permiso: 'vTipoCambios:listar',
                ocultar: { estandar: true },
            },
        ],
    }),
    created() {
        this.vista = this.useVistas.vMonedas
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return

        if (this.useAuth.verifyPermiso('vMonedas:listar') == true) this.loadMonedas()
    },
    methods: {
        setQuery() {
            this.vista.qry = {
                fltr: {},
                ordr: [['nombre', 'ASC']],
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
            this.vista.qry.cols.push('estandar')
        },
        async loadMonedas() {
            this.setQuery()

            this.vista.monedas = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.monedas}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.monedas = res.data
        },

        nuevo() {
            const item = { estandar: false }

            this.useModals.setModal('mMoneda', 'Nueva moneda', 1, item)
        },

        async openConfigFiltros() {
            // await this.loadDatosSistema()

            const cols = this.columns
            // cols.find(a => a.id == 'estado').lista = this.vista.estados

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadMonedas,
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },

        runMethod(method, item) {
            this[method](item)
        },
        async editar(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.monedas}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mMoneda', 'Editar moneda', 2, res.data)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.monedas, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vMonedas', 'monedas', item)
        },

        async openTiposCambio(item) {
            const send = {
                moneda: {
                    id: item.id,
                    nombre: item.nombre,
                },
            }

            this.useModals.setModal('mTipoCambios', 'Tipos de cambio', null, send, true)
        },
        // async loadDatosSistema() {
        //     const qry = ['documentos_estados']
        //     const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

        //     if (res.code != 0) return

        //     Object.assign(this.vista, res.data)
        // },
    },
}
</script>

<style lang="scss" scoped></style>
