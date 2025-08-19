<template>
    <JdModal modal="mSocioPedidoPdf" :buttons="buttons" @button-click="(action) => this[action]()">
        <div ref="elementoPdf" class="pdfall">
            <div class="pdfheader">
                <div class="left">
                    <img src="@/assets/img/logo-sunka-black.webp" />
                </div>

                <div class="center">
                    <p>
                        <strong>{{ modal.empresa?.nombre }}</strong>
                    </p>
                    <p>
                        <span>{{
                            modal.empresa?.direcciones.find((a) => a.principal == true).direccion
                        }}</span
                        ><br />
                        <span>{{
                            modal.empresa?.direcciones.find((a) => a.principal == true).distrito
                        }}</span
                        ><br />
                        <span>{{ modal.empresa?.telefono }}</span
                        ><br />
                        <span>{{ modal.empresa?.correo }}</span>
                    </p>
                </div>

                <div class="right">
                    <div>
                        <strong>R.U.C. 20601670560</strong>
                    </div>
                    <div>
                        <strong>ORDEN DE COMPRA</strong>
                    </div>
                    <div>
                        <strong>1755617337892147</strong>
                    </div>
                </div>
            </div>

            <ul class="pdfheader2">
                <li>
                    <strong>Fecha de emisión</strong>
                    <span>:</span>
                    <span>{{ modal.item.fecha }}</span>
                </li>

                <li>
                    <strong>Condición de pago</strong>
                    <span>:</span>
                    <span>{{ modal.item.pago_condicion1.nombre }}</span>
                </li>

                <li>
                    <strong>Moneda</strong>
                    <span>:</span>
                    <span>{{ modal.item.moneda1.nombre }}</span>
                </li>

                <!-- <li>
                    <strong>Fecha de entrega</strong>
                    <span>:</span>
                    <span>{{ modal.item.fecha_entrega }}</span>
                </li> -->
                <li>
                    <strong>Tiempo de entrega</strong>
                    <span>:</span>
                    <span>7 a 10 días</span>
                </li>

                <li>
                    <strong>Lugar de entrega</strong>
                    <span>:</span>
                    <span>{{ modal.item.direccion_entrega }}</span>
                </li>
            </ul>

            <div class="pdflocutores">
                <div class="left">
                    <div class="locheader">
                        <strong>{{ modal.item.tipo == 1 ? 'Proveedor' : 'Cliente' }}</strong>
                    </div>

                    <ul class="locbody">
                        <li>
                            <strong>Razón social</strong>
                            <span>:</span>
                            <span>{{ modal.item.socio1.nombres_apellidos }}</span>
                        </li>

                        <li>
                            <strong>Ruc</strong>
                            <span>:</span>
                            <span>{{ modal.item.socio1.doc_numero }}</span>
                        </li>

                        <li>
                            <strong>Contacto</strong>
                            <span>:</span>
                            <span>{{ modal.item.contacto_datos.nombre }}</span>
                        </li>

                        <li>
                            <strong>Teléfono</strong>
                            <span>:</span>
                            <span>{{ modal.item.contacto_datos.telefono }}</span>
                        </li>
                    </ul>
                </div>

                <div class="rigth">
                    <div class="locheader">
                        <strong>{{ modal.item.tipo == 1 ? 'Comprador' : 'Vendedor' }}</strong>
                    </div>

                    <ul class="locbody">
                        <li>
                            <strong>Contacto</strong>
                            <span>:</span>
                            <span>{{ modal.item.createdBy1.nombres_apellidos }}</span>
                        </li>

                        <li>
                            <strong>Cargo</strong>
                            <span>:</span>
                            <span>{{ modal.item.createdBy1.cargo }}</span>
                        </li>

                        <li>
                            <strong>Teléfono</strong>
                            <span>:</span>
                            <span>{{ modal.item.createdBy1.telefono }}</span>
                        </li>
                    </ul>
                </div>
            </div>

            <JdTable
                :columns="columns"
                :datos="modal.item.socio_pedido_items || []"
                :seeker="false"
                :download="false"
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
                            {{ modal.item.observacion }}
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
                            {{ modal.item.moneda1.simbolo }}
                            {{ redondear(modal.mtoImpVenta) }}
                        </strong>
                    </p>
                </div>
            </div>

            <div class="bancos" v-if="modal.item.tipo == 2">
                <div class="locheader">
                    <strong>Detalle de bancos</strong>
                </div>

                <ul>
                    <li v-for="(a, i) in modal.empresa?.bancos || []" :key="i">
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
import JdModal from '@/components/JdModal.vue'
import JdTable from '@/components/JdTable.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'

import { urls, get } from '@/utils/crud'
import { numeroATexto, redondear } from '@/utils/mine'
import html2pdf from 'html2pdf.js'

export default {
    components: {
        JdModal,
        JdTable,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        numeroATexto,
        redondear,

        modal: {},

        buttons: [{ text: 'Exportar en PDF', action: 'imprimir', show: true }],

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
                toRight: true,
                format: 'number',
                width: '5rem',
                show: true,
            },
            {
                id: 'pu',
                title: 'Val. uni.',
                toRight: true,
                width: '5rem',
                show: true,
            },
            {
                id: 'vu',
                title: 'Pre. uni.',
                toRight: true,
                format: 'decimal',
                width: '5rem',
                show: true,
            },
            {
                id: 'mtoValorVenta',
                title: 'Subtotal',
                format: 'decimal',
                toRight: true,
                width: '7rem',
                show: true,
            },
        ],
    }),
    created() {
        this.modal = this.useModals.mSocioPedidoPdf

        this.loadDatosSistema()
        this.sumarItems()
    },
    methods: {
        sumarItems() {
            for (const a of this.modal.item.socio_pedido_items) this.calcularUno(a)

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

            for (const a of this.modal.item.socio_pedido_items) {
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
        async loadDatosSistema() {
            const qry = ['empresa']

            useAuth().setLoading(true, 'Cargando...')
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)
            useAuth().setLoading(false)

            if (res.code != 0) return

            Object.assign(this.modal, res.data)
        },
        imprimir() {
            const element = this.$refs.elementoPdf

            const opciones = {
                margin: 0.5,
                filename: `oc${this.modal.item.codigo}.pdf`,
                image: { type: 'jpeg', quality: 1 },
                html2canvas: { scale: 4 },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
            }

            html2pdf().set(opciones).from(element).save()
        },
    },
}
</script>

<style lang="scss" scoped>
.pdfall {
    width: 7.27in;
    // height: 10.69in;

    * {
        font-family: 'Roboto', sans-serif;
        font-size: 0.9rem;
    }
}

.pdfheader {
    display: grid;
    grid-template-columns: 11rem 1fr 15rem;
    gap: 1rem;
    margin-bottom: 1rem;

    img {
        max-width: 100%;
        max-height: 100%;
        margin-top: 1rem;
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
            * {
                font-size: 0.8rem;
            }
            margin-bottom: 1rem;
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
