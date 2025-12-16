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

            <JdSelect
                v-model="modal.produccion_orden.estado"
                :lista="modal.produccion_orden_estados"
                :disabled="true"
                style="grid-column: 4/5"
            />

            <template v-if="modal.maquinas && modal.maquinas.length > 0">
                <JdSelect
                    label="Máquina"
                    :nec="true"
                    v-model="modal.produccion_orden.maquina"
                    :lista="
                        modal.maquinas?.filter(
                            (a) => a.linea == modal.produccion_orden.tipo,
                        ) || []
                    "
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

            <JdInput
                type="number"
                label="Orden"
                :nec="true"
                v-model="modal.produccion_orden.orden"
                :disabled="modal.mode == 3"
                style="grid-column: 1/2"
            />

            <p
                v-if="modal.maquinas && modal.maquinas.length > 0"
                style="grid-column: 4/5; text-align: right"
            >
                <small>Tiempo de producción:</small>
                {{ setTiempo() }} <br />
            </p>

            <JdTextArea
                label="Observación"
                v-model="modal.produccion_orden.observacion"
                :disabled="modal.mode == 3"
                style="grid-column: 1/4"
            />
        </div>

        <JdTable
            :columns="columns1"
            :datos="insumos_necesitados"
            :reload="calcularInsumosNecesarios"
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
import { JdModal, JdInput, JdSelect, JdSelectQuery, JdTextArea, JdTable } from '@jhuler/components'

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

        columns: [
            {
                id: 'articulo',
                title: 'Nombre',
                prop: 'articulo1.nombre',
                width: '25rem',
                show: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad req.',
                slot: 'colCantidad',
                toRight: true,
                width: '8rem',
                show: true,
            },
            {
                title: 'Stock',
                slot: 'colStock',
                toRight: true,
                width: '8rem',
                show: true,
            },
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
                title: 'Cantidad req.',
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
            if (
                !this.modal.produccion_orden.articulo_info ||
                !this.modal.produccion_orden.articulo_info.receta_insumos
            )
                return []

            return this.modal.produccion_orden.articulo_info.receta_insumos.map((a) => ({
                ...a,
                cantidad_necesitada: a.cantidad * (this.modal.produccion_orden.cantidad || 0),
            }))
        },
    },
    created() {
        this.modal = this.useModals.mProduccionOrden

        this.showButtons()
        this.loadDatosSistema()

        // if (this.modal.mode != 3) {
        //     this.loadMaquinas()
        // }
    },
    methods: {
        showButtons() {
            if (this.useModals.mProduccionOrden.mode == 1) {
                this.buttons[0].show = true
            } else if (this.useModals.mProduccionOrden.mode == 2) {
                this.buttons[1].show = true
            }
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
                    tipo: { op: 'Es', val: 2 },
                    linea: { op: 'Es', val: this.modal.produccion_orden.tipo },
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
        setArticulo(a) {
            if (a == null) {
                this.modal.produccion_orden.articulo_info = {}
            } else {
                this.modal.produccion_orden.articulo_info = a

                // this.modal.produccion_orden.articulo_info.receta_insumos.sort(
                //     (a, b) => a.orden - b.orden,
                // )
                this.calcularInsumosNecesarios()
            }
        },
        async calcularInsumosNecesarios() {
            const send = {
                articulos: [
                    {
                        id: this.modal.produccion_orden.articulo,
                        cantidad: this.modal.produccion_orden.cantidad,
                    },
                ],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await post(`${urls.receta_insumos}/calcular-necesidad`, send, false)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.produccion_orden.articulo_info.receta_insumos = res.data[0].receta.sort(
                (a, b) => a.orden - b.orden,
            )
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
            const props = ['fecha', 'tipo', 'articulo', 'cantidad']

            if (this.modal.maquinas && this.modal.maquinas.length > 0) {
                props.push('maquina', 'maquina_info')
            }

            if (incompleteData(this.modal.produccion_orden, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        // async crear1() {
        //     if (this.checkDatos()) return

        //     console.log(this.modal.produccion_orden)
        // },
        async crear() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true)
            const res = await post(urls.produccion_ordenes, this.modal.produccion_orden)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.addItem(
                // this.tipoPrograma[this.modal.produccion_orden.tipo],
                'vPrograma',
                'produccion_ordenes',
                { ...res.data, receta: this.insumos_necesitados },
            )
            this.useModals.show.mProduccionOrden = false
        },
        async modificar() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true)
            const res = await patch(urls.produccion_ordenes, this.modal.produccion_orden)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.updateItem(
                // this.tipoPrograma[this.modal.produccion_orden.tipo],
                'vPrograma',
                'produccion_ordenes',
                { ...res.data, receta: this.insumos_necesitados },
            )
            this.useModals.show.mProduccionOrden = false
        },

        async loadDatosSistema() {
            const qry = ['produccion_orden_estados']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.modal, res.data)
        },
        async loadMaquinas() {
            const qry = {
                fltr: {},
                cols: ['codigo', 'nombre', 'linea', 'velocidad', 'limpieza_tiempo'],
                ordr: [['nombre', 'ASC']],
            }

            this.modal.maquinas = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.maquinas}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.maquinas = res.data
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
