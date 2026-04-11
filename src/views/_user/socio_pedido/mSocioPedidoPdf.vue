<template>
    <JdModal modal="mSocioPedidoPdf" :buttons="buttons" @button-click="(action) => this[action]()">
        <div ref="elementoPdf" class="pdfall">
            <div class="pdfheader">
                <div class="left">
                    <img :src="useAuth.empresa.logo.url" crossorigin="anonymous" />
                </div>

                <div class="center">
                    <p>
                        <strong>{{ useAuth.empresa?.razon_social }}</strong>
                    </p>
                    <p>
                        <span>{{
                            useAuth.empresa?.direcciones.find((a) => a.principal == true).direccion
                        }}</span
                        ><br />
                        <span>{{
                            useAuth.empresa?.direcciones.find((a) => a.principal == true).distrito
                        }}</span
                        ><br />
                        <span>{{ useAuth.empresa?.telefono }}</span
                        ><br />
                        <span>{{ useAuth.empresa?.correo }}</span>
                    </p>
                </div>

                <div class="right">
                    <div>
                        <strong>R.U.C. {{ useAuth.empresa?.ruc }}</strong>
                    </div>
                    <div>
                        <strong>ORDEN DE COMPRA</strong>
                    </div>
                    <div>
                        <strong>{{ modal.socio_pedido.codigo }}</strong>
                    </div>
                </div>
            </div>

            <ul class="pdfheader2">
                <li>
                    <strong>Fecha de emisión</strong>
                    <span>:</span>
                    <span>{{ modal.socio_pedido.fecha }}</span>
                </li>

                <li>
                    <strong>Condición de pago</strong>
                    <span>:</span>
                    <span>{{ modal.socio_pedido.pago_condicion1.nombre }}</span>
                </li>

                <li>
                    <strong>Moneda</strong>
                    <span>:</span>
                    <span>{{ modal.socio_pedido.moneda1.nombre }}</span>
                </li>

                <!-- <li>
                    <strong>Fecha de entrega</strong>
                    <span>:</span>
                    <span>{{ modal.socio_pedido.fecha_entrega }}</span>
                </li> -->
                <li>
                    <strong>Tiempo de entrega</strong>
                    <span>:</span>
                    <span>7 a 10 días hábiles</span>
                </li>

                <li>
                    <strong>Lugar de entrega</strong>
                    <span>:</span>
                    <span>{{ modal.socio_pedido.direccion_entrega }}</span>
                </li>
            </ul>

            <div class="pdflocutores">
                <div class="left">
                    <div class="locheader">
                        <strong>{{
                            modal.socio_pedido.tipo == 1 ? 'Proveedor' : 'Cliente'
                        }}</strong>
                    </div>

                    <ul class="locbody">
                        <li>
                            <strong>Razón social</strong>
                            <span>:</span>
                            <span>{{ modal.socio_pedido.socio1.nombres }}</span>
                        </li>

                        <li>
                            <strong>Ruc</strong>
                            <span>:</span>
                            <span>{{ modal.socio_pedido.socio1.doc_numero }}</span>
                        </li>

                        <li>
                            <strong>Contacto</strong>
                            <span>:</span>
                            <span>{{ modal.socio_pedido.contacto_datos?.nombre }}</span>
                        </li>

                        <li>
                            <strong>Teléfono</strong>
                            <span>:</span>
                            <span>{{ modal.socio_pedido.contacto_datos?.telefono }}</span>
                        </li>
                    </ul>
                </div>

                <div class="rigth">
                    <div class="locheader">
                        <strong>{{
                            modal.socio_pedido.tipo == 1 ? 'Comprador' : 'Vendedor'
                        }}</strong>
                    </div>

                    <ul class="locbody">
                        <li>
                            <strong>Contacto</strong>
                            <span>:</span>
                            <span>{{ modal.socio_pedido.createdBy1.nombres }}</span>
                        </li>

                        <li>
                            <strong>Cargo</strong>
                            <span>:</span>
                            <span>{{ modal.socio_pedido.createdBy1.cargo }}</span>
                        </li>

                        <li>
                            <strong>Teléfono</strong>
                            <span>:</span>
                            <span>{{ modal.socio_pedido.createdBy1.telefono }}</span>
                        </li>
                    </ul>
                </div>
            </div>

            <JdTable
                :columns="columns"
                :datos="modal.socio_pedido.socio_pedido_items || []"
                :showResumen="false"
                class="mrg-btm1"
            >
            </JdTable>

            <div class="pdffooter">
                <div class="left">
                    <div class="totalletras">
                        <strong>SON:</strong> <span>{{ numeroATexto(modal.mtoImpVenta) }}</span>
                    </div>

                    <div class="observaciones">
                        <p class="mrg-btm05">
                            <strong>Observaciones:</strong>
                        </p>
                        <p>
                            {{ modal.socio_pedido.observacion }}
                        </p>
                    </div>
                </div>

                <div class="totales">
                    <span>Ope. gravadas</span>
                    <span>:</span>
                    <p>{{ redondear(modal.mtoOperGravadas) }}</p>

                    <span>Ope. exoneradas</span>
                    <span>:</span>
                    <p>{{ redondear(modal.mtoOperExoneradas) }}</p>

                    <span>Ope. inafectas</span>
                    <span>:</span>
                    <p>{{ redondear(modal.mtoOperInafectas) }}</p>

                    <span>Subtotal</span>
                    <span>:</span>
                    <p>{{ redondear(modal.valorVenta) }}</p>

                    <span>Impuesto</span>
                    <span>:</span>
                    <p>{{ redondear(modal.mtoIGV) }}</p>

                    <strong>Importe total</strong>
                    <span>:</span>
                    <p>
                        <strong class="total">
                            {{ modal.socio_pedido.moneda1.simbolo }}
                            {{ redondear(modal.mtoImpVenta) }}
                        </strong>
                    </p>
                </div>
            </div>

            <div class="bancos" v-if="modal.socio_pedido.tipo == 2">
                <div class="locheader">
                    <strong>Detalle de bancos</strong>
                </div>

                <ul>
                    <li v-for="(a, i) in useAuth.empresa?.bancos || []" :key="i">
                        <span>{{ a.nombre }}</span
                        ><br />
                        <strong>Moneda:</strong> <span>{{ a.moneda }}</span
                        ><br />
                        <strong>NC:</strong> <span>{{ a.nc }}</span
                        ><br />
                        <strong>CCI:</strong> <span>{{ a.cci }}</span>
                    </li>
                </ul>
            </div>
        </div>
    </JdModal>
