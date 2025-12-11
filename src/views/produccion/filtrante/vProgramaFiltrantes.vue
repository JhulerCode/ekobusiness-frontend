<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Programa de producción filtrantes</strong>

            <div class="buttons">
                <JdButton
                    text="Ver productos pedidos"
                    tipo="2"
                    @click="verPedidos"
                    v-if="useAuth.verifyPermiso('vProgramaFiltrantes:verProductosPedidos')"
                />

                <JdButton
                    text="Salida de insumos"
                    tipo="2"
                    @click="salidaInsumos2"
                    v-if="
                        useAuth.verifyPermiso('vProgramaFiltrantes:salidaInsumosCompartidos') &&
                        vista.qry?.fltr?.fecha?.op == 'Es'
                    "
                />

                <JdInput
                    v-model="columns[0].val"
                    type="date"
                    @change="setFecha"
                    style="width: 10rem"
                />

                <JdSelect
                    :lista="vista.maquinas || []"
                    v-model="columns[1].val"
                    :loaded="vista.maquinasLoaded"
                    @reload="loadMaquinas"
                    @elegir="setMaquina"
                    style="width: 8rem"
                />
            </div>
        </div>

        <ul class="maquinas">
            <li v-for="(a, i) in vista.maquinasConProduccion || []" :key="i">
                <div class="left">
                    <strong>{{ a.nombre }}: </strong>

                    <div class="times">
                        <p>
                            <small>T.P: </small>
                            <span>
                                {{ dayjs().startOf('day').add(a.tiempo, 'minute').format('HH:mm') }}
                            </span>
                        </p>

                        <p>
                            <small>T.L: </small>
                            <span>
                                {{
                                    dayjs().startOf('day').add(a.limpieza, 'minute').format('HH:mm')
                                }}
                            </span>
                        </p>
                    </div>
                </div>

                <div
                    class="right"
                    @click="nuevo(a)"
                    title="Agregar orden de producción"
                    v-if="useAuth.verifyPermiso('vProgramaFiltrantes:crear')"
                >
                    <i class="fa-solid fa-plus"></i>
                </div>
            </li>
        </ul>

        <JdTable
            :columns="columns"
            :datos="vista.produccion_ordenes || []"
            :colAct="true"
            :reload="loadProduccionOrdenes"
            :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod"
        >
            <template v-slot:cTiempo="{ item }">
                {{ setTiempo(item) }}
            </template>
        </JdTable>
    </div>

    <mProduccionOrden v-if="useModals.show.mProduccionOrden" @calcularTiempo="calcularHoras" />
    <mProduccionInsumos v-if="useModals.show.mProduccionInsumos" />
    <mProduccionProductos
        v-if="useModals.show.mProduccionProductos"
        @productosCargados="setProduccionProductos"
    />
    <mProductosFaltantes v-if="useModals.show.mProductosFaltantes" />
    <mProduccionInsumosCompartidos v-if="useModals.show.mProduccionInsumosCompartidos" />
</template>

<script>
import { JdTable, JdButton, JdSelect, JdInput } from '@jhuler/components'

import mProduccionOrden from '@/views/produccion/historial/mProduccionOrden.vue'
import mProduccionInsumos from '@/views/produccion/historial/mProduccionInsumos.vue'
import mProduccionProductos from '@/views/produccion/historial/mProduccionProductos.vue'
import mProductosFaltantes from '@/views/produccion/filtrante/mProductosFaltantes.vue'
import mProduccionInsumosCompartidos from '@/views/produccion/historial/mProduccionInsumosCompartidos.vue'

import { useModals } from '@/pinia/modals'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'

import { urls, get, delet, patch } from '@/utils/crud'
import { jqst } from '@/utils/swal'

import dayjs from 'dayjs'

