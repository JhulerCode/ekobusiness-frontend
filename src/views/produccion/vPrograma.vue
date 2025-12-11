<template>
    <div class="tablero">
        <div class="head">
            <strong>Programa de producción</strong>

            <div class="buttons">
                <JdButton
                    text="Ver productos pedidos"
                    tipo="2"
                    @click="verPedidos"
                    v-if="useAuth.verifyPermiso('vPrograma:verProductosPedidos')"
                />
            </div>
        </div>

        <div class="buttons">
            <JdSelect
                :lista="vista.articulo_lineas || []"
                v-model="columns[6].val"
                :loaded="vista.lineasLoaded"
                @reload="loadArticuloLineas"
                @elegir="setLinea"
                style="width: 12rem"
                placeholder="Línea"
            />

            <JdSelect
                :lista="vista.maquinas || []"
                v-model="columns[1].val"
                :loaded="vista.maquinasLoaded"
                @reload="loadMaquinas"
                @elegir="setMaquina"
                style="width: 12em"
                placeholder="Máquina"
            />

            <JdInput v-model="columns[0].val" type="date" @change="setFecha" style="width: 10rem" />

            <!-- <JdButton text="Buscar" @click="loadProduccionOrdenes" /> -->

            <JdButton
                text="Exportar"
                tipo="2"
                @click="exportarPrograma"
                v-if="useAuth.verifyPermiso('vPrograma:crear')"
            />
        </div>
        <!-- {{ maquinas_produccion }} -->
        <div class="asdasd">
            <div class="card" v-if="vista.maquinas && vista.maquinas.length == 0">
                <div class="maquina-head">
                    <JdButton
                        icon="fa-solid fa-plus"
                        tipo="2"
                        title="Agregar orden de producción"
                        @click="nuevo()"
                        v-if="useAuth.verifyPermiso('vPrograma:crear')"
                    />
                </div>

                <JdTable
                    :columns="columns"
                    :datos="produccion_ordenes_hoy"
                    :seeker="false"
                    :colAct="true"
                    :colNro="false"
                    :showResumen="false"
                    :download="false"
                    :rowOptions="tableRowOptions"
                    @rowOptionSelected="runMethod"
                >
                    <template v-slot:cCantidad="{ item }">
                        <JdInput
                            v-model="item.cantidad"
                            type="number"
                            :toRight="true"
                            @input="calcularProducto(item)"
                            @change="modificarProduccionOrden(item)"
                            :disabled="
                                !useAuth.verifyPermiso('vPrograma:crear') || item.estado == 2
                            "
                        />
                    </template>
                </JdTable>
            </div>

            <ul class="container-programa" v-else>
                <li v-for="(a, i) in maquinas_produccion || []" :key="i" class="card">
                    <div class="maquina-head">
                        <div>
                            <strong>{{ a.nombre }}</strong>

                            <JdButton
                                icon="fa-solid fa-plus"
                                tipo="2"
                                title="Agregar orden de producción"
                                @click="nuevo(a)"
                                v-if="useAuth.verifyPermiso('vPrograma:crear')"
                            />

                            <JdButton
                                text="Salida de insumos"
                                tipo="2"
                                @click="salidaInsumosCompartidos(a)"
                                v-if="
                                    useAuth.verifyPermiso('vPrograma:salidaInsumosCompartidos') &&
                                    columns[0].val
                                "
                            />
                        </div>
                        <div>
                            <p>
                                <small>T.P: </small>
                                <span>
                                    {{ a.tiempo_produccion }}
                                </span>
                            </p>

                            <p>
                                <small>T.L: </small>
                                <span>
                                    {{ a.tiempo_limpieza }}
                                </span>
                            </p>
                        </div>
                    </div>

                    <JdTable
                        :columns="columns"
                        :datos="a.produccion_ordenes || []"
                        :seeker="false"
                        :colAct="true"
                        :colNro="false"
                        :showResumen="false"
                        :download="false"
                        :rowOptions="tableRowOptions"
                        @rowOptionSelected="runMethod"
                    >
                        <template v-slot:cCantidad="{ item }">
                            <JdInput
                                v-model="item.cantidad"
                                type="number"
                                :toRight="true"
                                @input="calcularProducto(item)"
                                @change="modificarProduccionOrden(item)"
                                :disabled="
                                    !useAuth.verifyPermiso('vPrograma:crear') || item.estado == 2
                                "
                            />
                        </template>
                    </JdTable>
                </li>
            </ul>

            <div class="card" v-if="useAuth.verifyPermiso('vPrograma:crear')">
                <div class="card-head">
                    <p>Insumos</p>

                    <JdButton text="Calcular" tipo="2" @click="calcularInsumosNecesarios" />
                </div>

                <JdTable
                    :columns="columns_insumos"
                    :seeker="false"
                    :colAct="false"
                    :download="false"
                    :datos="insumos_necesitados"
                    class="jd-table"
                >
                    <template v-slot:colStock="{ item }">
                        <span
                            :class="{
                                falta: item.articulo1.stock < item.cantidad_necesitada,
                            }"
                        >
                            {{ redondear(item.articulo1.stock) }}
                        </span>
                    </template>
                </JdTable>
            </div>
        </div>
    </div>

    <mProduccionOrden v-if="useModals.show.mProduccionOrden" />
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

