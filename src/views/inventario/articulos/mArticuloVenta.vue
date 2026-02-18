<template>
    <div class="container-datos" v-if="modal.pestana == 3">
        <JdInput label="Precio de venta/lista" type="number" v-model="modal.articulo.list_price" />

        <JdCheckBox label="Mostrar en ecommerce" v-model="modal.articulo.is_ecommerce" />

        <template v-if="modal.articulo.is_ecommerce == true">
            <div class="mrg-top1" style="grid-column: 1/3">
                <strong>--- Datos para el ecommerce ---</strong>
            </div>

            <JdTextArea
                label="Descripción"
                :nec="true"
                v-model="modal.articulo.descripcion"
                :disabled="modal.mode == 3"
                style="grid-column: 1/3"
            />

            <JdInput
                label="Precio de venta"
                :nec="true"
                type="number"
                v-model="modal.articulo.precio"
            />

            <JdInput
                label="Precio anterior"
                type="number"
                v-model="modal.articulo.precio_anterior"
            />

            <JdInput
                label="Contenido neto (g)"
                type="number"
                v-model="modal.articulo.contenido_neto"
            />

            <JdInput
                label="Dimenciones"
                v-model="modal.articulo.dimenciones"
                placeholder="largo x ancho x alto mm"
            />

            <JdInput
                label="Tipo de envase"
                v-model="modal.articulo.envase_tipo"
                placeholder="CAJA, BOLSA"
            />

            <JdCheckBox label="Destacado" v-model="modal.articulo.is_destacado" />

            <JdTable
                :columns="columns_ingredientes"
                :datos="modal.articulo.ingredientes"
                :seeker="false"
                :download="false"
                :colAct="true"
                :showResumen="false"
                :agregarFila="addIngrediente"
                style="grid-column: 1/3"
                class="mrg-top1"
            >
                <template v-slot:cAction="{ item }">
                    <JdButton
                        icon="fa-solid fa-trash"
                        title="Eliminar"
                        tipo="2"
                        :small="true"
                        @click="removeIngrediente(item)"
                    />
                </template>
            </JdTable>

            <JdTable
                :columns="columns_beneficios"
                :datos="modal.articulo.beneficios"
                :seeker="false"
                :download="false"
                :colAct="true"
                :showResumen="false"
                :agregarFila="addBeneficio"
                style="grid-column: 1/3"
                class="mrg-top1"
            >
                <template v-slot:cAction="{ item }">
                    <JdButton
                        icon="fa-solid fa-trash"
                        title="Eliminar"
                        tipo="2"
                        :small="true"
                        @click="removeBeneficio(item)"
                    />
                </template>
            </JdTable>
        </template>
    </div>
</template>

<script>
import { JdButton, JdInput, JdTextArea, JdCheckBox } from '@jhuler/components'
import JdTable from '@/components/JdTable.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

export default {
    components: {
        JdTable,
        JdButton,
        JdInput,
        JdTextArea,
        JdCheckBox,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},
        columns_ingredientes: [
            {
                id: 'nombre',
                title: 'Ingredientes',
                width: '25rem',
                input: true,
                type: 'longtext',
                show: true,
                sort: true,
            },
        ],
        columns_beneficios: [
            {
                id: 'nombre',
                title: 'Beneficios',
                width: '25rem',
                input: true,
                type: 'longtext',
                show: true,
                sort: true,
            },
        ],
    }),
    created() {
        this.modal = this.useModals.mArticulo
    },
    methods: {
        addIngrediente() {
            this.modal.articulo.ingredientes.push({
                id: crypto.randomUUID(),
            })
        },
        removeIngrediente(item) {
            this.modal.articulo.ingredientes = this.modal.articulo.ingredientes.filter(
                (a) => a.id != item.id,
            )
        },
        addBeneficio() {
            this.modal.articulo.beneficios.push({
                id: crypto.randomUUID(),
            })
        },
        removeBeneficio(item) {
            this.modal.articulo.beneficios = this.modal.articulo.beneficios.filter(
                (a) => a.id != item.id,
            )
        },
    },
}
</script>
