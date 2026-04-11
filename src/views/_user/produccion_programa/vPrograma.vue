<template>
    <div class="vista">
        <div class="head">
            <div class="head-left">
                <JdButton
                    text="Exportar"
                    tipo="2"
                    @click="exportarPrograma"
                    v-if="useAuth.verifyPermiso('vPrograma:crear')"
                />

                <JdButton
                    text="Ver productos pedidos"
                    tipo="2"
                    @click="verPedidos"
                    v-if="useAuth.verifyPermiso('vPrograma:verProductosPedidos')"
                />
            </div>

            <div class="header-right">
                <JdSelect
                    :lista="vista.articulo_lineas || []"
                    v-model="column_linea.val"
                    :loaded="vista.lineasLoaded"
                    @reload="loadArticuloLineas"
                    @elegir="setLinea"
                    style="width: 12rem"
                    placeholder="Línea"
                />

                <JdInput
                    v-model="column_fecha.val"
                    type="date"
                    @change="setFecha"
                    style="width: 10rem"
                />

                <JdButton
                    title="Recargar"
                    icon="fa-solid fa-rotate"
                    tipo="2"
                    @click="loadProduccionOrdenes"
                    v-if="useAuth.verifyPermiso('vPrograma:listar')"
                />
            </div>
        </div>

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
                :colNro="false"
                :showResumen="false"
                :rowOptions="tableRowActions"
                @rowOptionSelected="runMethod"
                :inputsDisabled="!useAuth.verifyPermiso('vPrograma:crear')"
            />
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
                    :colNro="false"
                    :showResumen="false"
                    :rowOptions="tableRowActions"
                    @rowOptionSelected="runMethod"
                    :inputsDisabled="!useAuth.verifyPermiso('vPrograma:crear')"
                />
            </li>
        </ul>

        <div class="card" v-if="useAuth.verifyPermiso('vPrograma:crear')">
            <div class="card-head">
                <span class="subtitle">Insumos requeridos</span>

                <JdButton text="Calcular" tipo="2" @click="calcularInsumosNecesarios" />
            </div>

            <JdTable :columns="columns_insumos" :datos="insumos_necesitados" class="jd-table">
                <template v-slot:colStock="{ item }">
                    <span
                        :class="{
                            falta: item.mrp_bom_line_articulo_stock < item.cantidad_necesitada,
                        }"
                    >
                        {{ redondear(item.mrp_bom_line_articulo_stock) }}
                    </span>
                </template>
            </JdTable>
        </div>
    </div>

    <mProduccionOrden v-if="useModals?.show?.mProduccionOrden" />
    <mProductosFaltantes v-if="useModals?.show?.mProductosFaltantes" />
</template>

<script>
import mProduccionOrden from './mProduccionOrden.vue'
import mProductosFaltantes from './mProductosFaltantes.vue'

import { useModals } from '@/pinia/modals'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'

import { urls, get, delet, patch } from '@/utils/crud'
import { jmsg, jqst } from '@/utils/swal'
import { redondear } from '@/utils/mine'

import dayjs from 'dayjs'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

