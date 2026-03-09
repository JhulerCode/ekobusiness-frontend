<template>
    <div class="vista vista-fill">
        <div class="head">
            <div class="head-left" style="flex-wrap: nowrap">
                <strong style="white-space: nowrap">Líneas de productos</strong>

                <JdButtonsOverflow :buttons="headerActions" @runMethod="runMethod" />
            </div>

            <div class="head-center">
                <JdBuscador
                    :view="vista"
                    :columns="tableColumns"
                    :tableName="tableName"
                    @open-filters="openConfigFiltros"
                    @reload="loadLineas"
                />
            </div>

            <div class="head-right">
                <JdPaginacion :view="vista" @reload="loadLineas" />

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
            :name="tableName"
            :columns="tableColumns"
            :datos="vista.articulo_lineas || []"
            :colAct="true"
            :rowOptions="tableRowActions"
            @rowOptionSelected="runMethod"
            ref="jdtable"
            :reload="loadLineas"
        />
    </div>

    <!-- Modales -->
    <mArticuloLinea v-if="useModals.show.mArticuloLinea" />
    <mUploadFiles v-if="useModals.show.mUploadFiles" />
    <mConfigCols v-if="useModals.show.mConfigCols" />
    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
// Componentes base y utilidades
import { JdButton, mConfigFiltros, mConfigCols } from '@jhuler/components'
import JdBuscador from '@/components/JdBuscador.vue'
import JdTable from '@/components/JdTable/JdTable.vue'
import JdPaginacion from '@/components/JdPaginacion.vue'

// Configuración de la vista
import { TABLE_COLUMNS, TABLE_ROW_ACTIONS, HEADER_ACTIONS } from './productoLineas.config.js'

// Modales específicos
import mArticuloLinea from './mArticuloLinea.vue'
import mUploadFiles from '@/components/mUploadFiles.vue'
import JdButtonsOverflow from '@/components/JdButtonsOverflow.vue'

// Pinia y Utils
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls, get, delet } from '@/utils/crud'
import { jqst } from '@/utils/swal'

export default {
    name: 'vProductoLineas',
    components: {
        JdButton,
        JdBuscador,
        JdTable,
        JdPaginacion,
        JdButtonsOverflow,
        mConfigCols,
        mConfigFiltros,
        mArticuloLinea,
        mUploadFiles,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},
        tableName: 'vProductoLineas',

        headerActions: HEADER_ACTIONS,
        tableColumns: JSON.parse(JSON.stringify(TABLE_COLUMNS)),
        tableRowActions: TABLE_ROW_ACTIONS,
    }),
    created() {
        this.vista = this.useVistas.vProductoLineas
        this.useAuth.setColumns(this.tableName, this.tableColumns)

        if (this.vista.loaded) return
        this.vista.table_page = 1
        if (this.useAuth.verifyPermiso('vProductoLineas:listar')) this.loadLineas()
    },
    methods: {
        // --- Gestión de Tabla ---
        runMethod(method, item) {
            this[method](item)
        },

        // --- Carga de Datos ---
        setQuery() {
            this.vista.qry = {
                fltr: {},
                ordr: [['nombre', 'ASC']],
                page: this.vista.table_page,
            }

            this.useAuth.updateQuery(this.tableColumns, this.vista.qry)
            this.vista.qry.cols.push('fotos')
        },
        async loadLineas() {
            this.setQuery()

            this.vista.articulo_lineas = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulo_lineas}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.articulo_lineas = res.data
            this.vista.table_meta = res.meta
        },

        // --- Datos de Apoyo ---
        async loadDatosSistema() {
            const qry = ['estados']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)
            if (res.code != 0) return
            Object.assign(this.vista, res.data)
        },

        // --- Acciones de Registro ---
        nuevo() {
            const item = { activo: true }
            this.useModals.setModal('mArticuloLinea', 'Nueva línea', 1, item)
        },
        async editar(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulo_lineas}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mArticuloLinea', 'Editar línea', 2, res.data)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (!resQst.isConfirmed) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.articulo_lineas, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vProductoLineas', 'articulo_lineas', item)
        },
        openUploadFiles(item) {
            const send = {
                item: {
                    id: item.id,
                    nombre: item.nombre,
                    archivos: item.fotos || [],
                },
                accept: 'image/*,video/*',
                cantidad: 2,
                url: `${urls.articulo_lineas}/fotos`,
                vista: 'vProductoLineas',
                tabla: 'articulo_lineas',
                prop: 'fotos',
            }

            this.useModals.setModal('mUploadFiles', 'Actualizar fotos', 2, send, true)
        },

        // --- Otros ---
        async openConfigFiltros() {
            await this.loadDatosSistema()

            const cols = this.tableColumns
            for (const a of cols) {
                if (a.id == 'activo') a.lista = this.vista.estados
            }

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadLineas,
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },
    },
}
</script>

<style lang="scss" scoped></style>