export default {
    components: {
        JdTable,
        JdButton,
        JdSelect,
        JdInput,

        mProduccionOrden,
        mProduccionInsumos,
        mProduccionProductos,
        mProductosFaltantes,
        mProduccionInsumosCompartidos,
    },
    data: () => ({
        useModals: useModals(),
        useAuth: useAuth(),
        useVistas: useVistas(),
        dayjs,

        vista: {},

        tableName: 'vProgramaFiltrantes',
        columns: [
            {
                id: 'fecha',
                title: 'Fecha',
                format: 'date',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'maquina',
                title: 'Máquina',
                prop: 'maquina1.nombre',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'orden',
                title: 'Prioridad',
                width: '7rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'articulo',
                title: 'Producto',
                prop: 'articulo1.nombre',
                width: '25rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                format: 'number',
                toRight: true,
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'tiempo',
                title: 'Tiempo',
                slot: 'cTiempo',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'productos_terminados',
                title: 'Productos terminados',
                type: 'number',
                format: 'number',
                toRight: true,
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
        ],
        tableRowOptions: [
            {
                label: 'Ver',
                icon: 'fa-solid fa-folder-open',
                action: 'ver',
                permiso: 'vProgramaFiltrantes:ver',
            },
            {
                label: 'Editar',
                icon: 'fa-solid fa-pen-to-square',
                action: 'editar',
                permiso: 'vProgramaFiltrantes:editar',
                ocultar: { estado: 2 },
            },
            {
                label: 'Eliminar',
                icon: 'fa-solid fa-trash-can',
                action: 'eliminar',
                permiso: 'vProgramaFiltrantes:eliminar',
                ocultar: { estado: 2 },
            },
            {
                label: 'Terminar',
                icon: 'fa-solid fa-check-double',
                action: 'terminar',
                permiso: 'vProgramaFiltrantes:terminar',
                ocultar: { estado: 2 },
            },
            {
                label: 'Productos terminados',
                icon: 'fa-solid fa-boxes-stacked',
                action: 'productosTerminados',
                permiso: 'vProgramaFiltrantes:productosTerminados',
            },
        ],
    }),
    async created() {
        this.vista = this.useVistas.vProgramaFiltrantes
        this.initFiltros()
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return

        await this.setMaquinas()
        if (this.useAuth.verifyPermiso('vProgramaFiltrantes:listar') == true)
            this.loadProduccionOrdenes()
    },
    methods: {
        initFiltros() {
            this.columns[0].op = 'Es'
            this.columns[0].val = dayjs().format('YYYY-MM-DD')
        },
        async setFecha() {
            if (this.columns[0].val == null) {
                delete this.columns[1].op
            } else {
                this.columns[0].op = 'Es'
            }

            this.useAuth.saveTableColumns(this.tableName, this.columns)
            this.loadProduccionOrdenes()
        },
        async setMaquina() {
            if (this.columns[1].val == null) {
                delete this.columns[1].op
            } else {
                this.columns[1].op = 'Es'
            }

            this.useAuth.saveTableColumns(this.tableName, this.columns)
            await this.setMaquinas()
            this.loadProduccionOrdenes()
        },
        async loadMaquinas() {
            const qry = {
                fltr: { produccion_tipo: { op: 'Es', val: 1 } },
                cols: ['codigo', 'nombre', 'produccion_tipo', 'velocidad', 'limpieza_tiempo'],
                ordr: [['nombre', 'ASC']],
            }

            this.vista.maquinas = []
            this.useAuth.setLoading(true, 'Cargando...')
            this.vista.maquinasLoaded = false
            const res = await get(`${urls.maquinas}?qry=${JSON.stringify(qry)}`)
            this.vista.maquinasLoaded = true
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.vista.maquinas = res.data
        },
        async setMaquinas() {
            await this.loadMaquinas()

            if (this.columns[1].val != null) {
                this.vista.maquinasConProduccion = this.vista.maquinas
                    .filter((a) => a.produccion_tipo == 1 && a.id == this.columns[1].val)
                    .map((a) => ({
                        ...a,
                        tiempo: 0,
                        limpieza: 0,
                    }))
            } else {
                this.vista.maquinasConProduccion = this.vista.maquinas
                    .filter((a) => a.produccion_tipo == 1)
                    .map((a) => ({
                        ...a,
                        tiempo: 0,
                        limpieza: 0,
                    }))
            }
        },
        setTiempo(a) {
            const tiempo = (a.cantidad * a.articulo_info?.filtrantes) / a.maquina_info?.velocidad

            return dayjs().startOf('day').add(tiempo, 'minute').format('HH:mm')
        },

        setQuery() {
            this.vista.qry = {
                fltr: { tipo: { op: 'Es', val: 1 } },
                // cols: [
                // 'fecha',
                // 'orden',
                // 'maquina',
                // 'maquina_info',
                // 'articulo',
                // 'articulo_info',
                // 'cantidad',
                // 'estado',
                // ],
            }

            // if (this.vista.maquina != null)
            //     this.vista.qry.fltr.maquina = { op: 'Es', val: this.vista.maquina }
            this.useAuth.updateQuery(this.columns, this.vista.qry)
            this.vista.qry.cols.push('maquina_info', 'articulo_info')
        },
        async loadProduccionOrdenes() {
            this.setQuery()

            this.vista.produccion_ordenes = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(
                `${urls.produccion_ordenes}?qry=${JSON.stringify(this.vista.qry)}`,
            )
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.produccion_ordenes = res.data
            this.calcularHoras()
        },
        calcularHoras() {
            for (const a of this.vista.maquinasConProduccion) {
                a.tiempo = 0
                a.limpieza = 0
            }

            for (const a of this.vista.produccion_ordenes) {
                const i = this.vista.maquinasConProduccion.findIndex((b) => b.id == a.maquina)

                if (i == -1) continue

                this.vista.maquinasConProduccion[i].tiempo +=
                    (a.cantidad * a.articulo_info?.filtrantes) / a.maquina_info?.velocidad
                this.vista.maquinasConProduccion[i].limpieza +=
                    a.maquina_info?.limpieza_tiempo || 20
            }
        },

        nuevo(maquina) {
            const send = {
                produccion_orden: {
                    fecha: dayjs().format('YYYY-MM-DD'),
                    tipo: 1,
                    estado: 1,
                    maquina: maquina.id,
                    maquina_info: {
                        id: maquina.id,
                        velocidad: maquina.velocidad,
                        limpieza_tiempo: maquina.limpieza_tiempo,
                    },
                    orden: this.vista.produccion_ordenes.length + 1,
                },
            }

            this.useModals.setModal('mProduccionOrden', 'Nueva órden de producción', 1, send, true)
        },
        async verPedidos() {
            const send = {
                produccion_tipo: 1,
            }

            this.useModals.setModal('mProductosFaltantes', 'Productos pedidos', null, send, true)
        },

        runMethod(method, item) {
            this[method](item)
        },
        async ver(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.produccion_ordenes}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const send = {
                produccion_orden: res.data,
                articulos: [
                    {
                        id: res.data.articulo,
                        ...res.data.articulo_info,
                    },
                ],
                maquinas: [
                    {
                        id: res.data.maquina,
                        ...res.data.maquina1,
                    },
                ],
            }

            this.useModals.setModal('mProduccionOrden', 'Ver órden de producción', 3, send, true)
        },
        async editar(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.produccion_ordenes}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const send = {
                produccion_orden: res.data,
                articulos: [
                    {
                        id: res.data.articulo,
                        ...res.data.articulo_info,
                    },
                ],
            }

            this.useModals.setModal('mProduccionOrden', 'Editar órden de producción', 2, send, true)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.produccion_ordenes, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vProgramaFiltrantes', 'produccion_ordenes', item)
            this.calcularHoras()
        },
        async terminar(item) {
            const resQst = await jqst('¿Está seguro de terminar la orden de producción?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await patch(
                `${urls.produccion_ordenes}/terminar`,
                item,
                'Orden de producción terminada',
            )
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.updateItem('vProgramaFiltrantes', 'produccion_ordenes', {
                ...item,
                estado: 2,
            })
        },
        async salidaInsumos(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.produccion_ordenes}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const send = {
                is_receta: true,
                produccion_orden: JSON.parse(JSON.stringify(res.data)),
            }

            this.useModals.setModal('mProduccionInsumos', `Salida de insumos`, 1, send, true)
        },
        salidaInsumos2() {
            const send = {
                transaccion: {
                    tipo: 2,
                    fecha: this.columns[0].val,
                    maquina: this.columns[1].val,
                },
            }
            this.useModals.setModal(
                'mProduccionInsumosCompartidos',
                `Salida de insumos`,
                null,
                send,
                true,
            )
        },
        productosTerminados(item) {
            const send = {
                produccion_orden: { ...item },
            }

            this.useModals.setModal(
                'mProduccionProductos',
                `Productos terminados`,
                null,
                send,
                true,
            )
        },
        setProduccionProductos(item) {
            const pr = this.vista.produccion_ordenes.find((a) => a.id == item.id)
            pr.productos_terminados = item.productos_terminados
        },
    },
}
</script>

<style lang="scss" scoped>
.maquinas {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;

    li {
        display: flex;

        .left {
            padding: 1rem;
            border-radius: 0.3rem 0 0 0.3rem;
            border: var(--border);

            .times {
                display: flex;
                gap: 1rem;
                margin-top: 0.5rem;
            }
        }

        .right {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0.5rem;
            background-color: var(--bg-color2);
            border-radius: 0 0.3rem 0.3rem 0;
            border-top: var(--border);
            border-right: var(--border);
            border-bottom: var(--border);
            cursor: pointer;
        }
    }
}
</style>
