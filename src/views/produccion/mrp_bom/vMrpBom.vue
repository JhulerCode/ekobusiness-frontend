<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Lista de materiales</strong>

            <div class="buttons">
                <JdButton @click="nuevo" text="Nuevo" />
            </div>
        </div>

        <JdTable
            :name="tableName"
            :columns="columns"
            :datos="vista.mrp_boms || []"
            :colAct="true"
            :configFiltros="openConfigFiltros"
            :reload="loadMrpBoms"
            :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod"
            :meta="vista.table_meta"
            @prevPage="((vista.table_page -= 1), loadMrpBoms())"
            @nextPage="((vista.table_page += 1), loadMrpBoms())"
        />
    </div>

    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />

    <mMrpBom v-if="useModals.show.mMrpBom" />
</template>

<script>
import { JdTable, mConfigFiltros, JdButton } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import mMrpBom from './mMrpBom.vue'

import { urls, get, delet } from '@/utils/crud'
import { jqst } from '@/utils/swal'
import { redondear } from '@/utils/mine'

import dayjs from 'dayjs'

export default {
    components: {
        JdButton,
        JdTable,
        mConfigFiltros,
        mMrpBom,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),
        dayjs,
        redondear,

        vista: {},

        tableName: 'vMrpBom',
        columns: [
            {
                id: 'articulo',
                title: 'Producto',
                prop: 'articulo1.nombre',
                type: 'text',
                width: '30rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'tipo',
                title: 'Tipo',
                type: 'select',
                prop: 'tipo1.nombre',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
        ],
        tableRowOptions: [
            {
                label: 'Editar',
                icon: 'fa-solid fa-pen-to-square',
                action: 'editar',
                permiso: 'vMrpBom:editar',
            },
            {
                label: 'Eliminar',
                icon: 'fa-solid fa-trash-can',
                action: 'eliminar',
                permiso: 'vMrpBom:eliminar',
            },
        ],
    }),
    created() {
        this.vista = this.useVistas.vMrpBom
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return
        this.vista.table_page = 1
        if (this.useAuth.verifyPermiso('vMrpBom:listar') == true) this.loadMrpBoms()
    },
    methods: {
        setQuery() {
            this.vista.qry = {
                fltr: {},
                incl: ['articulo1'],
                ordr: [['articulo1', 'nombre', 'ASC']],
                page: this.vista.table_page,
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
            this.vista.qry.cols.push('tipo1')
        },
        async loadMrpBoms() {
            this.vista.mrp_boms = []

            this.setQuery()

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.mrp_boms}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.mrp_boms = res.data
            this.vista.table_meta = res.meta
        },

        async loadDatosSistema() {
            const qry = ['mrp_bom_tipos']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.vista, res.data)
        },

        nuevo() {
            const send = {
                mrp_bom: {
                    mrp_bom_socios: [],
                    mrp_bom_lines: [],
                },
            }

            this.useModals.setModal('mMrpBom', 'Nueva lista de materiales', 1, send, true)
        },

        async openConfigFiltros() {
            await this.loadDatosSistema()

            const cols = this.columns
            for (const a of cols) {
                if (a.id == 'tipo') a.lista = this.vista.mrp_bom_tipos
            }

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadMrpBoms,
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },

        runMethod(method, item) {
            this[method](item)
        },
        async editar(item) {
            const qry = {
                incl: ['articulo1'],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.mrp_boms}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const qry1 = {
                fltr: {
                    mrp_bom: { op: 'Es', val: item.id },
                },
                cols: ['articulo', 'cantidad', 'orden'],
                incl: ['articulo1'],
                ordr: [['orden', 'ASC']],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res1 = await get(`${urls.mrp_bom_lines}?qry=${JSON.stringify(qry1)}`)
            this.useAuth.setLoading(false)

            if (res1.code != 0) return

            if (res.code != 0) return

            const qry2 = {
                fltr: {
                    mrp_bom: { op: 'Es', val: item.id },
                },
                cols: ['socio'],
                incl: ['socio1'],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res2 = await get(`${urls.mrp_bom_socios}?qry=${JSON.stringify(qry2)}`)
            this.useAuth.setLoading(false)

            if (res2.code != 0) return

            const send = {
                mrp_bom: {
                    ...res.data,
                    mrp_bom_lines: res1.data,
                    mrp_bom_socios: res2.data,
                },
                articulos_fabricables: [{ ...res.data.articulo1 }],
            }

            for (const a of send.mrp_bom.mrp_bom_lines) {
                send['articulos' + a.id] = [{ ...a.articulo1 }]
            }

            for (const a of send.mrp_bom.mrp_bom_socios) {
                send['socios' + a.id] = [{ ...a.socio1 }]
            }

            this.useModals.setModal('mMrpBom', 'Editar lista de materiales', 2, send, true)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.mrp_boms, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vMrpBom', 'mrp_boms', item)
        },
    },
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: 20rem;
    margin-bottom: 2rem;
}
</style>
