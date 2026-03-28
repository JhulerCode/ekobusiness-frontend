<template>
    <div class="pedido-items">
        <div class="mrg-btm1">
            <JdButton
                icon="fa-solid fa-rotate-right"
                text="Recargar"
                tipo="3"
                @click="loadProduccionOrdenPts"
            />
        </div>

        <JdTable
            :columns="columns"
            :datos="vista.data.produccion_orden_pts || []"
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
import { redondear, incompleteData, obtenerNumeroJuliano } from '@/utils/mine'
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
        columns() {
            return [
                {
                    id: 'lote1.codigo',
                    title: 'Lote',
                    input: true,
                    text: {
                        disabled: (item) => !item.is_new,
                    },
                    width: '20rem',
                    show: true,
                },
                {
                    id: 'lote1.fv',
                    title: 'F. Vencimiento',
                    input: true,
                    date: {
                        disabled: (item) => !item.is_new,
                    },
                    width: '15rem',
                    show: true,
                },
                {
                    id: 'cantidad',
                    title: 'Cantidad',
                    toRight: true,
                    input: true,
                    number: {
                        disabled: (item) => !item.is_new,
                        toRight: true,
                    },
                    width: '8rem',
                    show: true,
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
                    this.loadProduccionOrdenPts()
                }
            }, 100)
        }
    },
    methods: {
        runMethod(method, item) {
            this[method](item)
        },
        async loadProduccionOrdenPts() {
            this.vista.data.produccion_orden_pts = []

            const qry = {
                fltr: {
                    produccion_orden: { op: 'Es', val: this.$route.params[this.vista.pathKey] },
                    tipo: { op: 'Es', val: 4 },
                },
                cols: ['tipo', 'fecha', 'articulo', 'lote_id', 'cantidad'],
                incl: ['articulo1', 'lote1'],
            }

            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.kardex}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)

            if (res.code !== 0) return

            this.vista.data.produccion_orden_pts = res.data.map((a) => ({
                ...a,
                is_editing: false,
            }))
        },
        async addLine() {
            this.vista.data.produccion_orden_pts.push({
                id: crypto.randomUUID(),
                tipo: 4,
                fecha: this.vista.data.fecha,
                produccion_orden: this.vista.data.id,
                maquina: this.vista.data.maquina,
                articulo: this.vista.data.articulo,

                is_editing: true,
                is_new: true,
                tipo1: { id: 2, nombre: 'PRODUCCIÓN SALIDA' },
                lote1: {
                    id: crypto.randomUUID(),
                    articulo: this.vista.data.articulo,
                    codigo: this.setLote(),
                },
            })
        },
        async removeLine(fila) {
            if (!fila.is_new) {
                const resQst = await jqst('¿Está seguro de eliminar?')
                if (resQst.isConfirmed == false) return

                const send = {
                    id: fila.id,
                    tipo: fila.tipo,
                    lote_id: fila.lote1.id,
                    cantidad: fila.cantidad,
                }

                this.auth.setLoading(true, 'Eliminando...')
                const res = await delet(urls.kardex, send)
                this.auth.setLoading(false)

                if (res.code != 0) return
            }

            const i = this.vista.data.produccion_orden_pts.findIndex((a) => a.id == fila.id)
            this.vista.data.produccion_orden_pts.splice(i, 1)
        },
        async saveLine(fila) {
            if (this.checkDatos(fila)) return
            // console.log(fila)
            this.auth.setLoading(true, 'Cargando...')

            const send = { ...fila, lote_id: fila.lote1.id }
            let res
            // if (fila.is_new) {
            res = await post(urls.kardex, send)
            // } else {
            //     res = await patch(urls.kardex, send)
            // }

            this.auth.setLoading(false)

            if (res.code != 0) return

            const i = this.vista.data.produccion_orden_pts.findIndex((a) => a.id == fila.id)
            this.vista.data.produccion_orden_pts[i].is_editing = false
            this.vista.data.produccion_orden_pts[i].is_new = false
        },

        //--- methods ---//
        // setEditingTrue(fila) {
        //     const i = this.vista.data.produccion_orden_pts.findIndex((a) => a.id == fila.id)
        //     this.vista.data.produccion_orden_pts[i].is_editing = true
        // },
        setLote() {
            return `${obtenerNumeroJuliano(this.vista.data.fecha)}-${Math.floor(Math.random() * 90 + 10)}`
        },
        checkDatos(fila) {
            const props = ['articulo', 'cantidad']

            if (incompleteData(fila, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
    },
}
</script>
