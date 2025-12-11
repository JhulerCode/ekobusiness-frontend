<template>
    <JdModal
        modal="mProduccionTrazabilidad"
        :buttons="buttons"
        @button-click="(action) => this[action]()"
    >
        <div ref="elementoPdf" class="div1">
            <div class="container-datos">
                <p style="grid-column: 1/3">
                    <strong>--- Orden de producción ---</strong>
                </p>

                <JdInput
                    type="date"
                    label="Fecha"
                    v-model="modal.produccion_orden.fecha"
                    :disabled="true"
                    style="grid-column: 1/3"
                />

                <template v-if="modal.produccion_orden.tipo != 2">
                    <JdSelect
                        label="Máquina"
                        v-model="modal.produccion_orden.maquina"
                        :lista="modal.maquinas"
                        :disabled="true"
                        style="grid-column: 3/5"
                    />
                </template>

                <JdSelectQuery
                    label="Producto"
                    v-model="modal.produccion_orden.articulo"
                    :lista="modal.articulos"
                    :disabled="true"
                    style="grid-column: 1/4"
                />

                <JdInput
                    type="number"
                    label="Cantidad planificada"
                    v-model="modal.produccion_orden.cantidad"
                    :disabled="true"
                    style="grid-column: 1/3"
                />

                <JdButton
                    tipo="2"
                    :small="true"
                    icon="fa-solid fa-rotate-right"
                    :disabled="true"
                    @click="loadTrazabilidad"
                />
            </div>

            <div class="mrg-btm2">
                <p class="mrg-btm05">
                    <strong>--- Insumos ---</strong>
                </p>
                <JdTable
                    :columns="columns1"
                    :datos="modal.insumos || []"
                    :seeker="false"
                    :download="false"
                >
                    <!-- <template v-slot:cAction="{ item }">
                    <JdButton tipo="2" :small="true" icon="fa-regular fa-folder-open" :disabled="true"
                        @click="verCompra(item)" />
                </template> -->
                </JdTable>
            </div>

            <div>
                <p class="mrg-btm05">
                    <strong>--- Productos terminados ---</strong>
                </p>
                <JdTable
                    :columns="columns2"
                    :datos="modal.productos_terminados || []"
                    :seeker="false"
                    :download="false"
                >
                </JdTable>
            </div>
        </div>
    </JdModal>
</template>

<script>
import { JdModal, JdInput, JdSelect, JdSelectQuery, JdTable, JdButton } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'

import { urls, get } from '@/utils/crud'

import html2pdf from 'html2pdf.js'

export default {
    components: {
        JdModal,
        JdInput,
        JdSelectQuery,
        JdSelect,
        JdTable,
        JdButton,
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
                format: 'decimal',
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
        this.modal = this.useModals.mProduccionTrazabilidad

        this.loadTrazabilidad()
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
        async loadTrazabilidad() {
            this.modal.insumos = []
            this.modal.productos_terminados = []

            this.useAuth.setLoading(true, 'Cargando trazabilidad...')
            const res = await get(
                `${urls.produccion_ordenes}/trazabilidad/${this.modal.produccion_orden.id}`,
            )
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.insumos = res.data.insumos
            this.modal.productos_terminados = res.data.productos_terminados
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
