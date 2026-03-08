<template>
    <div class="vista vista-fill">
        <div class="head">
            <div class="head-left">
                <strong>Categorías</strong>

                <JdButton
                    text="Nuevo"
                    title="Crear nuevo"
                    @click="nuevo"
                    v-if="useAuth.verifyPermiso('vArticuloCategorias:crear')"
                />
            </div>

            <div class="head-center">
                <JdBuscador
                    :view="vista"
                    :columns="columns"
                    :tableName="tableName"
                    @open-filters="openConfigFiltros"
                    @reload="loadCategorias"
                />
            </div>

            <div class="head-right">
                <JdPaginacion :view="vista" @reload="loadCategorias" />

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
            :columns="columns"
            :datos="vista.articulo_categorias || []"
            :colAct="true"
            :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod"
            ref="jdtable"
            :reload="loadCategorias"
        />
    </div>

    <!-- Modales -->
    <mArticuloCategoria v-if="useModals.show.mArticuloCategoria" />
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
import { COLUMNS, TABLE_ROW_OPTIONS } from './articuloCategorias.config'

// Modales específicos
import mArticuloCategoria from '@/views/inventario/categorias/mArticuloCategoria.vue'
import mUploadFiles from '@/components/mUploadFiles.vue'

// Pinia y Utils
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls, get, delet } from '@/utils/crud'
import { jqst } from '@/utils/swal'

export default {
    name: 'vArticuloCategorias',
    components: {
        JdButton,
        JdBuscador,
        JdTable,
        JdPaginacion,
        mConfigCols,
        mConfigFiltros,
        mArticuloCategoria,
        mUploadFiles,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},
        tableName: 'vArticuloCategorias',

        // Configuraciones traídas de articuloCategorias.config.js
        columns: JSON.parse(JSON.stringify(COLUMNS)),
        tableRowOptions: TABLE_ROW_OPTIONS,
    }),
    created() {
        this.vista = this.useVistas.vArticuloCategorias
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return
        this.vista.table_page = 1
        if (this.useAuth.verifyPermiso('vArticuloCategorias:listar')) this.loadCategorias()
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

            this.useAuth.updateQuery(this.columns, this.vista.qry)
            this.vista.qry.cols.push('fotos')
        },
        async loadCategorias() {
            this.setQuery()

            this.vista.articulo_categorias = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(
                `${urls.articulo_categorias}?qry=${JSON.stringify(this.vista.qry)}`,
            )
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.articulo_categorias = res.data
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
            this.useModals.setModal('mArticuloCategoria', 'Nueva categoría', 1, item)
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
            if (!resQst.isConfirmed) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.articulo_categorias, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vArticuloCategorias', 'articulo_categorias', item)
        },
        openUploadFiles(item) {
            const send = {
                item: {
                    id: item.id,
                    nombre: item.nombre,
                    archivos: item.fotos || [],
                },
                accept: 'image/*',
                cantidad: 2,
                url: `${urls.articulo_categorias}/fotos`,
                vista: 'vArticuloCategorias',
                tabla: 'articulo_categorias',
                prop: 'fotos',
            }

            this.useModals.setModal('mUploadFiles', 'Actualizar fotos', 2, send, true)
        },

        // --- Otros ---
        async openConfigFiltros() {
            await this.loadDatosSistema()

            const cols = this.columns
            for (const a of cols) {
                if (a.id == 'activo') a.lista = this.vista.estados
            }

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadCategorias,
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },
    },
}
</script>

<style lang="scss" scoped></style>
