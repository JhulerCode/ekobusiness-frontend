<template>
    <div class="pedido-items">
        <div class="agregar" v-if="vista.mode != 'view'">
            <JdButton
                icon="fa-solid fa-upload"
                text="Importar items"
                tipo="3"
                @click="this.$refs.excel.click()"
            />

            <JdButton
                icon="fa-solid fa-download"
                text="Descargar plantilla"
                tipo="3"
                @click="descargarPlantilla"
            />

            <input type="file" ref="excel" accept=".xlsx, .xls" hidden @change="importar" />
        </div>

        <JdTable
            :columns="columns"
            :datos="vista.data.socio_pedido_items || []"
            :rowOptions="rowActions"
            rowOptionsMode="buttons"
            @rowOptionSelected="runMethod"
            :inputsDisabled="vista.mode == 'view'"
            @onInput="runMethod"
            :agregarFila="vista.mode == 'view' ? null : addLine"
        />

        <div class="botom">
            <div class="left"></div>
            <div class="totales">
                <span>Ope. gravadas:</span>
                <p>{{ redondear(vista.mtoOperGravadas) }}</p>

                <span>Ope. exoneradas:</span>
                <p>{{ redondear(vista.mtoOperExoneradas) }}</p>

                <span>Ope. inafectas:</span>
                <p>{{ redondear(vista.mtoOperInafectas) }}</p>

                <span>Subtotal:</span>
                <p>{{ redondear(vista.valorVenta) }}</p>

                <span>Igv:</span>
                <p>{{ redondear(vista.mtoIGV) }}</p>

                <strong>Importe total:</strong>
                <strong class="total">
                    {{ redondear(vista.mtoImpVenta) }}
                </strong>
            </div>
        </div>
    </div>
</template>

