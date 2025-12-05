<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Inventario</strong>

            <div class="buttons">
                <JdButton
                    @click="loadInventario"
                    text="Buscar"
                    v-if="useAuth.verifyPermiso('vInventarioArticulos:listar')"
                />
            </div>
        </div>

        <JdTable
            :columns="columns"
            :datos="vista.inventario || []"
            :configFiltros="openConfigFiltros"
        />
    </div>

    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
import { JdTable, JdButton, mConfigFiltros } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get } from '@/utils/crud'
import { redondear } from '@/utils/mine'

import dayjs from 'dayjs'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdTable,
        JdButton,
        mConfigFiltros,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),
        dayjs,
        redondear,

        vista: {},

        tableName: 'vInventarioArticulos',
        columns: [
            {
                id: 'fecha',
                title: 'Fecha',
                type: 'date',
                show: false,
            },
            {
                id: 'nombre',
                title: 'Nombre',
                type: 'text',
                width: '30rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'categoria',
                title: 'Categoría',
                prop: 'categoria1.nombre',
                type: 'select',
                width: '12rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'unidad',
                title: 'Unidad',
                width: '7rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'cantidad',
                title: 'Stock',
                format: 'number',
                toRight: true,
                width: '7rem',
                show: true,
                seek: true,
                sort: true,
            },
        ],
    }),
    created() {
        this.vista = this.useVistas.vInventarioArticulos
        this.initFiltros()
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return
    },
    methods: {
        initFiltros() {
            this.columns[0].op = 'Es igual o anterior a'
            this.columns[0].val = dayjs().format('YYYY-MM-DD')
        },
        checkDatos() {
            if (!this.columns[0].val) {
                jmsg('error', 'Ingrese la fecha límite')
                return true
            }

            return false
        },
        setQuery() {
            this.vista.qry = {
                fltr: {
                    tipo: { op: 'Es', val: 1 },
                },
                incl: ['categoria1'],
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
        },
        async loadInventario() {
            if (this.checkDatos()) return

            this.setQuery()

            this.vista.inventario = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.kardex}/inventario?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.inventario = res.data
        },

        async openConfigFiltros() {
            await this.loadCategorias()

            const cols = this.columns.filter((a) => a.id != 'unidad' && a.id != 'cantidad')
            cols.find((a) => a.id == 'categoria').lista = this.vista.articulo_categorias

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadInventario,
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
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
        },
    },
}
</script>
