<template>
    <div class="vista vista-fill">
        <div class="head">
            <div class="head-left">
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

            <div class="head-center">
                <JdBuscador
                    :view="vista"
                    :columns="columns"
                    :tableName="tableName"
                    @open-filters="openConfigFiltros"
                    @reload="loadMonedas"
                />
            </div>

            <div class="head-right">
                <JdPaginacion :view="vista" @reload="loadMonedas" />

                <JdButton
                    icon="fa-solid fa-file-excel"
                    tipo="2"
                    title="Exportar"
                    @click="$refs['jdtable'].downloadData()"
                />

                <JdButton
                    icon="fa-solid fa-gear"
                    tipo="2"
                    title="Columnas"
                    @click="$refs['jdtable'].openConfigCols()"
                />
            </div>
        </div>

        <JdTable
            ref="jdtable"
            :name="tableName"
            :columns="columns"
            :datos="vista.monedas || []"
            :colAct="true"
            :configFiltros="openConfigFiltros"
            :reload="loadMonedas"
            :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod"
        />
    </div>

    <mMoneda v-if="useModals.show.mMoneda" />
    <mTipoCambios v-if="useModals.show.mTipoCambios" />

    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
import { JdButton, mConfigFiltros } from '@jhuler/components'
import JdTable from '@/components/JdTable/JdTable.vue'
import JdBuscador from '@/components/JdBuscador.vue'
import JdPaginacion from '@/components/JdPaginacion.vue'
import { columns, tableRowOptions } from './monedas.config.js'

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
        JdBuscador,
        JdPaginacion,

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
        columns,
        tableRowOptions,
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
            const cols = this.columns

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
