<template>
    <VistaDetalleLayout
        :config="VIEW_CONFIG"
        :pestanas="availableTabs"
        :loadNewData="loadNewData"
        :loadExistingData="loadExistingData"
        @runMethod="runMethod"
    >
        <template #principal-datos>
            <JdSelectQuery
                label="Producto"
                :nec="true"
                v-model="vista.data.articulo"
                :search="loadArticulos"
                :selectedObject="vista.data.articulo1"
                @elegir="elegirArticulo"
                :disabled="vista.mode == 'view'"
                style="grid-column: 1/3"
            />

            <JdInput
                type="date"
                label="Fecha"
                :nec="true"
                v-model="vista.data.fecha"
                :disabled="vista.mode == 'view'"
                style="grid-column: 4/5"
            />

            <JdInput
                type="number"
                label="Cantidad planificada"
                :nec="true"
                v-model="vista.data.cantidad"
                @input="calcularCantidadInsumos"
                :disabled="vista.mode == 'view'"
            />

            <JdSelectQuery
                label="Máquina"
                v-model="vista.data.maquina"
                :search="loadMaquinas"
                :selectedObject="vista.data.maquina1"
                @elegir="elegirMaquina"
                :disabled="vista.mode == 'view'"
                style="grid-column: 4/5"
            />

            <JdSelect
                label="Lista de materiales"
                :lista="vista.mrp_boms"
                mostrar="referencia"
                :loaded="vista.mrp_boms_loaded && vista.data.articulo != null"
                @reload="loadMrpBoms"
                @elegir="elegirMrpBom"
                v-model="vista.data.mrp_bom"
                :disabled="vista.mode == 'view'"
                style="grid-column: 1/3"
            />

            <JdInput
                type="number"
                label="Prioridad"
                v-model="vista.data.orden"
                :disabled="vista.mode == 'view'"
                style="grid-column: 4/5"
            />

            <JdSelectQuery
                label="Responsable"
                :nec="true"
                mostrar="nombres"
                :search="loadColaboradores"
                v-model="vista.data.responsable"
                :selectedObject="vista.data.responsable1"
                :disabled="vista.mode == 'view'"
                style="grid-column: 1/3"
            />

            <JdSelect
                label="Estado"
                :lista="useSystem.data.produccion_orden_estados || []"
                v-model="vista.data.estado"
                :disabled="true"
                style="grid-column: 4/5"
            />

            <JdTextArea
                label="Observación"
                v-model="vista.data.observacion"
                :disabled="vista.mode == 'view'"
                style="grid-column: 1/3"
            />

            <div v-if="vista.data.maquina" style="grid-column: 4/5">
                <p>
                    <small> Velocidad producción: </small>
                    {{ vista.data.maquina_info?.velocidad }} und/min
                </p>
                <p>
                    <small> Tiempo limpieza: </small>
                    {{ vista.data.maquina_info?.limpieza_tiempo }} min
                </p>

                <p>
                    <small>Tiempo de producción:</small>
                    {{ maquinaTiempo }} h<br />
                </p>
            </div>
        </template>

        <template #pestanas-body>
            <vProduccionOrdenInsumos v-if="vista.pestana == 1" />
            <vProduccionOrdenPts v-if="vista.pestana == 2" />
        </template>
    </VistaDetalleLayout>
</template>

<script>
import vProduccionOrdenInsumos from './vProduccionOrdenInsumos.vue'
import vProduccionOrdenPts from './vProduccionOrdenPts.vue'

import VIEW_CONFIG from './produccion_orden.config.js'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { useSystem } from '@/pinia/system'
import { urls, get, post, patch } from '@/utils/crud'
import { incompleteData, redondear } from '@/utils/mine'
import { jmsg } from '@/utils/swal'
import dayjs from 'dayjs'

