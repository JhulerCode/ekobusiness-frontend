<template>
    <div class="vista">
        <header class="header">
            <div class="header-left" style="flex-wrap: nowrap">
                <strong style="white-space: nowrap">{{ vista.title }}</strong>

                <JdButtonsOverflow
                    v-if="vista.headerActions"
                    :actions="vista.headerActions"
                    @actionSelected="vista.runMethod"
                />

                <slot name="header-left"></slot>
            </div>

            <!-- Acciones Masivas o Buscador -->
            <div class="header-center">
                <JdBulkActions
                    v-if="selectedCount > 0 && vista.tableBulkActions"
                    :view="vista"
                    dataKey="tableData"
                    :bulkActions="vista.tableBulkActions"
                    @bulkActionSelected="vista.runMethod"
                />

                <JdBuscador
                    v-else
                    :tableName="vista.name"
                    :columns="vista.tableColumns"
                    @reload="vista.loadTableData"
                    @open-filters="vista.openConfigFiltros"
                />

                <slot name="header-center"></slot>
            </div>

            <!-- Paginación y Configuración -->
            <div class="header-right">
                <JdPaginacion :view="vista" @reload="vista.loadTableData" />

                <JdButton
                    v-if="showConfigCols"
                    icon="fa-solid fa-sliders"
                    tipo="2"
                    title="Columnas"
                    @click="vista.openConfigCols"
                />

                <slot name="header-right"></slot>
            </div>
        </header>

        <main class="content">
            <slot></slot>
        </main>
    </div>

    <!-- Modales vista -->
    <mConfigCols v-if="modals.show.mConfigCols" />
    <mConfigFiltros v-if="modals.show.mConfigFiltros" />
    <mEditar v-if="modals.show.mEditar" @updated="vista.updatedBulk" />
</template>

<script setup>
import { computed } from 'vue'
import { JdButton } from '@jhuler/components'

// Componentes base
import JdButtonsOverflow from './JdButtonsOverflow.vue'
import JdBuscador from './JdBuscador.vue'
import JdBulkActions from './JdBulkActions.vue'
import JdPaginacion from './JdPaginacion.vue'
import mConfigCols from '@/components/VistaLayout/mConfigCols.vue'
import mConfigFiltros from '@/components/VistaLayout/mConfigFiltros.vue'
import mEditar from '@/components/VistaLayout/mEditar.vue'

// Pinia y Utils
import { useModals } from '@/pinia/modals'

const modals = useModals()

const props = defineProps({
    vista: { type: Object, required: true },
    title: { type: String, default: '' },
    showConfigCols: { type: Boolean, default: true },
})

const selectedCount = computed(() => {
    return (props.vista.tableData || []).filter((a) => a.selected).length
})
</script>

<style lang="scss" scoped>
.vista {
    background-color: var(--bg-color);
    padding: 1.5rem 2rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    > .header {
        display: grid;
        grid-template-columns: 1fr 1.25fr 1fr;
        gap: 1rem 2rem;
        margin-bottom: 1rem;

        .header-left {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            flex-wrap: wrap;
            min-width: 0;

            strong {
                font-size: 1.4rem;
            }
        }

        .header-center {
            display: flex;
            justify-content: center;
            gap: 0.5rem;
            flex-wrap: wrap;
            min-width: 0;
        }

        .header-right {
            display: flex;
            align-items: center;
            justify-content: end;
            gap: 0.25rem;
            flex-wrap: wrap;
            min-width: 0;
        }

        @media (max-width: 1024px) {
            grid-template-columns: 1fr 1fr;

            .header-center {
                grid-column: 1 / -1;
                grid-row: 2;
            }
        }

        @media (max-width: 768px) {
            grid-template-columns: 1fr;

            .header-center {
                grid-column: 1 / -1;
                grid-row: 3;
                justify-content: flex-start;
            }

            .header-right {
                grid-row: 2;
                justify-content: start;
            }
        }
    }
}

.content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}
</style>