</template>

<script>
import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'

import { numeroATexto, redondear } from '@/utils/mine'
import html2pdf from 'html2pdf.js'

export default {
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        numeroATexto,
        redondear,

        modal: {},

        buttons: [{ text: 'Exportar en PDF', action: 'exportarPdf', show: true }],

        columns: [
            {
                id: 'nombre',
                title: 'Descripción',
                width: '20rem',
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
                align: 'right',
                format: 'number',
                width: '5rem',
                show: true,
            },
            {
                id: 'pu',
                title: 'Val. uni.',
                align: 'right',
                width: '5rem',
                show: true,
            },
            {
                id: 'vu',
                title: 'Pre. uni.',
                align: 'right',
                format: 'decimal',
                width: '5rem',
                show: true,
            },
            {
                id: 'mtoValorVenta',
                title: 'Subtotal',
                format: 'decimal',
                align: 'right',
                width: '7rem',
                show: true,
            },
        ],
    }),
    created() {
        this.modal = this.useModals.mSocioPedidoPdf

        this.sumarItems()
    },
    methods: {
        sumarItems() {
            for (const a of this.modal.socio_pedido.socio_pedido_items) this.calcularUno(a)

            this.calcularTotales()
        },
        calcularUno(item) {
            item.vu =
                item.igv_afectacion == '10' ? item.pu * (1 + item.igv_porcentaje / 100) : item.pu

            item.mtoValorVenta = item.cantidad * item.pu
            item.igv =
                item.igv_afectacion == '10' ? item.mtoValorVenta * (item.igv_porcentaje / 100) : 0
            item.total = item.mtoValorVenta + item.igv
        },
        calcularTotales() {
            this.modal.mtoOperGravadas = 0
            this.modal.mtoOperExoneradas = 0
            this.modal.mtoOperInafectas = 0
            this.modal.mtoIGV = 0

            for (const a of this.modal.socio_pedido.socio_pedido_items) {
                if (a.igv_afectacion == '10') {
                    this.modal.mtoOperGravadas += a.mtoValorVenta
                    this.modal.mtoIGV += a.igv
                } else if (a.igv_afectacion == '20') {
                    this.modal.mtoOperExoneradas += a.mtoValorVenta
                } else if (a.igv_afectacion == '30') {
                    this.modal.mtoOperInafectas += a.mtoValorVenta
                }
            }

            this.modal.valorVenta =
                this.modal.mtoOperGravadas +
                this.modal.mtoOperExoneradas +
                this.modal.mtoOperInafectas
            this.modal.mtoImpVenta = this.modal.valorVenta + this.modal.mtoIGV
        },
        exportarPdf() {
            const element = this.$refs.elementoPdf

            const opciones = {
                margin: 0.5,
                filename: `oc${this.modal.socio_pedido.codigo}.pdf`,
                image: { type: 'jpeg', quality: 1 },
                html2canvas: { scale: 4, useCORS: true },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
            }

            // html2pdf().set(opciones).from(element).save()
            html2pdf()
                .set(opciones)
                .from(element)
                .toPdf()
                .get('pdf')
                .then((pdf) => {
                    const totalPages = pdf.internal.getNumberOfPages() // Obtenemos el total de páginas
                    for (let i = 1; i <= totalPages; i++) {
                        pdf.setPage(i) // Nos situamos en la página i
                        pdf.setFontSize(8)
                        pdf.setTextColor(150)

                        // Añadimos el texto: Página X de Y
                        // El formato es: texto, x (horizontal), y (vertical)
                        // 8.27 es el ancho de A4 en pulgadas, 11.69 es el alto
                        pdf.text(
                            `Página ${i} de ${totalPages}`,
                            pdf.internal.pageSize.getWidth() / 2,
                            pdf.internal.pageSize.getHeight() - 0.25,
                            { align: 'center' },
                        )
                    }
                })
                .save()
        },
    },
}
</script>