<script>
import { useSystem } from '@/pinia/system'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { urls, get } from '@/utils/crud'
import { jmsg } from '@/utils/swal'
import { tryOficialExcel, genCorrelativo, redondear, downloadExcel } from '@/utils/mine'

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
                    id: 'articulo',
                    title: 'Artículo',
                    width: '30rem',
                    input: true,
                    select_query: {
                        search: this.loadArticulos,
                        elegir: this.elegirArticulo,
                    },
                    show: true,
                },
                {
                    id: 'unidad',
                    title: 'Unidad',
                    width: '5rem',
                    show: true,
                },
                {
                    id: 'cantidad',
                    title: 'Cantidad',
                    type: 'number',
                    input: true,
                    width: '6rem',
                    show: true,
                    oninput: 'sumarUno',
                },
                {
                    id: 'entregado',
                    title: 'Entregado',
                    type: 'number',
                    width: '6rem',
                    show: this.vista.mode == 'view',
                },
                {
                    id: 'pu',
                    title: 'Valor unitario',
                    type: 'number',
                    input: true,
                    width: '6rem',
                    show: true,
                    oninput: 'sumarUno',
                },
                {
                    id: 'igv_afectacion',
                    title: 'Tipo igv',
                    width: '15rem',
                    input: true,
                    select: {
                        lista: this.useSystem.data.igv_afectaciones,
                        elegir: this.elegirIgv,
                    },
                    show: true,
                },
                {
                    id: 'mtoValorVenta',
                    title: 'Subtotal',
                    format: 'decimal',
                    width: '7rem',
                    show: true,
                    toRight: true,
                },
                {
                    id: 'igv',
                    title: 'Igv',
                    format: 'decimal',
                    width: '7rem',
                    show: true,
                    toRight: true,
                },
                {
                    id: 'total',
                    title: 'Importe',
                    format: 'decimal',
                    width: '7rem',
                    show: true,
                    toRight: true,
                },
            ]
        },
        rowActions() {
            if (this.vista.mode == 'view') return []
            return [
                {
                    icon: 'fa-solid fa-trash-can',
                    title: 'Eliminar',
                    action: 'removeLine',
                },
            ]
        },
    },
    created() {
        // if (this.vista.mode == 'view') {
        //     const colEntregado = this.columns.find((c) => c.id == 'entregado')
        //     if (colEntregado) colEntregado.show = true
        // }
        const exec = setInterval(() => {
            if (this.vista.data?.socio_pedido_items) {
                this.sumarItems()
                clearInterval(exec)
            }
        }, 100)
    },
    methods: {
        runMethod(method, item) {
            this[method](item)
        },
        async addLine() {
            this.vista.data.socio_pedido_items.push({
                id: crypto.randomUUID(),
                orden: genCorrelativo(this.vista.data.socio_pedido_items),
            })
        },
        async removeLine(item) {
            const i = this.vista.data.socio_pedido_items.findIndex((a) => a.id == item.id)
            this.vista.data.socio_pedido_items.splice(i, 1)
            this.calcularTotales()
        },
        async elegirArticulo(articulo, item) {
            if (!articulo) return

            const supplier = articulo.articulo_suppliers?.find(
                (a) => a.socio == this.vista.data.socio && a.currency_id == this.vista.data.moneda,
            )

            item.articulo1 = {
                id: articulo.id,
                nombre: articulo.nombre,
            }
            item.nombre = articulo.nombre
            item.unidad = articulo.unidad
            item.has_fv = articulo.has_fv

            item.pu = supplier ? supplier.price : null
            item.igv_afectacion = articulo.igv_afectacion
            item.igv_porcentaje =
                articulo.igv_afectacion == '10' ? this.auth.empresa.igv_porcentaje : 0

            this.calcularUno(item)
            this.calcularTotales()
        },
        elegirIgv(igv, item) {
            this.calcularUno(item)
            this.calcularTotales()
        },
        importar(event) {
            this.auth.setLoading(true, 'Cargando archivo...')
            const file = event.target.files[0]
            const reader = new FileReader()

            reader.onload = async () => {
                const headers = ['EAN', 'Nombre', 'Cantidad', 'Valor unitario']
                const res = await tryOficialExcel(this.$refs.excel, file, reader, headers)

                if (res.code != 0) {
                    this.auth.setLoading(false)
                    return jmsg('error', res.msg)
                }

                const qry = {
                    fltr: {
                        sale_ok: { op: 'Es', val: true },
                        activo: { op: 'Es', val: true },
                        codigo_barra: { op: 'Es', val: res.data.map((a) => a.EAN) },
                    },
                    cols: ['nombre', 'unidad', 'codigo_barra', 'has_fv', 'igv_afectacion'],
                    ordr: [['nombre', 'ASC']],
                }

                this.auth.setLoading(true, 'Cargando productos...')
                const res2 = await get(`${urls.articulos}?qry=${JSON.stringify(qry)}`)
                this.auth.setLoading(false)
                if (res2.code != 0) return

                const articulosMap = res2.data.reduce(
                    (obj, a) => ((obj[a.codigo_barra] = a), obj),
                    {},
                )

                this.vista.data.socio_pedido_items = res.data.map((a) => {
                    const matchedItem = articulosMap[a.EAN] || {}
                    return {
                        orden: genCorrelativo(this.vista.data.socio_pedido_items, 'orden'),
                        articulo: matchedItem?.id,
                        articulo1: { id: matchedItem?.id, nombre: matchedItem?.nombre },
                        nombre: matchedItem?.nombre,
                        unidad: matchedItem?.unidad,
                        has_fv: matchedItem?.has_fv,
                        cantidad: a.Cantidad,
                        pu: a['Valor unitario'],
                        igv_afectacion: matchedItem?.igv_afectacion,
                        igv_porcentaje:
                            matchedItem?.igv_afectacion == '10'
                                ? this.auth.empresa.igv_porcentaje
                                : 0,
                        mtoValorVenta: 0,
                        igv: 0,
                        total: 0,
                    }
                })
                this.sumarItems()
            }
            reader.readAsArrayBuffer(file)
        },
        calcularUno(item) {
            const pu = parseFloat(item.pu) || 0
            const cantidad = parseFloat(item.cantidad) || 0
            const igv_porcentaje = parseFloat(item.igv_porcentaje) || 0

            item.mtoValorVenta = cantidad * pu
            item.igv = item.igv_afectacion == '10' ? item.mtoValorVenta * (igv_porcentaje / 100) : 0
            item.total = item.mtoValorVenta + item.igv
        },
        calcularTotales() {
            let mtoOperGravadas = 0
            let mtoOperExoneradas = 0
            let mtoOperInafectas = 0
            let mtoIGV = 0

            for (const a of this.vista.data.socio_pedido_items) {
                if (a.igv_afectacion == '10') {
                    mtoOperGravadas += a.mtoValorVenta
                    mtoIGV += a.igv
                } else if (a.igv_afectacion == '20') {
                    mtoOperExoneradas += a.mtoValorVenta
                } else if (a.igv_afectacion == '30') {
                    mtoOperInafectas += a.mtoValorVenta
                }
            }

            this.vista.mtoOperGravadas = mtoOperGravadas
            this.vista.mtoOperExoneradas = mtoOperExoneradas
            this.vista.mtoOperInafectas = mtoOperInafectas
            this.vista.mtoIGV = mtoIGV
            this.vista.valorVenta = mtoOperGravadas + mtoOperExoneradas + mtoOperInafectas
            this.vista.mtoImpVenta = this.vista.valorVenta + mtoIGV
        },
        sumarItems() {
            for (const a of this.vista.data.socio_pedido_items) this.calcularUno(a)
            this.calcularTotales()
        },
        sumarUno(item) {
            this.calcularUno(item)
            this.calcularTotales()
        },
        descargarPlantilla() {
            const columns = [
                { title: 'EAN' },
                { title: 'Nombre' },
                { title: 'Cantidad' },
                { title: 'Valor unitario' },
            ]
            downloadExcel(columns, [], 'plantilla_pedidos.xlsx')
        },

        //--- Auxiliar data ---//
        async loadArticulos(txtBuscar) {
            const qry = {
                fltr: {
                    activo: { op: 'Es', val: true },
                },
                cols: ['nombre', 'unidad', 'igv_afectacion', 'has_fv'],
                ordr: [['nombre', 'ASC']],
                limt: 25,
            }

            if (txtBuscar) {
                qry.fltr.nombre = { op: 'Contiene', val: txtBuscar }
            }

            if (this.vista.data.tipo == 1) {
                qry.fltr.purchase_ok = { op: 'Es', val: true }
                qry.incl = ['articulo_suppliers']
            } else {
                qry.fltr.sale_ok = { op: 'Es', val: true }
            }

            const res = await get(`${urls.articulos}?qry=${JSON.stringify(qry)}`)

            if (res.code !== 0) return []
            return res.data
        },
    },
}
</script>

<style scoped>
.agregar {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.botom {
    display: flex;
    justify-content: space-between;
    margin-top: 2rem;
    gap: 2rem;

    .left {
        display: grid;
        grid-template-columns: 30rem;
        gap: 0.5rem;
        height: fit-content;
    }

    .totales {
        background-color: var(--bg-color2);
        padding: 1rem;
        border-radius: 0.5rem;
        display: grid;
        grid-template-columns: 10rem 10rem;
        gap: 0.5rem;
        align-items: center;
        height: fit-content;

        p {
            text-align: right;
        }

        .total {
            font-size: 1.4rem;
            text-align: right;
        }
    }
}
</style>
