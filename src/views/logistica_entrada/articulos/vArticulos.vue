<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Artículos</strong>

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
                    v-if="useAuth.verifyPermiso('vArticulos:importar')"
                />

                <JdButton
                    text="Nuevo"
                    title="Crear nuevo"
                    @click="nuevo()"
                    v-if="useAuth.verifyPermiso('vArticulos:crear')"
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
    <mArticulo v-if="useModals.show.mArticulo" />
    <mKardex v-if="useModals.show.mKardex" />
    <mLotes v-if="useModals.show.mLotes" />
    <mAjusteStock v-if="useModals.show.mAjusteStock" />

    <mConfigCols v-if="useModals.show.mConfigCols" />
    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
    <mEditar v-if="useModals.show.mEditar" @updated="updatedBulk" />
</template>

<script>
import { JdButton, JdTable, mConfigFiltros, mConfigCols } from '@jhuler/components'
import mEditar from '@/components/mEditar.vue'

import mImportarArticulos from '@/views/logistica_entrada/articulos/mImportarArticulos.vue'
import mArticulo from '@/views/logistica_entrada/articulos/mArticulo.vue'
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
        JdButton,
        JdTable,

        mConfigCols,
        mConfigFiltros,
        mEditar,

        mImportarArticulos,
        mArticulo,
        mKardex,
        mLotes,
        mAjusteStock,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},

        tableName: 'articulos',
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
                seek: false,
                sort: true,
            },
            {
                id: 'activo',
                title: 'Activo?',
                prop: 'activo1.nombre',
                type: 'select',
                editable: true,
                format: 'yesno',
                width: '8rem',
                show: true,
                seek: false,
                sort: true,
            },
            {
                id: 'categoria',
                title: 'Categoría',
                prop: 'categoria1.nombre',
                type: 'select',
                editable: true,
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            // {
            //     id: 'stock',
            //     title: 'Stock',
            //     format: 'decimal',
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
            //     show: false,
            //     seek: true,
            //     sort: true,
            // },
            {
                id: 'has_fv',
                title: 'Tiene fecha de vencimiento?',
                prop: 'has_fv1.nombre',
                type: 'select',
                editable: true,
                format: 'yesno',
                width: '8rem',
                show: true,
            },
            {
                id: 'igv_afectacion',
                title: 'Tributo',
                prop: 'igv_afectacion1.nombre',
                type: 'select',
                editable: true,
                width: '10rem',
                show: true,
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
                // prop: 'igv_afectacion1.nombre',
                width: '10rem',
                show: false,
            },
        ],
        tableActions: [
            {
                icon: 'fa-solid fa-pen-to-square',
                text: 'Editar',
                action: 'editarBulk',
                permiso: 'vArticulos:editarBulk',
            },
            {
                icon: 'fa-solid fa-trash-can',
                text: 'Eliminar',
                action: 'eliminarBulk',
                permiso: 'vArticulos:eliminarBulk',
            },
        ],
        tableRowOptions: [
            {
                label: 'Editar',
                icon: 'fa-solid fa-pen-to-square',
                action: 'editar',
                permiso: 'vArticulos:editar',
            },
            {
                label: 'Eliminar',
                icon: 'fa-solid fa-trash-can',
                action: 'eliminar',
                permiso: 'vArticulos:eliminar',
            },
            {
                label: 'Clonar',
                icon: 'fa-solid fa-copy',
                action: 'clonar',
                permiso: 'vArticulos:clonar',
            },
            {
                label: 'Ver kardex',
                icon: 'fa-solid fa-table-list',
                action: 'verKardex',
                permiso: 'vArticulos:kardex',
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
                permiso: 'vArticulos:ajusteStock',
            },
        ],
    }),
    async created() {
        this.vista = this.useVistas.vArticulos
        this.useAuth.setColumns(this.tableName, this.columns)

        this.verifyRowSelectIsActive()

        if (this.vista.loaded) return
        if (this.useAuth.verifyPermiso('vArticulos:listar') == true) this.loadArticulos()
    },
    methods: {
        setQuery() {
            this.vista.qry = {
                fltr: { tipo: { op: 'Es', val: 1 } },
                incl: ['categoria1'],
                ordr: [['nombre', 'ASC']],
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
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
                tipo: 1,
                igv_afectacion: 10,

                has_fv: false,
                vende: false,
                activo: true,

                is_combo: false,
            }

            this.useModals.setModal('mArticulo', 'Nuevo artículo', 1, item)
        },
        importar(event) {
            this.useAuth.setLoading(true, 'Cargando archivo...')

            const file = event.target.files[0]
            const reader = new FileReader()

            reader.onload = async () => {
                const headers = ['Nombre', 'Categoria', 'Unidad', 'Tributo']
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

                    if (igv_afectacionesMap[a.Tributo]) {
                        a.Tributo = igv_afectacionesMap[a.Tributo].id
                        a.Tributo1 = { ...igv_afectacionesMap[a.Tributo] }
                    } else {
                        a.Tributo = null
                    }
                }

                this.useAuth.setLoading(false)

                const send = {
                    tipo: 1,
                    articulos: res.data,
                }
                this.useModals.setModal(
                    'mImportarArticulos',
                    'Importar artículos',
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
            }

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadArticulos,
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },

        runMethod(method, item) {
            this[method](item)
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

        async editar(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulos}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mArticulo', 'Editar artículo', 2, res.data)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.articulos, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vArticulos', 'articulos', item)
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

            this.useModals.setModal('mArticulo', 'Nuevo artículo', 1, send)
        },
        async verKardex(item) {
            const send = {
                articulo: {
                    id: item.id,
                    nombre: item.nombre,
                    unidad: item.unidad,
                },
            }

            this.useModals.setModal('mKardex', 'Kardex de artículo', null, send, true)
        },
        verLotes(item) {
            const send = {
                articulo: {
                    id: item.id,
                    nombre: item.nombre,
                    unidad: item.unidad,
                },
            }

            this.useModals.setModal('mLotes', 'Lotes del artículo', null, send, true)
        },
        async ajusteStock(item) {
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

        async loadCategorias() {
            const qry = {
                cols: ['nombre'],
                fltr: {
                    tipo: { op: 'Es', val: 1 },
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
