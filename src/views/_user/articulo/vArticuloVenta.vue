<template>
    <div class="container-datos">
        <JdInput
            label="Precio de venta/lista"
            type="number"
            v-model="vista.data.list_price"
            :disabled="vista.mode !== 'edit'"
        />

        <JdCheckBox
            label="Mostrar en ecommerce"
            v-model="vista.data.is_ecommerce"
            :disabled="vista.mode !== 'edit'"
        />

        <template v-if="vista.data.is_ecommerce == true">
            <div class="mrg-top1" style="grid-column: 1/3">
                <strong>--- Datos para el ecommerce ---</strong>
            </div>

            <JdTextArea
                label="Descripción"
                :nec="true"
                v-model="vista.data.descripcion"
                style="grid-column: 1/3"
                :disabled="vista.mode !== 'edit'"
            />

            <JdInput
                label="Precio de venta"
                :nec="true"
                type="number"
                v-model="vista.data.precio"
                :disabled="vista.mode !== 'edit'"
            />

            <JdInput
                label="Precio anterior"
                type="number"
                v-model="vista.data.precio_anterior"
                :disabled="vista.mode !== 'edit'"
            />

            <JdInput
                label="Contenido neto (g)"
                type="number"
                v-model="vista.data.contenido_neto"
                :disabled="vista.mode !== 'edit'"
            />

            <JdInput
                label="Dimenciones"
                v-model="vista.data.dimenciones"
                placeholder="largo x ancho x alto mm"
                :disabled="vista.mode !== 'edit'"
            />

            <JdInput
                label="Tipo de envase"
                v-model="vista.data.envase_tipo"
                placeholder="CAJA, BOLSA"
                :disabled="vista.mode !== 'edit'"
            />

            <JdCheckBox
                label="Destacado"
                v-model="vista.data.is_destacado"
                :disabled="vista.mode !== 'edit'"
            />

            <JdTable
                :columns="columns_ingredientes"
                :datos="vista.data.ingredientes"
                :rowOptions="rowActionsIngredientes"
                rowOptionsMode="buttons"
                @rowOptionSelected="runMethod"
                :inputsDisabled="vista.mode == 'view'"
                :agregarFila="vista.mode == 'view' ? null : addIngrediente"
                style="grid-column: 1/3"
            />

            <JdTable
                :columns="columns_beneficios"
                :datos="vista.data.beneficios"
                :rowOptions="rowActionsBeneficios"
                rowOptionsMode="buttons"
                @rowOptionSelected="runMethod"
                :inputsDisabled="vista.mode == 'view'"
                :agregarFila="vista.mode == 'view' ? null : addBeneficio"
                style="grid-column: 3/5"
            />
        </template>
    </div>
</template>

<script>
import { useVistas } from '@/pinia/vistas'

export default {
    data: () => ({
        vistas: useVistas(),
        columns_ingredientes: [
            {
                id: 'nombre',
                title: 'Ingredientes',
                width: '25rem',
                input: true,
                type: 'longtext',
                show: true,
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
            },
        ],
    }),
    computed: {
        vista() {
            return this.vistas[this.$route.name] || { data: {} }
        },
        rowActionsIngredientes() {
            if (this.vista.mode == 'view') return []

            return [
                {
                    icon: 'fa-solid fa-trash',
                    title: 'Eliminar',
                    action: 'removeIngrediente',
                },
            ]
        },
        rowActionsBeneficios() {
            if (this.vista.mode == 'view') return []

            return [
                {
                    icon: 'fa-solid fa-trash',
                    title: 'Eliminar',
                    action: 'removeBeneficio',
                },
            ]
        },
    },
    methods: {
        runMethod(method, item) {
            this[method](item)
        },
        addIngrediente() {
            this.vista.data.ingredientes.push({
                id: crypto.randomUUID(),
            })
        },
        removeIngrediente(item) {
            this.vista.data.ingredientes = this.vista.data.ingredientes.filter(
                (a) => a.id != item.id,
            )
        },
        addBeneficio() {
            this.vista.data.beneficios.push({
                id: crypto.randomUUID(),
            })
        },
        removeBeneficio(item) {
            this.vista.data.beneficios = this.vista.data.beneficios.filter((a) => a.id != item.id)
        },
    },
}
</script>

<style lang="scss" scoped></style>