export default {
    components: {
        vProduccionOrdenInsumos,
        vProduccionOrdenPts,
    },
    data: () => ({
        VIEW_CONFIG,
        useSystem: useSystem(),
        auth: useAuth(),
        vistas: useVistas(),
        modals: useModals(),
    }),
    computed: {
        vista() {
            return this.vistas[this.$route.name]
        },
        availableTabs() {
            return [
                { id: 1, label: 'Insumos', show: true },
                { id: 2, label: 'Productos terminados', show: !this.is_nuevo },
            ]
        },
        is_nuevo() {
            return this.$route.params[this.vista.pathKey] === 'nuevo'
        },
        maquinaTiempo() {
            if (
                !this.vista.data ||
                !this.vista.data.maquina ||
                !this.vista.data.articulo ||
                !this.vista.data.cantidad
            ) {
                return '00:00'
            }

            const tiempo =
                (this.vista.data.cantidad * this.vista.data.articulo_info?.filtrantes) /
                this.vista.data.maquina_info?.velocidad

            return dayjs().startOf('day').add(tiempo, 'minute').format('HH:mm')
        },
    },
    async created() {
        await this.useSystem.load(['produccion_orden_estados'])
    },
    methods: {
        runMethod(method, item) {
            this[method](item)
        },
        async loadNewData() {
            this.vista.data = {
                fecha: dayjs().format('YYYY-MM-DD'),
                estado: 1,
                produccion_orden_insumos: [],
                produccion_orden_pts: [],
            }
        },
        async loadExistingData() {
            const param_id = this.$route.params[this.vista.pathKey]

            const qry = { incl: ['maquina1', 'articulo1', 'mrp_bom1', 'responsable1'] }

            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${param_id}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)

            if (res.code === 0 && res.data) {
                this.vista.data = res.data
                document.title = `OT ${this.vista.data[this.vista.titleKey]}`
            }
        },

        //--- Header actions ---//
        async guardar() {
            if (this.checkDatos()) return

            this.auth.setLoading(true, 'Guardando...')
            let res
            if (this.is_nuevo) {
                res = await post(this.vista.apiUrl, this.vista.data)
            } else {
                res = await patch(this.vista.apiUrl, this.vista.data)
            }
            this.auth.setLoading(false)

            if (res.code != 0) return

            if (this.is_nuevo) {
                this.$router.push({
                    name: this.$route.name,
                    params: { [this.vista.pathKey]: res.data.id },
                })
            }

            this.vista.mode = 'view'
        },

        //--- Methods --//
        checkDatos() {
            const props = ['articulo', 'fecha', 'cantidad', 'responsable']
            if (incompleteData(this.vista.data, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        calcularCantidadInsumos() {
            if (!this.is_nuevo) return

            this.vista.data.produccion_orden_insumos.forEach((a) => {
                a.cantidad = (a.cantidad_receta * this.vista.data.cantidad).toFixed(2)
            })
        },

        //--- auxiliar methods ---//
        async elegirArticulo(a) {
            if (a == null) {
                this.vista.data.articulo_info = {}
                this.vista.data.mrp_bom = null
                this.vista.mrp_boms = []
                this.vista.mrp_bom_lines = []
                return
            }

            this.vista.data.articulo_info = a

            await this.loadMrpBoms()
            if (this.vista.mrp_boms.length > 0) {
                this.vista.data.mrp_bom = this.vista.mrp_boms[0].id
                await this.loadMrpBomLines()
            }
        },
        elegirMaquina(a) {
            if (a == null) {
                this.vista.data.maquina_info = {}
            } else {
                this.vista.data.maquina_info = {
                    id: a.id,
                    velocidad: a.velocidad,
                    limpieza_tiempo: a.limpieza_tiempo,
                }
            }
        },
        async elegirMrpBom(a) {
            if (a == null) {
                this.vista.data.produccion_orden_insumos = []
                return
            }

            this.loadMrpBomLines()
        },

        //--- Auxiliar data ---//
        async loadMaquinas(txt) {
            const qry = {
                fltr: { tipo: { op: 'Es', val: 1 } },
                cols: ['codigo', 'nombre', 'linea', 'velocidad', 'limpieza_tiempo'],
                ordr: [['nombre', 'ASC']],
                limt: 25,
            }

            if (txt) {
                qry.fltr.nombre = { op: 'Contiene', val: txt }
            }

            const res = await get(`${urls.maquinas}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            return res.data
        },
        async loadArticulos(txtBuscar) {
            const qry = {
                fltr: {
                    activo: { op: 'Es', val: true },
                    type: { op: 'Es', val: 'consumable' },
                    produce_ok: { op: 'Es', val: true },
                },
                cols: ['nombre', 'linea', 'filtrantes'],
                ordr: [['nombre', 'ASC']],
                limt: 25,
            }

            if (txtBuscar) {
                qry.fltr.nombre = { op: 'Contiene', val: txtBuscar }
            }

            const res = await get(`${urls.articulos}?qry=${JSON.stringify(qry)}`)

            if (res.code !== 0) return

            return res.data
        },
        async loadMrpBoms() {
            this.vista.mrp_boms = []

            const qry = {
                fltr: {
                    articulo: { op: 'Es', val: this.vista.data.articulo },
                    tipo: { op: 'Es', val: 'fabricar' },
                },
                cols: ['referencia'],
            }

            this.auth.setLoading(true, 'Cargando...')
            this.vista.mrp_boms_loaded = false
            const res = await get(`${urls.mrp_boms}?qry=${JSON.stringify(qry)}`)
            this.vista.mrp_boms_loaded = true
            this.auth.setLoading(false)

            if (res.code != 0) return

            this.vista.mrp_boms = res.data
        },
        async loadMrpBomLines() {
            this.vista.data.produccion_orden_insumos = []

            const qry = {
                fltr: {
                    mrp_bom: { op: 'Es', val: this.vista.data.mrp_bom },
                    tipo: { op: 'Es', val: 'fabricar' },
                },
                cols: ['articulo', 'cantidad', 'orden'],
                incl: ['articulo1'],
                sqls: ['mrp_bom_line_articulo_stock'],
                ordr: [['orden', 'ASC']],
            }

            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.mrp_bom_lines}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)

            if (res.code != 0) return

            this.vista.data.produccion_orden_insumos = res.data.map((a) => {
                return {
                    id: crypto.randomUUID(),
                    tipo: 2,
                    fecha: this.vista.data.fecha,
                    articulo: a.articulo,
                    cantidad: this.vista.data.cantidad
                        ? redondear(a.cantidad * this.vista.data.cantidad)
                        : null,
                    // produccion_orden: this.vista.data.id,
                    maquina: this.vista.data.maquina,

                    tipo1: { id: 2, nombre: 'PRODUCCIÓN SALIDA' },
                    articulo1: a.articulo1,
                    cantidad_receta: a.cantidad,
                    mrp_bom_line_articulo_stock: a.mrp_bom_line_articulo_stock,
                }
            })
        },
        async loadColaboradores(txt) {
            const qry = {
                fltr: {
                    activo: { op: 'Es', val: true },
                },
                cols: ['nombres', 'produccion_codigo'],
                ordr: [['nombres', 'ASC']],
                limt: 25,
            }

            if (txt) {
                qry.fltr.nombres = { op: 'Contiene', val: txt }
            }

            const res = await get(`${urls.colaboradores}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            return res.data
        },
    },
}
</script>