export default {
    components: {
        mProduccionOrden,
        mProductosFaltantes,
    },
    data: () => ({
        useModals: useModals(),
        useAuth: useAuth(),
        useVistas: useVistas(),
        dayjs,
        redondear,

        vista: {},

        tableName: 'vPrograma',
        tableRowActions: [
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
        ],

        columns_insumos: [
            {
                id: 'articulo',
                title: 'Nombre',
                prop: 'articulo1.nombre',
                width: '30rem',
                show: true,
            },
            {
                id: 'cantidad_necesitada',
                title: 'Cantidad necesaria',
                type: 'decimal',
                format: {},
                align: 'right',
                width: '8rem',
                show: true,
            },
            {
                id: 'stock',
                title: 'Stock',
                slot: 'colStock',
                align: 'right',
                width: '8rem',
                show: true,
            },
        ],
    }),
    computed: {
        columns() {
            return [
                {
                    id: 'fecha',
                    title: 'Fecha',
                    width: '10rem',
                    show: false,
                },
                {
                    id: 'linea',
                    title: 'Línea',
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
                    width: '4rem',
                    show: true,
                },
                {
                    id: 'articulo1.nombre',
                    title: 'Producto',
                    prop: 'articulo1.nombre',
                    width: '30rem',
                    show: true,
                },
                {
                    id: 'cantidad',
                    title: 'Cantidad',
                    align: 'right',
                    // slot: 'cCantidad',
                    type: 'number',
                    input: {
                        onInput: (item) => this.calcularProducto(item),
                        onChange: (item) => this.modificarProduccionOrden(item),
                        disabled: (item) => item.estado == 2,
                    },
                    width: '7rem',
                    show: true,
                },
                {
                    id: 'observacion',
                    title: 'Observación',
                    width: '15rem',
                    show: true,
                },
            ]
        },
        produccion_ordenes_hoy() {
            if (!this.vista.tableData) return []

            return this.vista.tableData.filter((a) => a.fecha == this.column_fecha.val)
        },
        maquinas_produccion() {
            if (!this.vista.tableData || !this.vista.maquinas) return []

            const mapaProducciones = JSON.parse(JSON.stringify(this.vista.tableData))
                .filter((a) => a.fecha == this.column_fecha.val)
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

            return this.vista.maquinas.map((m) => {
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
            if (!this.vista.tableData || !this.vista.maquinas) return []

            const resumenInsumos = this.vista.tableData.reduce((acc, item) => {
                for (const r of item.receta || []) {
                    if (!acc[r.articulo]) {
                        acc[r.articulo] = {
                            articulo: r.articulo,
                            articulo1: r.articulo1,
                            cantidad_necesitada: 0,
                            mrp_bom_line_articulo_stock: r.mrp_bom_line_articulo_stock,
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
        column_fecha() {
            return this.columns.find((a) => a.id == 'fecha')
        },
        column_linea() {
            return this.columns.find((a) => a.id == 'linea')
        },
        column_maquina() {
            return this.columns.find((a) => a.id == 'maquina')
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
            this.column_fecha.op = 'Es'
            this.column_fecha.val = dayjs().format('YYYY-MM-DD')
        },
        async setFecha() {
            if (this.column_fecha.val == null) {
                delete this.column_fecha.op
            } else {
                this.column_fecha.op = 'Es'
            }

            this.useAuth.saveTableColumns(this.tableName, this.columns)

            this.loadProduccionOrdenes()
        },
        async setLinea() {
            if (this.column_linea.val == null) {
                delete this.column_linea.op
            } else {
                this.column_linea.op = 'Es'
            }

            this.useAuth.saveTableColumns(this.tableName, this.columns)

            await this.loadMaquinas()

            this.loadProduccionOrdenes()
        },

        //--- principal data ---//
        setQuery() {
            this.vista.qry = {
                fltr: {},
                incl: ['articulo1', 'responsable1'],
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
            this.vista.qry.cols.push(
                'fecha',
                'maquina',
                'articulo',
                'maquina_info',
                'articulo_info',
                'estado',
                'mrp_bom',
                'inicio',
                'fin',
                'responsable',
            )
        },
        async loadProduccionOrdenes() {
            if (!this.column_fecha.val) {
                jmsg('warning', 'Seleccione una fecha')
                return
            }

            if (!this.column_linea.val) {
                jmsg('warning', 'Seleccione una línea de producción')
                return
            }

            this.setQuery()

            this.vista.tableData = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(
                `${urls.produccion_ordenes}?qry=${JSON.stringify(this.vista.qry)}`,
            )
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.tableData = res.data
        },

        //--- auxiliar data ---//
        async loadArticuloLineas() {
            const qry = {
                fltr: { activo: { op: 'Es', val: true } },
                cols: ['nombre'],
                ordr: [['nombre', 'ASC']],
            }

            this.vista.articulo_lineas = []
            this.useAuth.setLoading(true, 'Cargando líneas...')
            this.vista.lineasLoaded = false
            const res = await get(`${urls.articulo_lineas}?qry=${JSON.stringify(qry)}`)
            this.vista.lineasLoaded = true
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.vista.articulo_lineas = res.data
        },
        async loadMaquinas() {
            if (this.column_linea.val == null) {
                jmsg('warning', 'Seleccione una línea de producción')
                return
            }

            const qry = {
                fltr: { linea: { op: 'Es', val: this.column_linea.val } },
                cols: ['codigo', 'nombre', 'linea', 'velocidad', 'limpieza_tiempo'],
                ordr: [['orden', 'ASC']],
            }

            this.vista.maquinas = []
            this.useAuth.setLoading(true, 'Cargando máquinas...')
            this.vista.maquinasLoaded = false
            const res = await get(`${urls.maquinas}?qry=${JSON.stringify(qry)}`)
            this.vista.maquinasLoaded = true
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.vista.maquinas = res.data
        },

        //--- row actions ---
        runMethod(method, item) {
            this[method](item)
        },
        async ver(item) {
            const qry = {
                incl: ['maquina1', 'articulo1', 'mrp_bom1'],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(
                `${urls.produccion_ordenes}/uno/${item.id}?qry=${JSON.stringify(qry)}`,
            )
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
                mrp_boms: [{ ...res.data.mrp_bom1 }],
                maquinas: [
                    {
                        id: res.data.maquina,
                        ...res.data.maquina1,
                        linea: this.column_linea.val,
                    },
                ],
                origin: 'vPrograma',
            }

            this.useModals.setModal('mProduccionOrden', 'Ver órden de producción', 3, send, true)
        },
        async editar(item) {
            const qry = {
                incl: ['maquina1', 'articulo1', 'mrp_bom1'],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(
                `${urls.produccion_ordenes}/uno/${item.id}?qry=${JSON.stringify(qry)}`,
            )
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
                mrp_boms: [{ ...res.data.mrp_bom1 }],
                maquinas: this.vista.maquinas,
                origin: 'vPrograma',
                maquinas_loaded: true,
                mrp_boms_loaded: true,
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

        //--- header actions ---
        nuevo(maquina) {
            const send = {
                produccion_orden: {
                    fecha: this.column_fecha.val,
                    linea: this.column_linea.val,
                    estado: 1,
                },
                maquinas: this.vista.maquinas,
                origin: 'vPrograma',
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
                send.produccion_orden.orden = this.vista.tableData.length + 1
            }

            this.useModals.setModal('mProduccionOrden', 'Nueva órden de producción', 1, send, true)
        },
        async exportarPrograma() {
            await this.calcularInsumosNecesarios()
            // throw new Error()

            const fecha_programa = dayjs(this.vista.tableData[0].fecha).format('DD-MM-YYYY')
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
                // this.vista.tableData[0].fecha,
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
        async verPedidos() {
            const send = {
                linea: this.column_linea.val,
            }

            this.useModals.setModal('mProductosFaltantes', 'Productos pedidos', null, send, true)
        },

        //--- auxiliar methods ---//
        setProductoTiempo(prod) {
            return (prod.cantidad * prod.articulo_info?.filtrantes) / prod.maquina_info?.velocidad
        },
        async calcularInsumosNecesarios() {
            const qry = {
                fltr: {
                    mrp_bom: { op: 'Es', val: this.vista.tableData.map((a) => a.mrp_bom) },
                },
                cols: ['mrp_bom', 'articulo', 'cantidad', 'orden'],
                incl: ['articulo1'],
                sqls: ['mrp_bom_line_articulo_stock'],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.mrp_bom_lines}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            for (const a of this.vista.tableData) {
                const receta = res.data.filter((b) => b.mrp_bom == a.mrp_bom)

                for (const b of receta) {
                    b.cantidad_necesitada = a.cantidad * b.cantidad
                }

                a.receta = JSON.parse(JSON.stringify(receta))
            }

            // this.vista.tableData = res.data
        },

        //--- @methods ---//
        calcularProducto(item) {
            const i = this.vista.tableData.findIndex((a) => a.id == item.id)
            this.vista.tableData[i].cantidad = item.cantidad
        },
        async modificarProduccionOrden(item) {
            if (!item.cantidad) {
                jmsg('warning', 'Ingrese una cantidad')
                return
            }

            this.useAuth.setLoading(true, 'Actualizando cantidad...')
            const res = await patch(urls.produccion_ordenes, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return
        },
    },
}
</script>

<style lang="scss" scoped>
.vista {
    padding: 1.5rem 2rem;
    overflow-y: auto;

    > .head {
        display: flex;
        justify-content: space-between;
        gap: 1rem 2rem;
        margin-bottom: 2rem;

        .head-left {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            flex-wrap: wrap;
            min-width: 0;

            strong {
                font-size: 1.4rem;
            }
        }

        .header-right {
            display: flex;
            align-items: center;
            justify-content: end;
            gap: 0.25rem;
            flex-wrap: wrap;
            min-width: 0;
        }
    }
}

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
    // justify-content: space-between;
    gap: 2rem;
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
    margin-bottom: 1rem;
}

.col-act-inicio-fin {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.card-head {
    margin: 2rem 0 1rem;
    display: flex;
    align-items: center;
    gap: 2rem;
    span {
        font-size: 1.2rem;
    }
}
</style>
