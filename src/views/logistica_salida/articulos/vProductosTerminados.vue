<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Productos</strong>

            <div class="buttons">
                <input
                    type="file"
                    ref="excel"
                    accept=".xlsx, .xls, .csv"
                    hidden
                    @change="importar"
                />

                <JdButton
                    icon="fa-solid fa-file-excel"
                    text="Importar"
                    tipo="2"
                    @click="this.$refs.excel.click()"
                    v-if="useAuth.verifyPermiso('vProductosTerminados:importar')"
                />

                <JdButton
                    text="Nuevo combo"
                    tipo="2"
                    @click="nuevoCombo()"
                    v-if="useAuth.verifyPermiso('vProductosTerminados:crearCombo')"
                />

                <JdButton
                    text="Crear nuevo"
                    @click="nuevo()"
                    v-if="useAuth.verifyPermiso('vProductosTerminados:crear')"
                />
            </div>
        </div>

        <JdTable
            :name="tableName"
            :columns="columns"
            :datos="vista.articulos || []"
            :colAct="true"
            :configRowSelect="true"
            :configCols="true"
            :configFiltros="openConfigFiltros"
            :reload="loadArticulos"
            :actions="tableActions"
            @actionClick="runMethod"
            :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod"
            ref="jdtable"
        >
        </JdTable>
    </div>

    <mImportarArticulos v-if="useModals.show.mImportarArticulos" />
    <mArticuloReceta v-if="useModals.show.mArticuloReceta" />
    <mArticulo v-if="useModals.show.mArticulo" />
    <mCombo v-if="useModals.show.mCombo" />
    <mKardex v-if="useModals.show.mKardex" />
    <mLotes v-if="useModals.show.mLotes" />
    <mAjusteStock v-if="useModals.show.mAjusteStock" />
    <mUploadFiles v-if="useModals.show.mUploadFiles" />

    <mConfigCols v-if="useModals.show.mConfigCols" />
    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
    <mEditar v-if="useModals.show.mEditar" @updated="updatedBulk" />
</template>

<script>
import { JdButton, JdTable, mConfigFiltros, mConfigCols, mEditar } from '@jhuler/components'
import mUploadFiles from '@/components/mUploadFiles.vue'

import mImportarArticulos from '@/views/logistica_entrada/articulos/mImportarArticulos.vue'
import mArticulo from '@/views/logistica_entrada/articulos/mArticulo.vue'
import mCombo from '@/views/logistica_salida/articulos/mCombo.vue'
import mArticuloReceta from '@/views/logistica_salida/articulos/mArticuloReceta.vue'
import mKardex from '@/views/logistica_entrada/articulos/mKardex.vue'
import mLotes from '@/views/logistica_entrada/articulos/mLotes.vue'
import mAjusteStock from '@/views/logistica_entrada/articulos/mAjusteStock.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get, delet } from '@/utils/crud'
import { tryOficialExcel } from '@/utils/mine'
import { jqst, jmsg } from '@/utils/swal'
import dayjs from 'dayjs'

