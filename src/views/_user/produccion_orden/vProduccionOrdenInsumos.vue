<template>
    <div class="pedido-items">
        <div class="agregar" v-if="!is_nuevo">
            <JdButton
                icon="fa-solid fa-rotate-right"
                text="Recargar"
                tipo="3"
                @click="loadProduccionOrdenInsumos"
            />

            <JdButton
                icon="fa-solid fa-list-ul"
                text="Lista de materiales"
                tipo="3"
                @click="openMrpBomLines"
                v-if="vista.data.mrp_bom && vista.data.estado == 1"
            />
        </div>

        <JdTable
            :columns="columns"
            :datos="vista.data.produccion_orden_insumos || []"
            colActWidth="5rem"
            :rowOptions="rowActions"
            rowOptionsMode="buttons"
            @rowOptionSelected="runMethod"
            :agregarFila="agregarFila"
        />
    </div>

    <mMrpBomLines v-if="modals?.show?.mMrpBomLines" @sendItems="agregarFromBomLines" />
    <mProduccionInsumosDevolucion
        v-if="modals?.show?.mProduccionInsumosDevolucion"
        @devuelto="devuelto"
    />
</template>

<script>
import mMrpBomLines from './mMrpBomLines.vue'
import mProduccionInsumosDevolucion from '../produccion_ordenes/mProduccionInsumosDevolucion.vue'

import { useSystem } from '@/pinia/system'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls, get, post, patch, delet } from '@/utils/crud'
import { redondear, incompleteData, deepCopy } from '@/utils/mine'
import { jmsg, jqst } from '@/utils/swal'