import { urls, get, post, delet, patch } from '@/utils/crud'
import { jmsg, jqst } from '@/utils/swal'
import { redondear } from '@/utils/mine'

import dayjs from 'dayjs'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

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
        redondear,

        vista: {},

        tableName: 'vPrograma',
        columns: [
            {
                id: 'fecha',
                title: 'Fecha',
                format: 'date',
                width: '10rem',
                show: false,
            },
            {
                id: 'maquina',
                title: 'Máquina',
                prop: 'maquina1.nombre',
                width: '10rem',
                show: false,
            },
            {
                id: 'orden',
                title: 'Prioridad',
                width: '3rem',
                show: true,
            },
            {
                id: 'articulo1.nombre',
                title: 'Producto',
                prop: 'articulo1.nombre',
                width: '25rem',
                show: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                format: 'number',
                slot: 'cCantidad',
                width: '7rem',
                show: true,
            },
            {
                id: 'tiempo_produccion',
                title: 'Tiempo',
                width: '5rem',
                show: true,
            },
            {
                id: 'tipo',
                title: 'Línea',
                width: '10rem',
                show: false,
            },
            {
                id: 'productos_terminados',
                title: 'PTs',
                type: 'number',
                format: 'number',
                toRight: true,
                width: '5rem',
                show: true,
            },
            {
                id: 'observacion',
                title: 'Observación',
                width: '15rem',
                show: true,
            },
        ],
        tableRowOptions: [
            {
                label: 'Ver',
                icon: 'fa-solid fa-folder-open',
                action: 'ver',
                permiso: 'vPrograma:ver',
            },
            {
                label: 'Editar',
                icon: 'fa-solid fa-pen-to-square',
                action: 'editar',
                permiso: 'vPrograma:editar',
                ocultar: { estado: 2 },
            },
            {
                label: 'Eliminar',
                icon: 'fa-solid fa-trash-can',
                action: 'eliminar',
                permiso: 'vPrograma:eliminar',
                ocultar: { estado: 2 },
            },
            {
                label: 'Terminar',
                icon: 'fa-solid fa-check-double',
                action: 'terminar',
                permiso: 'vPrograma:terminar',
                ocultar: { estado: 2 },
            },
            {
                label: 'Abrir',
                icon: 'fa-solid fa-check-double',
                action: 'abrir',
                permiso: 'vPrograma:terminar',
                ocultar: { estado: 1 },
            },
            {
                label: 'Salida de insumos',
                icon: 'fa-regular fa-circle-down',
                action: 'salidaInsumos',
                permiso: 'vPrograma:salidaInsumos',
            },
            {
                label: 'Productos terminados',
                icon: 'fa-solid fa-boxes-stacked',
                action: 'productosTerminados',
                permiso: 'vPrograma:productosTerminados',
            },
        ],

        columns_insumos: [
            {
                id: 'articulo',
                title: 'Nombre',
                prop: 'articulo1.nombre',
                width: '20rem',
                show: true,
            },
            {
                id: 'cantidad_necesitada',
                title: 'Cant. necesaria',
                format: 'decimal',
                toRight: true,
                width: '7rem',
                show: true,
            },
            {
                id: 'stock',
                title: 'Stock',
                slot: 'colStock',
                toRight: true,
                width: '7rem',
                show: true,
            },
        ],
    }),
    computed: {
        produccion_ordenes_hoy() {
            if (!this.vista.produccion_ordenes) return []

            return this.vista.produccion_ordenes.filter((a) => a.fecha == this.columns[0].val)
        },
        maquinas_produccion() {
            if (!this.vista.produccion_ordenes || !this.vista.maquinas) return []

            const mapaProducciones = JSON.parse(JSON.stringify(this.vista.produccion_ordenes))
                .filter((a) => a.fecha == this.columns[0].val)
                .reduce((acc, prod) => {
                    if (!acc[prod.maquina]) {
                        acc[prod.maquina] = []
                    }

                    const tiempo = this.setProductoTiempo(prod)

                    acc[prod.maquina].push({
                        ...prod,
                        tiempo,
                        tiempo_produccion: dayjs()
                            .startOf('day')
                            .add(tiempo, 'minute')
                            .format('HH:mm'),
                    })
                    return acc
                }, {})

            const arr =
                this.columns[1].val == null
                    ? this.vista.maquinas
                    : this.vista.maquinas.filter((a) => a.id == this.columns[1].val)

            return arr.map((m) => {
                const produccion_ordenes = mapaProducciones[m.id] || []

                let tiempo_produccion = 0
                let tiempo_limpieza = 0

                for (const a of produccion_ordenes) {
                    tiempo_produccion += a.tiempo
                    tiempo_limpieza += a.maquina_info?.limpieza_tiempo || 20
                }

                tiempo_produccion = dayjs()
                    .startOf('day')
                    .add(tiempo_produccion, 'minute')
                    .format('HH:mm')

                tiempo_limpieza = dayjs()
                    .startOf('day')
                    .add(tiempo_limpieza, 'minute')
                    .format('HH:mm')

                return {
                    ...m,
                    produccion_ordenes: produccion_ordenes.sort((a, b) => a.orden - b.orden),
                    tiempo_produccion,
                    tiempo_limpieza,
                }
            })
        },
        insumos_necesitados() {
            if (!this.vista.produccion_ordenes || !this.vista.maquinas) return []

            const resumenInsumos = this.vista.produccion_ordenes.reduce((acc, item) => {
                for (const r of item.receta || []) {
                    if (!acc[r.articulo]) {
                        acc[r.articulo] = {
                            articulo: r.articulo,
                            articulo1: r.articulo1,
                            cantidad_necesitada: 0,
                        }
                    }

                    acc[r.articulo].cantidad_necesitada += r.cantidad_necesitada
                }
                return acc
            }, {})

            return Object.values(resumenInsumos).sort((a, b) =>
                a.articulo1.nombre.localeCompare(b.articulo1.nombre),
            )
        },
    },
    async created() {
        this.vista = this.useVistas.vPrograma
        this.initFiltros()
        this.useAuth.setColumns(this.tableName, this.columns)

        if (!this.vista.lineasLoaded) await this.loadArticuloLineas()

        if (!this.vista.maquinasLoaded) this.loadMaquinas()

        if (!this.vista.loaded) {
            if (this.useAuth.verifyPermiso('vPrograma:listar') == true) this.loadProduccionOrdenes()
        }
    },
    methods: {
        initFiltros() {
            this.columns[0].op = 'Es'
            this.columns[0].val = dayjs().format('YYYY-MM-DD')
        },
        async setFecha() {
            if (this.columns[0].val == null) {
                delete this.columns[0].op
            } else {
                this.columns[0].op = 'Es'
            }

            this.useAuth.saveTableColumns(this.tableName, this.columns)

            this.loadProduccionOrdenes()
        },
        async setLinea() {
            if (this.columns[6].val == null) {
                delete this.columns[6].op
            } else {
                this.columns[6].op = 'Es'
            }

            this.useAuth.saveTableColumns(this.tableName, this.columns)

            await this.loadMaquinas()
            this.columns[1].op = null
            this.columns[1].val = null
            this.loadProduccionOrdenes()
        },
        async setMaquina() {
            if (this.columns[1].val == null) {
                delete this.columns[1].op
            } else {
                this.columns[1].op = 'Es'
            }

            this.useAuth.saveTableColumns(this.tableName, this.columns)

            this.loadProduccionOrdenes()
        },

        async loadArticuloLineas() {
            const qry = {
                fltr: { activo: { op: 'Es', val: true } },
                cols: ['nombre'],
                ordr: [['nombre', 'ASC']],
            }

            this.vista.articulo_lineas = []
            this.useAuth.setLoading(true, 'Cargando...')
            this.vista.lineasLoaded = false
            const res = await get(`${urls.articulo_lineas}?qry=${JSON.stringify(qry)}`)
            this.vista.lineasLoaded = true
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.vista.articulo_lineas = res.data
        },
        async loadMaquinas() {
            if (this.columns[6].val == null) {
                jmsg('warning', 'Seleccione una línea de producción')
                return
            }

            const qry = {
                fltr: { produccion_tipo: { op: 'Es', val: this.columns[6].val } },
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

        setQuery() {
            this.vista.qry = {
                // fltr: { tipo: { op: 'Es', val: this.columns[6].val } },
                fltr: {},
                incl: ['articulo1'],
                sqls: ['productos_terminados'],
            }

            // if (this.vista.maquina != null)
            //     this.vista.qry.fltr.maquina = { op: 'Es', val: this.vista.maquina }
            this.useAuth.updateQuery(this.columns, this.vista.qry)
            this.vista.qry.cols.push(
                'fecha',
                'maquina',
                'articulo',
                'maquina_info',
                'articulo_info',
                'estado',
            )
        },
        async loadProduccionOrdenes() {
            if (!this.columns[0].val) {
                jmsg('warning', 'Seleccione una fecha')
                return
            }

            if (!this.columns[6].val) {
                jmsg('warning', 'Seleccione una línea de producción')
                return
            }

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
            // this.calcularHoras()
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
                maquinas: this.vista.maquinas,
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

            this.useVistas.removeItem('vPrograma', 'produccion_ordenes', item)
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

            this.useVistas.updateItem('vPrograma', 'produccion_ordenes', {
                ...item,
                estado: 2,
            })
        },
        async abrir(item) {
            const resQst = await jqst('¿Está seguro de abrir la orden de producción?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await patch(
                `${urls.produccion_ordenes}/abrir`,
                item,
                'Orden de producción abierta',
            )
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.updateItem('vPrograma', 'produccion_ordenes', {
                ...item,
                estado: 1,
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

        nuevo(maquina) {
            const send = {
                produccion_orden: {
                    fecha: this.columns[0].val,
                    tipo: this.columns[6].val,
                    estado: 1,
                },
                maquinas: this.vista.maquinas,
            }

            if (maquina) {
                send.produccion_orden.maquina = maquina.id
                send.produccion_orden.maquina_info = {
                    id: maquina.id,
                    velocidad: maquina.velocidad,
                    limpieza_tiempo: maquina.limpieza_tiempo,
                }
                send.produccion_orden.orden =
                    this.maquinas_produccion.find((a) => a.id == maquina.id).produccion_ordenes
                        .length + 1
            } else {
                send.produccion_orden.orden = this.vista.produccion_ordenes.length + 1
            }

            this.useModals.setModal('mProduccionOrden', 'Nueva órden de producción', 1, send, true)
        },
        async exportarPrograma() {
            await this.calcularInsumosNecesarios()

            const fecha_programa = dayjs(this.vista.produccion_ordenes[0].fecha).format(
                'DD-MM-YYYY',
            )
            const nombre = `Programa de producción del ${fecha_programa}`
            const workbook = new ExcelJS.Workbook()
            const worksheet = workbook.addWorksheet('Hoja1')
            worksheet.properties.showGridLines = false
            worksheet.getColumn(1).width = 40

            //--- Title ---//
            const titleRow = worksheet.addRow([
                `Orden de producción`,
                '',
                '',
                // this.vista.produccion_ordenes[0].fecha,
                fecha_programa,
                '',
            ])

            worksheet.mergeCells(`D${titleRow.number}:E${titleRow.number}`)

            // Estilos para la primera celda (A1)
            titleRow.getCell(1).font = {
                size: 18,
                bold: true,
                color: { argb: '666666' }, // gris
            }

            // Estilos para la última celda (D1:E1)
            titleRow.getCell(4).font = {
                size: 18,
                bold: true,
                color: { argb: '666666' }, // gris
                horizontal: 'right',
            }

            worksheet.addRow([])

            //--- Máquinas ---//
            const excluir = [
                'da249f8d-c28e-4eda-a3f9-3ea9659b2f1a', //goma
                '7068389c-14b4-4a81-a91a-475086719b47', //hilo
                '5daf8437-e0fe-4c6c-95ef-664288365036', //papel
            ]

            for (const a of this.maquinas_produccion) {
                worksheet.addRow([a.nombre])
                const headerRow = worksheet.addRow([
                    'Producto',
                    'Cantidad',
                    'Hierba',
                    'Sobre',
                    'Etiqueta',
                    'Observación',
                ])

                headerRow.eachCell((cell) => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: '000000' }, // negro
                    }

                    cell.font = {
                        color: { argb: 'FFFFFF' }, // blanco
                        bold: true,
                    }

                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' },
                    }
                })

                for (const b of a.produccion_ordenes) {
                    const fila = [b.articulo_info.nombre, b.cantidad, '', '', '', b.observacion]
                    console.log(fila)

                    const receta = b.receta
                        .filter((x) => !x.articulo1.nombre.includes('CAJA'))
                        .filter((x) => !excluir.includes(x.articulo))
                        .sort((y, z) =>
                            y.articulo1.nombre
                                .toLowerCase()
                                .localeCompare(z.articulo1.nombre.toLowerCase()),
                        )

                    for (const c of receta) {
                        if (c.articulo1.nombre.includes('SOBREE')) {
                            fila.splice(3, 1, c.cantidad_necesitada.toFixed(2))
                        } else if (c.articulo1.nombre.includes('ETIQUETA')) {
                            fila.splice(4, 1, c.cantidad_necesitada.toFixed(2))
                        } else {
                            fila.splice(2, 1, c.cantidad_necesitada.toFixed(2))
                        }
                    }

                    //--- Fila de insumos calculados ---//
                    const dataRow = worksheet.addRow(fila)

                    dataRow.eachCell((cell) => {
                        cell.border = {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' },
                        }
                    })

                    //--- Fila de insumos para escribir ---//
                    const realRow = worksheet.addRow(['', '', '', '', ''])
                    realRow.eachCell((cell) => {
                        cell.border = {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' },
                        }
                    })
                }

                worksheet.addRow([])
            }

            const excelBuffer = await workbook.xlsx.writeBuffer()
            const blob = new Blob([excelBuffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            })
            saveAs(blob, `${nombre}.xlsx`)
        },
        async calcularInsumosNecesarios() {
            const send = {
                articulos: this.vista.produccion_ordenes,
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await post(`${urls.receta_insumos}/calcular-necesidad`, send, false)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.vista.produccion_ordenes = res.data
        },
        async verPedidos() {
            const send = {
                produccion_tipo: 1,
            }

            this.useModals.setModal('mProductosFaltantes', 'Productos pedidos', null, send, true)
        },
        salidaInsumosCompartidos(a) {
            const send = {
                transaccion: {
                    tipo: 2,
                    fecha: this.columns[0].val,
                    maquina: a.id,
                },
                maquinas: this.maquinas_produccion,
                maquina: a,
            }

            this.useModals.setModal(
                'mProduccionInsumosCompartidos',
                `Salida de insumos`,
                null,
                send,
                true,
            )
        },

        setProductoTiempo(prod) {
            return (prod.cantidad * prod.articulo_info?.filtrantes) / prod.maquina_info?.velocidad
        },
        calcularProducto(item) {
            const i = this.vista.produccion_ordenes.findIndex((a) => a.id == item.id)
            this.vista.produccion_ordenes[i].cantidad = item.cantidad
        },
        async modificarProduccionOrden(item) {
            if (!item.cantidad) {
                jmsg('warning', 'Ingrese una cantidad')
                return
            }

            this.useAuth.setLoading(true)
            const res = await patch(urls.produccion_ordenes, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return
        },
        maquinaTieneOrdenesPendientes(maq) {
            const maquina = this.maquinas_produccion.find((a) => a.id == maq.id)

            if (!maquina) return false

            return maquina.produccion_ordenes.some((a) => a.estado == 1)
        },
    },
}
</script>

<style lang="scss" scoped>
.buttons {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
}

.container-programa {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    // overflow: hidden;
}

.maquina-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;

    div {
        display: flex;
        gap: 1rem;
    }
}

.jd-table {
    .falta {
        color: var(--rojo);
    }
}

.asdasd {
    display: flex;
    gap: 2rem;
    // .div {
    //     flex: 1;
    // }
}
</style>
