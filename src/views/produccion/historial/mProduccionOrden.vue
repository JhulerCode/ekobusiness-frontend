<template>
    <JdModal modal="mProduccionOrden" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <JdInput
                type="date"
                label="Fecha"
                :nec="true"
                v-model="modal.produccion_orden.fecha"
                :disabled="modal.mode == 3"
                style="grid-column: 1/3"
            />

            <template v-if="modal.maquinas && modal.maquinas.length > 0">
                <JdSelect
                    label="Máquina"
                    :nec="true"
                    v-model="modal.produccion_orden.maquina"
                    :lista="
                        modal.maquinas?.filter((a) => a.linea == modal.produccion_orden.linea) || []
                    "
                    :loaded="modal.maquinas_loaded"
                    @reload="loadMaquinas"
                    @elegir="setMaquina"
                    :disabled="modal.mode == 3"
                    style="grid-column: 1/3"
                />

                <div>
                    <small>
                        VP: {{ modal.produccion_orden.maquina_info?.velocidad }} und/min
                    </small>
                    <br />
                    <small>
                        TL: {{ modal.produccion_orden.maquina_info?.limpieza_tiempo }} min
                    </small>
                </div>

                <p
                    v-if="modal.maquinas && modal.maquinas.length > 0"
                    style="grid-column: 4/5; text-align: right"
                >
                    <small>Tiempo de producción:</small>
                    {{ setTiempo() }} <br />
                </p>
            </template>

            <JdSelectQuery
                label="Producto"
                :nec="true"
                v-model="modal.produccion_orden.articulo"
                :spin="spinArticulos"
                :lista="modal.articulos"
                @search="searchArticulos"
                @elegir="setArticulo"
                :disabled="modal.mode == 3"
                style="grid-column: 1/4"
            />

            <JdInput
                type="number"
                label="Cantidad planificada"
                :nec="true"
                v-model="modal.produccion_orden.cantidad"
                :disabled="modal.mode == 3"
                style="grid-column: 1/3"
            />

            <JdSelect
                label="Lista de materiales"
                :nec="true"
                :lista="modal.mrp_boms"
                mostrar="referencia"
                :loaded="modal.mrp_boms_loaded && modal.produccion_orden.articulo != null"
                @reload="loadMrpBoms"
                @elegir="setMrpBom"
                v-model="modal.produccion_orden.mrp_bom"
                :disabled="modal.mode == 3"
                style="grid-column: 1/4"
            />

            <JdInput
                type="number"
                label="Prioridad"
                :nec="true"
                v-model="modal.produccion_orden.orden"
                :disabled="modal.mode == 3"
                style="grid-column: 1/2"
            />

            <JdSelect
                label="Responsable"
                :nec="true"
                :lista="modal.colaboradores"
                mostrar="nombres_apellidos"
                :loaded="modal.colaboradores_loaded && modal.produccion_orden.articulo != null"
                @reload="loadColaboradores"
                v-model="modal.produccion_orden.responsable"
                :disabled="modal.mode == 3"
                style="grid-column: 1/4"
            />

            <small v-if="responsable?.produccion_codigo"
                >Código: {{ responsable?.produccion_codigo }}</small
            >

            <JdTextArea
                label="Observación"
                v-model="modal.produccion_orden.observacion"
                :disabled="modal.mode == 3"
                style="grid-column: 1/4"
            />
        </div>

        <div class="mrg-btm1">
            <JdButton text="Comprobar disponibilidad" tipo="2" @click="loadStock" />
        </div>

        <JdTable
            :columns="columns1"
            :datos="insumos_necesitados"
            :seeker="false"
            :download="false"
            class="jd-table"
        >
            <template v-slot:colStock="{ item }">
                <span
                    :class="{
                        falta: item.stock < item.cantidad_necesitada,
                    }"
                >
                    {{ redondear(item.stock) }}
                </span>
            </template>
        </JdTable>
    </JdModal>
</template>

<script>
import {
    JdModal,
    JdInput,
    JdSelect,
    JdSelectQuery,
    JdTextArea,
    JdTable,
    JdButton,
} from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, post, patch } from '@/utils/crud'
import { incompleteData, redondear } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

