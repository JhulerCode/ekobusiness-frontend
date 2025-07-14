<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Productos en cuarentena</strong>

            <div class="buttons">
            </div>
        </div>

        <JdTable :name="tableName" :columns="columns" :datos="vista.articulos || []" :colAct="true"
            :configFiltros="openConfigFiltros" :reload="loadProductosCuarentena" :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod">
            <!-- <template v-slot:cCantidad="{ item }">
                {{ redondear(item.cantidad, 0) }}
                <JdInput type="number" v-model="item.cantidad_real" />
            </template> -->
        </JdTable>
    </div>

    <mFormato v-if="useModals.show.mFormato" @created="setLoteAprobado" />
    
    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
// import JdModal from '@/components/JdModal.vue'
// import JdInput from '@/components/inputs/JdInput.vue'
import JdTable from '@/components/JdTable.vue'
import mConfigFiltros from '@/components/mConfigFiltros.vue'

import mFormato from '../calidad/formatos/mFormato.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get } from '@/utils/crud'
// import { jmsg } from '@/utils/swal'
import { redondear } from '@/utils/mine'
// import { produccion_tipos, maquinas } from '@/data/sistema_listas'

import dayjs from 'dayjs'

export default {
    components: {
        // JdModal,
        // JdInput,
        JdTable,
        mConfigFiltros,

        mFormato,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),
        dayjs,
        redondear,

        vista: {},

        tableName: 'vProduccionCuarentena',
        columns: [
            {
                id: 'produccionOrden_fecha',
                title: 'Fecha',
                type: 'date',
                prop: 'produccion_orden1.fecha',
                format: 'date',
                width: '7rem',
                show: true,
                seek: true,
            },
            {
                id: 'produccionOrden_tipo',
                title: 'Tipo',
                type: 'select',
                prop: 'produccion_orden1.tipo1.nombre',
                width: '8rem',
                show: true,
                seek: true,
            },
            {
                id: 'produccionOrden_maquina',
                title: 'Máquina',
                type: 'select',
                prop: 'produccion_orden1.maquina1.nombre',
                width: '7rem',
                show: true,
                seek: true,
            },
            {
                id: 'produccionOrden_articulo',
                title: 'Articulo',
                type: 'text',
                prop: 'produccion_orden1.articulo1.nombre',
                width: '25rem',
                show: true,
                seek: true,
            },
            {
                id: 'lote',
                title: 'Lote',
                tipe: 'text',
                width: '7rem',
                show: true,
                seek: true,
            },
            {
                id: 'fv',
                title: 'F. vencimiento',
                tipe: 'date',
                format: 'date',
                width: '7rem',
                show: true,
                seek: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                tipe: 'number',
                format: 'number',
                toRight: true,
                width: '7rem',
                show: true
            },
        ],
        tableRowOptions: [
            { label: 'Liberación de lote', icon: 'fa-solid fa-star', action: 'liberarLote', permiso: 'vProductosCuarentena:liberar_lote' },
        ],
    }),
    created() {
        this.vista = this.useVistas.vProductosCuarentena
        this.initFiltros()
        this.useAuth.setColumns(this.tableName, this.columns)
        
        if (this.vista.loaded) return
        if (this.useAuth.verifyPermiso('vProductosCuarentena:listar') == true) this.loadProductosCuarentena()
    },
    methods: {
        initFiltros() {
            this.columns[0].op = 'Está dentro de'
            this.columns[0].val = dayjs().startOf('month').format('YYYY-MM-DD')
            this.columns[0].val1 = dayjs().format('YYYY-MM-DD')
        },
        setQuery() {
            this.vista.qry = {
                fltr: {}
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
        },
        async loadProductosCuarentena() {
            this.setQuery()
            // const qry = {
            //     fltr: {},
            //     cols: ['lote', 'fv', 'cantidad', 'produccion_orden', 'cf_liberacion_lote'],
            // }

            this.vista.articulos = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.cuarentena_productos}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.articulos = res.data
        },

        async openConfigFiltros() {
            // await this.loadDatosSistema()
            // await this.loadMaquinas()

            const cols = this.columns
            cols.find(a => a.id == 'produccionOrden_tipo').lista = this.vista.produccion_tipos
            cols.find(a => a.id == 'produccionOrden_maquina').lista = this.vista.maquinas

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadProductosCuarentena
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },

        runMethod(method, item) {
            this[method](item)
        },
        async liberarLote(item) {
            const formato_id = 'RE-BPM-26'

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.formatos}/uno/${formato_id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const formato_name = res.data.nombre

            this.useAuth.setLoading(true, 'Cargando...')
            const res1 = await get(`${urls.formato_values}/uno/${item.cf_liberacion_lote}`)
            this.useAuth.setLoading(false)

            if (res1.code != 0) return

            if (res1.data == null) {
                const send = {
                    cuarentena_producto: item.id,
                    cuarentena_producto1: { ...item },
                    formato: {
                        codigo: res.data.id,
                        columns: res.data.columns,
                        instructivo: res.data.instructivo
                    }
                }

                this.useModals.setModal('mFormato', `${formato_id} ${formato_name}`, 1, send, true)
            }
            else {
                for (const a of res.data.columns) {
                    a.value = res1.data[a.id]
                }

                const send = {
                    cuarentena_producto: item.id,
                    cuarentena_producto1: res1.data.cuarentena_producto1,
                    formato: {
                        id: res1.data.id,
                        codigo: res.data.id,
                        columns: res.data.columns,
                        instructivo: res.data.instructivo
                    }
                }

                this.useModals.setModal('mFormato', `${formato_id} ${formato_name}`, 2, send, true)
            }
        },
        setLoteAprobado(item){
            const cuanrentena_producto = this.vista.articulos.find(a => a.id == item.cuarentena_producto)
            cuanrentena_producto.cf_liberacion_lote = item.id
        },

        async loadDatosSistema() {
            const qry = ['produccion_tipos']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.vista, res.data)
        },
        async loadMaquinas() {
            const qry = {
                fltr: {},
                cols: ['codigo', 'nombre', 'produccion_tipo', 'velocidad', 'limpieza_tiempo'],
            }

            this.vista.maquinas = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.maquinas}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.vista.maquinas = res.data
        },
    }
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: 20rem;
    margin-bottom: 2rem;
}
</style>