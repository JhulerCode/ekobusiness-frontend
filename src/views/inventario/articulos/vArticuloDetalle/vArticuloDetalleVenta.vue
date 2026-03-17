<template>
    <div class="container-datos">
        <JdInput label="Precio de venta/lista" type="number" v-model="vista.data.list_price" :disabled="vista.mode !== 'edit'" />

        <JdCheckBox label="Mostrar en ecommerce" v-model="vista.data.is_ecommerce" :disabled="vista.mode !== 'edit'" />

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

            <JdCheckBox label="Destacado" v-model="vista.data.is_destacado" :disabled="vista.mode !== 'edit'" />

            <JdTable
                :columns="columns_ingredientes"
                :datos="vista.data.ingredientes || []"
                :showResumen="false"
                style="grid-column: 1/3"
                class="mrg-top1"
            />

            <JdTable
                :columns="columns_beneficios"
                :datos="vista.data.beneficios || []"
                :showResumen="false"
                style="grid-column: 1/3"
                class="mrg-top1"
            />
        </template>
    </div>
</template>

<script>
import { JdInput, JdTextArea, JdCheckBox, JdTable } from '@jhuler/components'

import { useVistas } from '@/pinia/vistas'

export default {
    components: {
        JdInput,
        JdTextArea,
        JdCheckBox,
        JdTable,
    },
    computed: {
        vistas: () => useVistas(),
    },
    data: () => ({
        vista: {},
        columns_ingredientes: [
            {
                id: 'nombre',
                title: 'Ingredientes',
                width: '25rem',
                type: 'longtext',
                show: true,
            },
        ],
        columns_beneficios: [
            {
                id: 'nombre',
                title: 'Beneficios',
                width: '25rem',
                type: 'longtext',
                show: true,
            },
        ],
    }),
    created() {
        this.vista = this.vistas.vArticuloDetalle
    },
}
</script>

<style lang="scss" scoped>
</style>