import dayjs from 'dayjs'

export default {
    components: {
        JdModal,
        JdInput,
        JdSelect,
        JdSelectQuery,
        JdTextArea,
        JdTable,
        JdButton,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),
        dayjs,
        redondear,

        modal: {},

        spinArticulos: false,
        tipoPrograma: {
            1: 'vProgramaFiltrantes',
            2: 'vProgramaGranel',
            3: 'vProgramaLuxury',
        },

        buttons: [
            { text: 'Grabar', action: 'crear', spin: false },
            { text: 'Actualizar', action: 'modificar', spin: false },
        ],

        columns1: [
            {
                id: 'articulo',
                title: 'Nombre',
                prop: 'articulo1.nombre',
                width: '25rem',
                show: true,
            },
            {
                id: 'cantidad_necesitada',
                title: 'Cantidad requerida',
                toRight: true,
                format: 'decimal',
                width: '8rem',
                show: true,
            },
            {
                title: 'Stock',
                toRight: true,
                slot: 'colStock',
                width: '8rem',
                show: true,
            },
        ],
    }),
    computed: {
        insumos_necesitados() {
            if (!this.modal.mrp_bom_lines || this.modal.mrp_bom_lines.length == 0) return []

            return this.modal.mrp_bom_lines.map((a) => ({
                ...a,
                cantidad_necesitada: a.cantidad * (this.modal.produccion_orden.cantidad || 0),
            }))
        },
        responsable() {
            return this.modal.colaboradores.find(
                (a) => a.id == this.modal.produccion_orden.responsable,
            )
        },
    },
    created() {
        this.modal = this.useModals.mProduccionOrden

        this.showButtons()

        if (this.modal.produccion_orden.mrp_bom) {
            this.loadMrpBomLines()
        }

        this.loadColaboradores()
    },
    methods: {
        showButtons() {
            if (this.useModals.mProduccionOrden.mode == 1) {
                this.buttons[0].show = true
            } else if (this.useModals.mProduccionOrden.mode == 2) {
                this.buttons[1].show = true
            }
        },

        async loadMaquinas() {
            const qry = {
                fltr: {},
                cols: ['codigo', 'nombre', 'linea', 'velocidad', 'limpieza_tiempo'],
                ordr: [['nombre', 'ASC']],
            }

            this.modal.maquinas = []
            this.useAuth.setLoading(true, 'Cargando...')
            this.modal.maquinas_loaded = false
            const res = await get(`${urls.maquinas}?qry=${JSON.stringify(qry)}`)
            this.modal.maquinas_loaded = true
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.maquinas = res.data
        },
        async searchArticulos(txtBuscar) {
            if (!txtBuscar) {
                this.modal.articulos.length = 0
                return
            }

            const qry = {
                fltr: {
                    activo: { op: 'Es', val: true },
                    nombre: { op: 'Contiene', val: txtBuscar },
                    type: { op: 'Es', val: 'consumable' },
                    produce_ok: { op: 'Es', val: true },
                },
                cols: ['nombre', 'linea', 'filtrantes'],
                ordr: [['nombre', 'ASC']],
            }

            this.spinArticulos = true
            const res = await get(`${urls.articulos}?qry=${JSON.stringify(qry)}`)
            this.spinArticulos = false

            if (res.code !== 0) return

            this.modal.articulos = JSON.parse(JSON.stringify(res.data))
        },
        async loadColaboradores() {
            this.modal.colaboradores = []

            const qry = {
                fltr: {
                    activo: { op: 'Es', val: true },
                },
                cols: ['nombres', 'apellidos', 'nombres_apellidos', 'produccion_codigo'],
                ordr: [
                    ['nombres', 'ASC'],
                    ['apellidos', 'ASC'],
                ],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            this.modal.colaboradores_loaded = false
            const res = await get(`${urls.colaboradores}?qry=${JSON.stringify(qry)}`)
            this.modal.colaboradores_loaded = true
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.colaboradores = res.data
        },
        async loadMrpBoms() {
            this.modal.mrp_boms = []

            const qry = {
                fltr: {
                    articulo: { op: 'Es', val: this.modal.produccion_orden.articulo },
                    tipo: { op: 'Es', val: 'fabricar' },
                },
                cols: ['referencia'],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            this.modal.mrp_boms_loaded = false
            const res = await get(`${urls.mrp_boms}?qry=${JSON.stringify(qry)}`)
            this.modal.mrp_boms_loaded = true
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.mrp_boms = res.data
        },
        async loadMrpBomLines() {
            this.modal.mrp_bom_lines = []

            const qry = {
                fltr: {
                    mrp_bom: { op: 'Es', val: this.modal.produccion_orden.mrp_bom },
                    tipo: { op: 'Es', val: 'fabricar' },
                },
                cols: ['articulo', 'cantidad', 'orden'],
                incl: ['articulo1'],
                ordr: [['orden', 'ASC']],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.mrp_bom_lines}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.mrp_bom_lines = res.data
        },
        async loadStock() {
            const qry = {
                fltr: {
                    id: { op: 'Es', val: this.modal.mrp_bom_lines.map((a) => a.articulo) },
                },
                sqls: ['articulo_stock'],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulos}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.mrp_bom_lines = this.modal.mrp_bom_lines.map((line) => {
                const articulo = res.data.find((a) => a.id == line.articulo)

                return {
                    ...line,
                    stock: articulo?.stock || 0,
                }
            })
            // this.modal.mrp_boms = res.data
        },

        async setArticulo(a) {
            if (a == null) {
                this.modal.produccion_orden.articulo_info = {}
                this.modal.produccion_orden.mrp_bom = null
                this.modal.mrp_boms = []
                this.modal.mrp_bom_lines = []
                return
            }

            this.modal.produccion_orden.articulo_info = a

            await this.loadMrpBoms()
            if (this.modal.mrp_boms.length == 1) {
                this.modal.produccion_orden.mrp_bom = this.modal.mrp_boms[0].id
                await this.loadMrpBomLines()
            }
        },
        async setMrpBom(a) {
            if (a == null) {
                this.modal.mrp_bom_lines = []
                return
            }

            this.loadMrpBomLines()
        },

        setMaquina(a) {
            if (a == null) {
                this.modal.produccion_orden.maquina_info = {}
            } else {
                this.modal.produccion_orden.maquina_info = {
                    id: a.id,
                    velocidad: a.velocidad,
                    limpieza_tiempo: a.limpieza_tiempo,
                }
            }
        },
        setTiempo() {
            if (
                this.modal.produccion_orden.maquina == null ||
                this.modal.produccion_orden.articulo == null ||
                this.modal.produccion_orden.cantidad == null
            ) {
                return '00:00'
            }

            const tiempo =
                (this.modal.produccion_orden.cantidad *
                    this.modal.produccion_orden.articulo_info?.filtrantes) /
                this.modal.produccion_orden.maquina_info?.velocidad

            return dayjs().startOf('day').add(tiempo, 'minute').format('HH:mm')
        },

        checkDatos() {
            const props = ['fecha', 'articulo', 'cantidad', 'orden', 'responsable']

            if (this.modal.maquinas && this.modal.maquinas.length > 0) {
                props.push('maquina', 'maquina_info')
            }

            if (incompleteData(this.modal.produccion_orden, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        async crear() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true)
            const res = await post(urls.produccion_ordenes, this.modal.produccion_orden)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.addItem(this.modal.origin, 'produccion_ordenes', {
                ...res.data,
                receta: this.insumos_necesitados,
            })
            this.useModals.show.mProduccionOrden = false
        },
        async modificar() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true)
            const res = await patch(urls.produccion_ordenes, this.modal.produccion_orden)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.updateItem(this.modal.origin, 'produccion_ordenes', {
                ...res.data,
                receta: this.insumos_necesitados,
            })
            this.useModals.show.mProduccionOrden = false
        },
    },
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: repeat(4, 10rem);
    gap: 0.5rem;
    margin-bottom: 2rem;
}

.jd-table {
    .falta {
        color: var(--rojo);
    }
}
</style>