export default {
    components: {
        JdTable,
        JdButton,
        mUploadFiles,

        mConfigCols,
        mConfigFiltros,
        mEditar,

        mImportarArticulos,
        mArticulo,
        mCombo,
        mArticuloReceta,
        mKardex,
        mLotes,
        mAjusteStock,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},

        tableName: 'vProductosTerminados',
        columns: [
            {
                id: 'id',
                title: 'id',
                type: 'text',
                width: '5rem',
                show: false,
                seek: false,
                sort: false,
            },
            {
                id: 'codigo_barra',
                title: 'EAN',
                type: 'text',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'nombre',
                title: 'Nombre',
                type: 'text',
                width: '25rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'unidad',
                title: 'Unidad',
                type: 'select',
                editable: true,
                width: '5rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'activo',
                title: 'Activo?',
                prop: 'activo1.nombre',
                type: 'select',
                editable: true,
                format: 'yesno',
                width: '5rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'marca',
                title: 'Marca',
                type: 'text',
                editable: true,
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            // {
            //     id: 'stock',
            //     title: 'Stock',
            //     format: 'number',
            //     toRight: true,
            //     width: '10rem',
            //     show: false,
            //     seek: true,
            //     sort: true,
            // },
            // {
            //     id: 'valor',
            //     title: 'Valor',
            //     format: 'decimal',
            //     toRight: true,
            //     width: '10rem',
            //     show: true,
            //     seek: true,
            //     sort: true,
            // },
            {
                id: 'linea',
                title: 'Línea',
                prop: 'linea1.nombre',
                type: 'select',
                editable: true,
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'categoria',
                title: 'Categoría',
                prop: 'categoria1.nombre',
                type: 'select',
                editable: true,
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'filtrantes',
                title: 'Sobres en caja',
                type: 'number',
                width: '5rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'contenido_neto',
                title: 'Contenido neto (g)',
                type: 'number',
                width: '5rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'has_fv',
                title: 'Tiene fecha de vencimiento?',
                prop: 'has_fv1.nombre',
                type: 'select',
                editable: true,
                format: 'yesno',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'igv_afectacion',
                title: 'Tributo',
                prop: 'igv_afectacion1.nombre',
                type: 'select',
                editable: true,
                width: '10rem',
                show: true,
                seek: false,
                sort: true,
            },
            {
                id: 'is_ecommerce',
                title: 'Ecommerce',
                prop: 'is_ecommerce1.nombre',
                type: 'select',
                format: 'yesno',
                editable: true,
                width: '10rem',
                show: false,
            },
            {
                id: 'precio',
                title: 'Precio',
                type: 'number',
                editable: true,
                width: '10rem',
                show: false,
            },
        ],
        tableActions: [
            {
                icon: 'fa-solid fa-pen-to-square',
                text: 'Editar',
                action: 'editarBulk',
                permiso: 'vProductosTerminados:editarBulk',
            },
            {
                icon: 'fa-solid fa-trash-can',
                text: 'Eliminar',
                action: 'eliminarBulk',
                permiso: 'vProductosTerminados:eliminarBulk',
            },
        ],
        tableRowOptions: [
            {
                label: 'Editar',
                icon: 'fa-solid fa-pen-to-square',
                action: 'editar',
                permiso: 'vProductosTerminados:editar',
            },
            {
                label: 'Actualizar fotos',
                icon: 'fa-solid fa-image',
                action: 'openUploadFiles',
                permiso: 'vProductos:actualizarFotos',
            },
            {
                label: 'Eliminar',
                icon: 'fa-solid fa-trash-can',
                action: 'eliminar',
                permiso: 'vProductosTerminados:eliminar',
            },
            {
                label: 'Clonar',
                icon: 'fa-solid fa-copy',
                action: 'clonar',
                permiso: 'vProductosTerminados:clonar',
                ocultar: { is_combo: true },
            },
            {
                label: 'Receta',
                icon: 'fa-solid fa-flask',
                action: 'showReceta',
                permiso: 'vReceta:listar',
                ocultar: { is_combo: true },
            },
            {
                label: 'Ver kardex',
                icon: 'fa-solid fa-table-list',
                action: 'verKardex',
                permiso: 'vProductosTerminados:kardex',
            },
            {
                label: 'Ver lotes',
                icon: 'fa-solid fa-table-list',
                action: 'verLotes',
                permiso: 'vProductosTerminados:lotes',
            },
            {
                label: 'Ajuste stock',
                icon: 'fa-solid fa-wrench',
                action: 'ajusteStock',
                permiso: 'vProductosTerminados:ajusteStock',
            },
        ],
    }),
    async created() {
        this.vista = this.useVistas.vProductosTerminados
        this.useAuth.setColumns(this.tableName, this.columns)

        this.verifyRowSelectIsActive()

        if (this.vista.loaded) return
        if (this.useAuth.verifyPermiso('vProductosTerminados:listar') == true) this.loadArticulos()
    },
    methods: {
        setQuery() {
            this.vista.qry = {
                fltr: { tipo: { op: 'Es', val: 2 } },
                incl: ['categoria1', 'linea1'],
                ordr: [['nombre', 'ASC']],
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
            this.vista.qry.cols.push('is_combo', 'fotos')
        },
        async loadArticulos() {
            this.setQuery()

            this.vista.articulos = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulos}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.articulos = res.data
        },
        verifyRowSelectIsActive() {
            if (this.vista.articulos && this.vista.articulos.some((a) => a.selected)) {
                setTimeout(() => {
                    this.$refs['jdtable'].toogleSelectItems()
                }, 0)
            }
        },

        nuevo() {
            const item = {
                tipo: 2,
                igv_afectacion: 10,

                has_fv: true,
                vende: true,
                activo: true,

                is_combo: false,
            }

            this.useModals.setModal('mArticulo', 'Nuevo producto', 1, item)
        },
        nuevoCombo() {
            const item = {
                tipo: 2,
                igv_afectacion: 10,

                has_fv: false,
                vende: true,
                activo: true,

                is_combo: true,
                combo_articulos: [],
            }

            this.useModals.setModal('mCombo', 'Nuevo Combo', 1, item)
        },
        importar(event) {
            this.useAuth.setLoading(true, 'Cargando archivo...')

            const file = event.target.files[0]
            const reader = new FileReader()

            reader.onload = async () => {
                const headers = [
                    'Nombre',
                    'Linea',
                    'Categoria',
                    'Sobres_caja',
                    'EAN',
                    'Unidad',
                    'Marca',
                    'Tributo',
                ]
                const res = await tryOficialExcel(this.$refs.excel, file, reader, headers)

                if (res.code != 0) {
                    this.useAuth.setLoading(false)
                    return jmsg('error', res.msg)
                }

                await this.loadDatosSistema()
                const igv_afectacionesMap = this.vista.igv_afectaciones.reduce(
                    (obj, a) => ((obj[a.id] = a), obj),
                    {},
                )

                await this.loadLineas()
                const produccion_tiposMap = this.vista.articulo_lineas.reduce(
                    (obj, a) => ((obj[a.id] = a), obj),
                    {},
                )

                await this.loadCategorias()
                const categoriasMap = this.vista.articulo_categorias.reduce(
                    (obj, a) => ((obj[a.nombre] = a), obj),
                    {},
                )

                for (const a of res.data) {
                    if (categoriasMap[a.Categoria]) {
                        a.Categoria1 = categoriasMap[a.Categoria]
                        a.Categoria = categoriasMap[a.Categoria].id
                    } else {
                        a.Categoria = null
                    }

                    if (produccion_tiposMap[a.Linea]) {
                        a.Linea = produccion_tiposMap[a.Linea].id
                        a.Tipo_produccion1 = { ...produccion_tiposMap[a.Linea] }
                    } else {
                        a.Linea = null
                    }

                    if (igv_afectacionesMap[a.Tributo]) {
                        a.Tributo = igv_afectacionesMap[a.Tributo].id
                        a.Tributo1 = { ...igv_afectacionesMap[a.Tributo] }
                    } else {
                        a.Tributo = null
                    }
                }

                this.useAuth.setLoading(false)

                const send = {
                    tipo: 2,
                    articulos: res.data,
                }

                this.useModals.setModal(
                    'mImportarArticulos',
                    'Importar productos terminados',
                    null,
                    send,
                    true,
                )
            }
            reader.readAsArrayBuffer(file)
        },

        async openConfigFiltros() {
            await this.loadDatosSistema()

            const cols = this.columns
            for (const a of cols) {
                if (a.id == 'unidad') a.lista = this.vista.unidades
                if (a.id == 'has_fv') a.lista = this.vista.estados
                if (a.id == 'activo') a.lista = this.vista.estados
                if (a.id == 'is_ecommerce') a.lista = this.vista.estados
                if (a.id == 'igv_afectacion') a.lista = this.vista.igv_afectaciones
                if (a.id == 'categoria') a.reload = this.loadCategorias
                if (a.id == 'linea') a.reload = this.loadLineas
            }

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadArticulos,
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },

        async eliminarBulk() {
            const ids = this.vista.articulos.filter((a) => a.selected).map((b) => b.id)

            const resQst = await jqst(`¿Está seguro de eliminar ${ids.length} registros?`)
            if (resQst.isConfirmed == false) return

            const send = { id: 'bulk', ids }
            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(`${urls.articulos}/bulk`, send)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.vista.articulos = this.vista.articulos.filter((a) => !a.selected)
            this.$refs['jdtable'].toogleSelectItems()
        },
        async editarBulk() {
            await this.loadDatosSistema()

            const cols = this.columns
            for (const a of this.columns) {
                if (a.id == 'unidad') a.lista = this.vista.unidades
                if (a.id == 'has_fv') a.lista = this.vista.estados
                if (a.id == 'activo') a.lista = this.vista.estados
                if (a.id == 'is_ecommerce') a.lista = this.vista.estados
                if (a.id == 'igv_afectacion') a.lista = this.vista.igv_afectaciones
                if (a.id == 'categoria') a.reload = this.loadCategorias
                if (a.id == 'linea') a.reload = this.loadLineas
            }

            const ids = this.vista.articulos.filter((a) => a.selected).map((b) => b.id)

            const send = {
                uri: 'articulos',
                nuevo: {},
                cols,
                ids,
            }

            this.useModals.setModal('mEditar', `Editar ${ids.length} registros`, null, send, true)
        },
        updatedBulk(item) {
            for (const a of this.vista.articulos) {
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
        async editar(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulos}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            if (res.data.is_combo) {
                this.useModals.setModal('mCombo', 'Editar combo', 2, res.data)
            } else {
                this.useModals.setModal('mArticulo', 'Editar producto', 2, res.data)
            }
        },
        openUploadFiles(item) {
            const send = {
                item: {
                    id: item.id,
                    nombre: item.nombre,
                    archivos: item.fotos || [],
                },
                accept: 'image/*',
                cantidad: 10,
                url: `${urls.articulos}/fotos`,
                vista: 'vProductosTerminados',
                tabla: 'articulos',
                prop: 'fotos',
            }

            this.useModals.setModal('mUploadFiles', 'Actualizar fotos', 2, send, true)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.articulos, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vProductosTerminados', 'articulos', item)
        },
        async clonar(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulos}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const send = {
                ...res.data,
                id: null,
            }

            this.useModals.setModal('mArticulo', 'Nuevo producto', 1, send)
        },
        async showReceta(item) {
            const send = {
                id: item.id,
            }

            this.useModals.setModal('mArticuloReceta', `Receta - ${item.nombre}`, 2, send)
        },
        async verKardex(item) {
            const send = {
                articulo: {
                    id: item.id,
                    nombre: item.nombre,
                    unidad: item.unidad,
                },
            }

            this.useModals.setModal('mKardex', 'Kardex del producto', null, send, true)
        },
        verLotes(item) {
            const send = {
                articulo: {
                    id: item.id,
                    nombre: item.nombre,
                    unidad: item.unidad,
                },
            }

            this.useModals.setModal('mLotes', 'Lotes del producto', null, send, true)
        },
        ajusteStock(item) {
            const send = {
                transaccion: {
                    fecha: dayjs().format('YYYY-MM-DD'),
                    articulo: item.id,
                },
                articulo1: {
                    igv_afectacion: item.igv_afectacion,
                    has_fv: item.has_fv,
                },
                articulos: [{ id: item.id, nombre: item.nombre }],
                articulo_tipo: 1,
                is_nuevo_lote: false,
            }

            this.useModals.setModal('mAjusteStock', 'Ajuste de stock', null, send, true)
        },

        async loadLineas() {
            const qry = {
                fltr: {},
                cols: ['nombre'],
                ordr: [['nombre', 'ASC']],
            }

            this.vista.articulo_lineas = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulo_lineas}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.vista.articulo_lineas = res.data
            return res.data
        },
        async loadCategorias() {
            const qry = {
                cols: ['nombre'],
                fltr: {
                    tipo: { op: 'Es', val: 2 },
                    activo: { op: 'Es', val: true },
                },
                ordr: [['nombre', 'ASC']],
            }

            this.vista.articulo_categorias = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulo_categorias}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.vista.articulo_categorias = res.data
            return res.data
        },
        async loadDatosSistema() {
            const qry = ['igv_afectaciones', 'unidades', 'estados']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.vista, res.data)
        },
    },
}
</script>

<style lang="scss" scoped></style>