export default {
    components: { mMrpBomLines, mProduccionInsumosDevolucion },
    data: () => ({
        useSystem: useSystem(),
        auth: useAuth(),
        vistas: useVistas(),
        modals: useModals(),
        redondear,
    }),
    computed: {
        vista() {
            return this.vistas[this.$route.name]
        },
        is_nuevo() {
            return this.$route.params[this.vista.pathKey] === 'nuevo'
        },
        columns() {
            return [
                {
                    id: 'tipo',
                    title: 'Tipo',
                    prop: 'tipo1.nombre',
                    width: '13rem',
                    show: !this.is_nuevo,
                },
                {
                    id: 'articulo',
                    title: 'Artículo',
                    prop: 'articulo1.nombre',
                    width: '30rem',
                    type: 'select_query',
                    input: {
                        search: this.loadArticulos,
                        elegir: this.elegirArticulo,
                        disabled: (item) => item._state === 'view' || this.is_nuevo,
                        selectedObjectProp: 'articulo1',
                    },
                    show: true,
                },
                {
                    id: 'unidad',
                    title: 'Unidad',
                    prop: 'articulo1.unidad',
                    width: '5rem',
                    show: true,
                },
                {
                    id: 'cantidad',
                    title: 'Cantidad',
                    type: 'number',
                    toRight: true,
                    input: {
                        disabled: (item) => item._state === 'view' || this.is_nuevo,
                    },
                    width: '8rem',
                    show: true,
                },
                {
                    id: 'lote_id',
                    title: 'Lote | Fv | Stock',
                    type: 'select_query',
                    input: {
                        search: this.loadLotes,
                        mostrar: (item) => (item._state === 'view' ? 'lote_fv' : 'codigo_fv_stock'),
                        elegir: this.elegirLote,
                        disabled: (item) => item._state === 'view',
                        selectedObjectProp: 'lote1',
                    },
                    width: '22rem',
                    show: !this.is_nuevo,
                },
                {
                    id: 'mrp_bom_line_articulo_stock',
                    title: 'Stock',
                    width: '8rem',
                    toRight: true,
                    show: this.is_nuevo,
                },
            ]
        },
        rowActions() {
            if (this.is_nuevo) return []
            if (this.vista.data.estado == 2) return []

            return [
                {
                    icon: 'fa-solid fa-trash-can',
                    title: 'Eliminar',
                    action: 'removeLine',
                    ocultar: { _state: 'edit' },
                },
                {
                    icon: 'fa-solid fa-xmark',
                    title: 'Cancelar',
                    action: 'cancelEditLine',
                    ocultar: { _state: ['new', 'view'] },
                },
                {
                    icon: 'fa-solid fa-floppy-disk',
                    title: 'Guardar',
                    action: 'saveLine',
                    ocultar: { _state: 'view' },
                },
                // {
                //     icon: 'fa-solid fa-pen-to-square',
                //     title: 'Editar',
                //     action: 'editLine',
                //     ocultar: { _state: ['new', 'edit'] },
                // },
                {
                    icon: 'fa-solid fa-rotate-left',
                    title: 'Devolución',
                    action: 'devolucion',
                    ocultar: { tipo: 3, _state: 'new' },
                },
            ]
        },
        agregarFila() {
            if (this.is_nuevo) return null
            if (this.vista.data.estado == 2) return null
            if (!this.auth.verifyPermiso('vProduccionOrdenes:salidaInsumos')) return null
            return this.addLine
        },
    },
    created() {
        const currentId = this.$route.params[this.vista.pathKey]
        if (currentId === 'nuevo') return
        if (this.vista._loaded_insumos_for === currentId) return
        const sit = setInterval(() => {
            if (this.vista.data?.id) {
                clearInterval(sit)
                this.loadProduccionOrdenInsumos()
                this.vista._loaded_insumos_for = currentId
            }
        }, 100)
    },
    methods: {
        runMethod(method, item) {
            this[method](item)
        },
        async loadProduccionOrdenInsumos() {
            this.vista.data.produccion_orden_insumos = []

            const qry = {
                fltr: {
                    produccion_orden: { op: 'Es', val: this.$route.params[this.vista.pathKey] },
                    tipo: { op: 'Es', val: [2, 3] },
                },
                cols: ['tipo', 'fecha', 'articulo', 'lote_id', 'cantidad'],
                incl: ['articulo1', 'lote1'],
            }

            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.kardex}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)

            if (res.code !== 0) return

            this.vista.data.produccion_orden_insumos = res.data.map((a) => ({
                ...a,
                _state: 'view',
            }))
        },
        async addLine() {
            this.vista.data.produccion_orden_insumos.push({
                id: crypto.randomUUID(),
                tipo: 2,
                fecha: this.vista.data.fecha,
                produccion_orden: this.vista.data.id,
                maquina: this.vista.data.maquina,

                _state: 'new',
                tipo1: { id: 2, nombre: 'PRODUCCIÓN SALIDA' },
            })
        },
        async removeLine(fila) {
            if (fila._state !== 'new') {
                const resQst = await jqst('¿Está seguro de eliminar?')
                if (resQst.isConfirmed == false) return

                const send = {
                    id: fila.id,
                    tipo: fila.tipo,
                    lote_id: fila.lote_id,
                    cantidad: fila.cantidad,
                }

                this.auth.setLoading(true, 'Eliminando...')
                const res = await delet(urls.kardex, send)
                this.auth.setLoading(false)

                if (res.code != 0) return
            }

            const i = this.vista.data.produccion_orden_insumos.findIndex((a) => a.id == fila.id)
            this.vista.data.produccion_orden_insumos.splice(i, 1)
        },
        async saveLine(fila) {
            if (this.checkDatos(fila)) return
            this.auth.setLoading(true, 'Guardando...')

            let res
            if (fila._state === 'new') {
                res = await post(urls.kardex, fila)
            } else {
                const send = {
                    id: fila.id,
                    tipo: fila.tipo,
                    articulo: fila.articulo,
                    cantidad: fila.cantidad,
                    lote_id: fila.lote1.id,
                    lote1: fila.lote1,
                }
                res = await patch(urls.kardex, send)
            }

            this.auth.setLoading(false)

            if (res.code != 0) return

            const i = this.vista.data.produccion_orden_insumos.findIndex((a) => a.id == fila.id)
            this.vista.data.produccion_orden_insumos[i]._state = 'view'
            if (this.vista.data.produccion_orden_insumos[i]._backup) {
                delete this.vista.data.produccion_orden_insumos[i]._backup
            }
        },
        editLine(fila) {
            const i = this.vista.data.produccion_orden_insumos.findIndex((a) => a.id == fila.id)
            this.vista.data.produccion_orden_insumos[i]._backup = deepCopy(fila)
            this.vista.data.produccion_orden_insumos[i]._state = 'edit'
        },
        cancelEditLine(fila) {
            const i = this.vista.data.produccion_orden_insumos.findIndex((a) => a.id == fila.id)
            if (this.vista.data.produccion_orden_insumos[i]._backup) {
                Object.assign(
                    this.vista.data.produccion_orden_insumos[i],
                    this.vista.data.produccion_orden_insumos[i]._backup,
                )
                delete this.vista.data.produccion_orden_insumos[i]._backup
            }
            this.vista.data.produccion_orden_insumos[i]._state = 'view'
        },
        async devolucion(item) {
            const send = {
                transaccion: {
                    tipo: 3,
                    fecha: item.fecha,
                    maquina: item.maquina,
                    articulo: item.articulo,
                    lote_id: item.lote_id,
                },
                articulo: { ...item.articulo1 },
            }

            this.modals.setModal('mProduccionInsumosDevolucion', 'Devolución', 1, send, true)
        },

        //--- methods ---//
        elegirArticulo(data, fila) {
            const i = this.vista.data.produccion_orden_insumos.findIndex((a) => a.id == fila.id)
            this.vista.data.produccion_orden_insumos[i].articulo1 = data

            this.vista.data.produccion_orden_insumos[i].lote_id = null
            this.vista.data.produccion_orden_insumos[i].lote1 = null
        },
        elegirLote(data, fila) {
            const i = this.vista.data.produccion_orden_insumos.findIndex((a) => a.id == fila.id)
            this.vista.data.produccion_orden_insumos[i].lote_id = data.id
            this.vista.data.produccion_orden_insumos[i].lote1 = data
        },
        checkDatos(fila) {
            const props = ['articulo', 'cantidad', 'lote_id']

            if (incompleteData(fila, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            if (!fila.lote1 || fila.lote1.lote_stock < fila.cantidad) {
                jmsg('warning', 'Cantidad mayor al stock')
                return true
            }

            return false
        },

        //--- auxiliar methods ---/
        openMrpBomLines() {
            const send = {
                mrp_bom: this.vista.data.mrp_bom,
            }
            this.modals.setModal('mMrpBomLines', 'Lista de materiales', null, send, true)
        },
        agregarFromBomLines(items) {
            for (const a of items) {
                this.vista.data.produccion_orden_insumos.push({
                    id: crypto.randomUUID(),
                    tipo: 2,
                    fecha: this.vista.data.fecha,
                    articulo: a.articulo,
                    articulo1: a.articulo1,
                    cantidad: (a.cantidad * this.vista.data.cantidad).toFixed(2),
                    produccion_orden: this.vista.data.id,
                    maquina: this.vista.data.maquina,

                    _state: 'new',
                    tipo1: { id: 2, nombre: 'PRODUCCIÓN SALIDA' },
                })
            }
        },
        devuelto(item) {
            this.vista.data.produccion_orden_insumos.unshift({ ...item, _state: 'view' })
        },

        //--- Auxiliar data ---//
        async loadArticulos(txtBuscar) {
            const qry = {
                fltr: {
                    activo: { op: 'Es', val: true },
                    type: { op: 'Es', val: 'consumable' },
                },
                cols: ['nombre', 'unidad'],
                ordr: [['nombre', 'ASC']],
                limt: 25,
            }

            if (txtBuscar) {
                qry.fltr.nombre = { op: 'Contiene', val: txtBuscar }
            }

            const res = await get(`${urls.articulos}?qry=${JSON.stringify(qry)}`)

            if (res.code !== 0) return []
            return res.data
        },
        async loadLotes(txt, item) {
            const qry = {
                incl: ['kardexes_for_sqls'],
                cols: ['codigo', 'fv', 'codigo_fv_stock'],
                sqls: ['lote_stock'],
                fltr: {
                    articulo: { op: 'Es', val: item.articulo },
                },
                grop: ['id'],
                ordr: [
                    ['createdAt', 'DESC'],
                    ['codigo', 'DESC'],
                    ['fv', 'DESC'],
                ],
                limt: 25,
            }

            if (txt) {
                qry.fltr.codigo = { op: 'Contiene', val: txt }
            }

            const res = await get(`${urls.lotes}?qry=${JSON.stringify(qry)}`)

            if (res.code !== 0) return

            return res.data
        },
    },
}
</script>

<style lang="scss" scoped>
.agregar {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
}
</style>