<style lang="scss" scoped>
.pdfall {
    width: 7.27in;
    // height: 10.69in;
    background-color: white;

    * {
        font-family: 'Roboto', sans-serif;
        font-size: 0.9rem;
        --bg-color: #ffffff;
        --bg-color-hover: whitesmoke;
        --bg-color-selected: #def8f2;

        --bg-color2: #f2f2f2;
        --bg-color-transparent: rgba(0, 0, 0, 0.5);

        --text-color: black;
        --text-color2: rgba(60, 60, 60, 0.66);

        --border: solid 1px #dfdfdf;
        --shadow-color: #d1d0d0;
    }
}

.pdfheader {
    display: grid;
    grid-template-columns: 11rem 1fr 15rem;
    gap: 1rem;
    margin-bottom: 1rem;

    .left {
        display: flex;
        align-items: center;
        justify-content: center;

        img {
            max-width: 100%;
            max-height: 100%;
        }
    }

    .center {
        text-align: center;
        margin-top: 1rem;

        p {
            margin-bottom: 0.5rem;
        }
    }

    .right {
        // text-align: center;
        border: var(--border);
        border-radius: 1rem;

        div {
            height: 2.5rem;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        div:nth-child(2) {
            height: 3rem;
            background-color: var(--bg-color2);
        }

        * {
            font-size: 1.2rem;
        }
    }
}

.pdfheader2 {
    margin-bottom: 1.5rem;
    padding: 0.5rem;

    li {
        display: grid;
        grid-template-columns: 9rem 1rem 1fr;
    }

    * {
        line-height: 1.35;
    }
}

.pdflocutores {
    margin-bottom: 1.5rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;

    .locheader {
        background-color: var(--bg-color2);
        padding: 0.3rem 0.5rem;

        * {
            color: var(--text-color2);
        }
    }

    .locbody {
        padding: 0.5rem;

        li {
            display: grid;
            grid-template-columns: 7rem 1rem 1fr;
        }

        * {
            line-height: 1.35;
        }
    }
}

.pdffooter {
    margin-bottom: 2rem;
    display: grid;
    grid-template-columns: 2fr 1.2fr;
    gap: 2rem;

    .left {
        .totalletras {
            margin-bottom: 1rem;

            * {
                font-size: 0.8rem;
            }
        }

        .observaciones {
            border: var(--border);
            border-radius: 1rem;
            padding: 0.5rem;
            height: 8.6rem;
        }
    }

    .totales {
        padding: 1rem;
        border-radius: 1rem;
        border: var(--border);
        display: grid;
        grid-template-columns: 8rem 1rem 1fr;
        gap: 0.5rem 0;
        align-items: center;
        height: fit-content;

        p {
            text-align: right;
        }
    }
}

.bancos {
    .locheader {
        background-color: var(--bg-color2);
        padding: 0.3rem 0.5rem;

        * {
            color: var(--text-color2);
        }
    }

    ul {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        padding: 0.5rem;
        * {
            line-height: 1.35;
        }
    }
}

@media print {
    body * {
        visibility: hidden;
    }
    .imprimir-solo,
    .imprimir-solo * {
        visibility: visible;
    }
    .imprimir-solo {
        position: absolute;
        left: 0;
        top: 0;
    }
}
</style>
