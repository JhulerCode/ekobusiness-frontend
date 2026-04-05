<template>
    <div class="comprobante-items">
        <div class="actions mb-3" v-if="vista.mode != 'view'">
            <JdButton icon="fa-solid fa-sync" text="Cargar Recepciones" tipo="3" />
        </div>

        <JdTable
            :columns="columns"
            :datos="vista.data.comprobante_items"
            :rowOptions="rowActions"
            rowOptionsMode="buttons"
            @rowOptionSelected="runMethod"
            :inputsDisabled="vista.mode == 'view'"
            @onInput="runMethod"
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
import { useAuth } from '@/pinia/auth'
import { useSystem } from '@/pinia/system'
import { useVistas } from '@/pinia/vistas'
import { redondear } from '@/utils/mine'
// import { get } from '@/utils/crud'
// import { jmsg } from '@/utils/swal'

export default {
    props: ['comprobanteId', 'socioId'],
    data: () => ({
        system: useSystem(),
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
                        lista: this.system.data.igv_afectaciones,
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
            return []
        },
    },
    async created() {
        await this.system.load(['igv_afectaciones'])
        if (this.vista.data?.comprobante_items?.length > 0) {
            this.sumarItems()
        }
    },
    methods: {
        runMethod(method, item) {
            this[method](item)
        },

        elegirIgv(igv, item) {
            item.igv_porcentaje = item.igv_afectacion == '10' ? this.auth.empresa.igv_porcentaje : 0
            this.calcularUno(item)
            this.calcularTotales()
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

            for (const a of this.vista.data.comprobante_items) {
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
            for (const a of this.vista.data.comprobante_items) this.calcularUno(a)
            this.calcularTotales()
        },
        sumarUno(item) {
            this.calcularUno(item)
            this.calcularTotales()
        },
    },
}
</script>

<style scoped>
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
