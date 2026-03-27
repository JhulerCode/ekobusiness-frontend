<template>
    <div class="pedido-items">
        <div class="mrg-btm1" v-if="!is_nuevo">
            <JdButton
                icon="fa-solid fa-rotate-right"
                text="Recargar"
                tipo="2"
                :small="true"
                @click="loadProduccionOrdenInsumos"
            />
        </div>

        <JdTable
            :columns="columns"
            :datos="vista.data.produccion_orden_insumos || []"
            colActWidth="5rem"
            :rowOptions="rowActions"
            rowOptionsMode="buttons"
            @rowOptionSelected="runMethod"
            @onChange="runMethod"
            :agregarFila="vista.data.estado == 2 ? null : addLine"
        />
    </div>
</template>

<script>
import { useSystem } from '@/pinia/system'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { urls, get, post, delet } from '@/utils/crud'
import { redondear, incompleteData } from '@/utils/mine'
import { jmsg, jqst } from '@/utils/swal'

export default {
    data: () => ({
        useSystem: useSystem(),
        auth: useAuth(),
        vistas: useVistas(),
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
                    show: true,
                },
                {
                    id: 'articulo',
                    title: 'Artículo',
                    width: '30rem',
                    input: !this.is_nuevo,
                    prop: 'articulo1.nombre',
                    select_query: {
                        search: this.loadArticulos,
                        elegir: this.elegirArticulo,
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
                    input: !this.is_nuevo,
                    toRight: true,
                    onchange: 'setLineEditingTrue',
                    text: {
                        toRight: true,
                    },
                    width: '8rem',
                    show: true,
                },
                {
                    id: 'lote_id',
                    title: 'Lote | Fv | Stock',
                    input: true,
                    select_query: {
                        search: this.loadLotes,
                        mostrar: 'lote_fv_stock',
                        elegir: this.elegirLote,
                        selectedObjectProp: 'lote1',
                        // disabled: (item) => item.is_new != true,
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
            if (this.vista.data.estado == 2) return []

            return [
                {
                    icon: 'fa-solid fa-trash-can',
                    title: 'Eliminar',
                    action: 'removeLine',
                },
                // {
                //     icon: 'fa-solid fa-rotate-left',
                //     title: 'Devolución',
                //     action: 'devolver',
                //     ocultar: { is_editing: true, tipo: 3 },
                // },
                {
                    icon: 'fa-solid fa-floppy-disk',
                    title: 'GUardar',
                    action: 'saveLine',
                    ocultar: { is_editing: false },
                },
            ]
        },
    },
    created() {
        if (this.vista.last_path != this.$route.fullPath) {
            const sit = setInterval(() => {
                if (this.vista.data?.id) {
                    clearInterval(sit)
                    this.loadProduccionOrdenInsumos()
                }
            }, 100)
        }
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
                is_editing: false,
            }))
        },
        async addLine() {
            this.vista.data.produccion_orden_insumos.push({
                id: crypto.randomUUID(),
                tipo: 2,
                fecha: this.vista.data.fecha,
                produccion_orden: this.vista.data.id,
                maquina: this.vista.data.maquina,

                is_editing: true,
                is_new: true,
                tipo1: { id: 2, nombre: 'PRODUCCIÓN SALIDA' },
            })
        },
        async removeLine(fila) {
            if (!fila.is_new) {
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
            // console.log(fila)
            this.auth.setLoading(true, 'Cargando...')

            let res
            // if (fila.is_new) {
            res = await post(urls.kardex, fila)
            // } else {
            //     res = await patch(urls.kardex, fila)
            // }

            this.auth.setLoading(false)

            if (res.code != 0) return

            const i = this.vista.data.produccion_orden_insumos.findIndex((a) => a.id == fila.id)
            this.vista.data.produccion_orden_insumos[i].is_editing = false
            this.vista.data.produccion_orden_insumos[i].is_new = false
        },

        //--- methods ---//
        setLineEditingTrue(fila) {
            const i = this.vista.data.produccion_orden_insumos.findIndex((a) => a.id == fila.id)
            this.vista.data.produccion_orden_insumos[i].is_editing = true
        },
        elegirArticulo(data, fila) {
            const i = this.vista.data.produccion_orden_insumos.findIndex((a) => a.id == fila.id)
            this.vista.data.produccion_orden_insumos[i].is_editing = true
            this.vista.data.produccion_orden_insumos[i].articulo1 = data
        },
        elegirLote(data, fila) {
            const i = this.vista.data.produccion_orden_insumos.findIndex((a) => a.id == fila.id)
            this.vista.data.produccion_orden_insumos[i].is_editing = true
            this.vista.data.produccion_orden_insumos[i].lote1 = data
        },
        checkDatos(fila) {
            const props = ['articulo', 'cantidad', 'lote_id']

            if (incompleteData(fila, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            if (!fila.lote1 || fila.lote1.stock < fila.cantidad) {
                jmsg('warning', 'Cantidad mayor al stock')
                return true
            }

            return false
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
                cols: ['codigo', 'fv', 'stock', 'lote_fv_stock', 'lote_fv'],
                fltr: {
                    articulo: { op: 'Es', val: item.articulo },
                },
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
