<template>
    <JdModal
        modal="mSocioPedidoPdf"
        :buttons="buttons"
        @button-click="(action) => this[action]()"
    >
        <div ref="elementoPdf" class="div1">
            <div class="pdf-head">
                <div class="left">
                    <img src="@/assets/img/logo-sunka-black.webp">
                </div>

                <div class="center">
                    <strong>EKO BUSINESS S.A.C.</strong>
                    <p>Calle 7 Mz 5 Urb Los Productores</p>
                    <p>Tel: 01 432 865</p>
                    <p>Correo: comercial@sunka.com</p>
                </div>

                <div class="right">

                </div>
            </div>

            <div>
                <!-- <JdTable
                    :columns="columns2"
                    :datos="modal.produccion_orden.productos_terminados || []"
                    :seeker="false"
                    :download="false"
                >
                </JdTable> -->
            </div>
        </div>
    </JdModal>
</template>

<script>
import JdModal from '@/components/JdModal.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'

import { urls, get } from '@/utils/crud'

import html2pdf from 'html2pdf.js'

export default {
    components: {
        JdModal,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),

        modal: {},

        buttons: [{ text: 'Exportar en PDF', action: 'imprimir', show: true }],

        columns1: [
            {
                id: 'articulo',
                title: 'Nombre',
                prop: 'articulo1.nombre',
                width: '20rem',
                show: true,
            },
            {
                id: 'lote',
                prop: 'lote_padre1.lote',
                title: 'Lote',
                width: '8rem',
                show: true,
            },
            {
                id: 'fv',
                title: 'Fecha vencimiento',
                prop: 'lote_padre1.fv',
                width: '8rem',
                show: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                toRight: true,
                width: '8rem',
                show: true,
            },
        ],

        columns2: [
            {
                id: 'lote',
                title: 'Lote',
                width: '10rem',
                show: true,
            },
            {
                id: 'fv',
                title: 'Fecha vencimiento',
                width: '8rem',
                show: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                toRight: true,
                width: '10rem',
                show: true,
            },
        ],
    }),
    created() {
        this.modal = this.useModals.mSocioPedidoPdf
    },
    methods: {
        async verCompra(item) {
            this.useAuth.setLoading(true, 'Cargando compra...')
            const res = await get(urls.transacciones + '/uno/' + item.transaccion)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const send = {
                transaccion: res.data,
                socio: { ...res.data.socio1 },
                socios: [{ ...res.data.socio1 }],
                monedas: [{ ...res.data.moneda1 }],
                pedidos: res.data.socio_pedido ? [{ ...res.data.socio_pedido1 }] : [],
            }

            this.useModals.setModal('mTransaccion', 'Ver compra', 3, send, true)
        },
        imprimir() {
            const element = this.$refs.elementoPdf

            const opciones = {
                margin: 0.5,
                filename: 'trazabilidad.pdf',
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
.container-datos {
    display: grid;
    grid-template-columns: repeat(4, 10rem);
    gap: 0.5rem;
    margin-bottom: 2rem;
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
