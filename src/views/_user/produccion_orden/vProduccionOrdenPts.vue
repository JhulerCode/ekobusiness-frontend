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
            :agregarFila="agregarFila"
        />
    </div>
</template>

<script>
import { useSystem } from '@/pinia/system'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { urls, get, post, patch, delet } from '@/utils/crud'
import { redondear, incompleteData, obtenerNumeroJuliano, deepCopy } from '@/utils/mine'
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
                    type: 'text',
                    input: {
                        disabled: (item) => item._state === 'view',
                    },
                    width: '20rem',
                    show: true,
                },
                {
                    id: 'lote1.fv',
                    title: 'F. Vencimiento',
                    type: 'date',
                    input: {
                        disabled: (item) => item._state === 'view',
                    },
                    width: '15rem',
                    show: true,
                },
                {
                    id: 'cantidad',
                    title: 'Cantidad',
                    toRight: true,
                    type: 'number',
                    input: {
                        disabled: (item) => item._state === 'view',
                    },
                    width: '8rem',
                    show: true,
                },
                {
                    id: 'pt_cuarentena',
                    title: 'Estado',
                    prop: 'pt_cuarentena1.nombre',
                    format: 'estado',
                    color: 'pt_cuarentena1.color',
                    width: '9rem',
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
                {
                    icon: 'fa-solid fa-pen-to-square',
                    title: 'Editar',
                    action: 'editLine',
                    ocultar: { _state: ['new', 'edit'] },
                    permiso: 'vProduccionOrdenes:productosTerminadosAprobados',
                },
            ]
        },
        agregarFila() {
            if (this.vista.data.estado == 2) return null
            if (!this.auth.verifyPermiso('vProduccionOrdenes:productosTerminados')) return null
            return this.addLine
        },
    },
    created() {
        const currentId = this.$route.params[this.vista.pathKey]
        if (this.vista._loaded_pts_for !== currentId) {
            const sit = setInterval(() => {
                if (this.vista.data?.id) {
                    clearInterval(sit)
                    this.loadProduccionOrdenPts()
                    this.vista._loaded_pts_for = currentId
                }
            }, 100)
        }

        this.useSystem.load(['kardex_operaciones', 'pt_cuarentena_estados'])
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
                cols: ['tipo', 'fecha', 'articulo', 'lote_id', 'cantidad', 'pt_cuarentena'],
                incl: ['articulo1', 'lote1'],
            }

            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.kardex}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)

            if (res.code !== 0) return

            this.vista.data.produccion_orden_pts = res.data.map((a) => ({
                ...a,
                _state: 'view',
            }))
        },
        async addLine() {
            const tipo1 = this.useSystem.data.kardex_operaciones.find((a) => a.id == 2)
            const pt_cuarentena1 = this.useSystem.data.pt_cuarentena_estados.find(
                (a) => a.id == this.auth.empresa.produccion_pt_cuarentena,
            )

            this.vista.data.produccion_orden_pts.push({
                id: crypto.randomUUID(),
                tipo: 4,
                fecha: this.vista.data.fecha,
                produccion_orden: this.vista.data.id,
                maquina: this.vista.data.maquina,
                articulo: this.vista.data.articulo,
                pt_cuarentena: this.auth.empresa.produccion_pt_cuarentena,

                _state: 'new',
                tipo1,
                lote1: {
                    id: crypto.randomUUID(),
                    articulo: this.vista.data.articulo,
                    codigo: this.elegirLote(),
                    moneda: this.auth.empresa.moneda,
                    tipo_cambio: 1,
                    vu: 1,
                    igv_afectacion: this.vista.data.articulo1.igv_afectacion,
                    igv_porcentaje: this.auth.empresa.igv_porcentaje,
                },
                pt_cuarentena1,
            })

            console.log(this.vista.data.produccion_orden_pts)
        },
        async removeLine(fila) {
            if (fila._state !== 'new') {
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
            this.auth.setLoading(true, 'Guardando...')

            let res
            if (fila._state === 'new') {
                res = await post(urls.kardex, fila)
            } else {
                const send = {
                    id: fila.id,
                    tipo: fila.tipo,
                    cantidad: fila.cantidad,
                    lote_id: fila.lote1.id,
                    lote1: fila.lote1,
                }
                res = await patch(urls.kardex, send)
            }

            this.auth.setLoading(false)

            if (res.code != 0) return

            const i = this.vista.data.produccion_orden_pts.findIndex((a) => a.id == fila.id)
            this.vista.data.produccion_orden_pts[i]._state = 'view'
            if (this.vista.data.produccion_orden_pts[i]._backup) {
                delete this.vista.data.produccion_orden_pts[i]._backup
            }
        },
        editLine(fila) {
            const i = this.vista.data.produccion_orden_pts.findIndex((a) => a.id == fila.id)
            this.vista.data.produccion_orden_pts[i]._backup = deepCopy(fila)
            this.vista.data.produccion_orden_pts[i]._state = 'edit'
        },
        cancelEditLine(fila) {
            const i = this.vista.data.produccion_orden_pts.findIndex((a) => a.id == fila.id)
            if (this.vista.data.produccion_orden_pts[i]._backup) {
                Object.assign(
                    this.vista.data.produccion_orden_pts[i],
                    this.vista.data.produccion_orden_pts[i]._backup,
                )
                delete this.vista.data.produccion_orden_pts[i]._backup
            }
            this.vista.data.produccion_orden_pts[i]._state = 'view'
        },

        //--- methods ---//
        elegirLote() {
            return `${obtenerNumeroJuliano(this.vista.data.fecha)}-${Math.floor(Math.random() * 90 + 10)}`
        },
        checkDatos(fila) {
            const props = ['articulo', 'lote1.codigo', 'cantidad']

            if (this.vista.data.articulo1.has_fv) {
                props.push('lote1.fv')
            }

            if (incompleteData(fila, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
    },
}
</script>
