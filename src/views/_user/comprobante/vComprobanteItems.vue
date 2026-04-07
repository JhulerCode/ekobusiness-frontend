<template>
    <div class="comprobante-items">
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
                    id: 'descripcion',
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
                    id: 'vu',
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
    async created() {
        await this.system.load(['igv_afectaciones'])

        // const exec = setInterval(() => {
        //     if (this.vista.data?.comprobante_items) {
        //         this.sumarItems()
        //         clearInterval(exec)
        //     }
        // }, 100)
    },
    methods: {
        runMethod(method, item) {
            this[method](item)
        },

        elegirIgv(igv, item) {
            this.calcularUno(item)
            this.calcularTotales()
        },
        calcularUno(item) {
            const vu = parseFloat(item.vu) || 0
            const cantidad = parseFloat(item.cantidad) || 0
            const igv_porcentaje = parseFloat(item.igv_porcentaje) || 0

            item.mtoValorVenta = cantidad * vu
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

        async removeLine(item) {
            const i = this.vista.data.comprobante_items.findIndex((a) => a.id == item.id)
            this.vista.data.comprobante_items.splice(i, 1)
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
