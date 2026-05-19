<template>
    <div ref="elementoPdf" class="document-container" :class="{ 'is-editing': editable }">
        <div class="pages-wrapper">
            <!-- Render the Root Structure -->
            <template v-if="estructura.structure?.type === 'document'">
                <div
                    class="page-sheet"
                    @click="onPageSheetClick"
                    :class="[
                        estructura.config?.orientation || 'portrait',
                        estructura.config?.paperSize || 'A4',
                    ]"
                    :style="{
                        paddingTop: estructura.config?.paddingTop,
                        paddingRight: estructura.config?.paddingRight,
                        paddingBottom: estructura.config?.paddingBottom,
                        paddingLeft: estructura.config?.paddingLeft,
                        backgroundColor: estructura.config?.backgroundColor,
                        display: 'flex',
                        flexDirection: 'column',
                    }"
                >
                    <RenderBlock
                        v-for="child in estructura.structure.children"
                        :key="child.id"
                        :block="child"
                        :editable="editable"
                        :selectedId="selectedId"
                        :hoveredId="hoveredId"
                        :mode="mode"
                        :values="values"
                        :listas="listas"
                        @select="(id, element) => $emit('select', { id, element })"
                        @hover="(id) => $emit('hover', id)"
                        @elegir-obj="(obj, fieldId) => $emit('elegir-obj', obj, fieldId)"
                    />
                </div>
            </template>

            <div v-else class="empty-state">
                <i class="fa-solid fa-ghost"></i>
                <p>Diseño no inicializado</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import RenderBlock from './RenderBlock.vue'
import { useAuth } from '@/pinia/auth'
import { ELEMENT_TYPES } from '@/views/calidad/formato_structures/constants'

const props = defineProps({
    estructura: { type: Object, required: true },
    values: { type: Object, default: () => ({}) },
    listas: { type: Object, default: () => ({}) },
    mode: { type: Number, default: 3 },
    editable: { type: Boolean, default: false },
    selectedId: { type: String, default: null },
    hoveredId: { type: String, default: null },
})

const emit = defineEmits(['elegir-obj', 'select', 'hover'])

const auth = useAuth()
const elementoPdf = ref(null)

const onPageSheetClick = () => {
    if (!props.editable) return
    emit('select', { id: null, element: null })
}

// Provide context to all nested blocks
provide('formContext', {
    fields: props.estructura.fields || [],
    mode: props.mode,
    auth,
    config: props.estructura.config || {},
    globals: props.estructura.config?.globals || {},
})

provide('ELEMENT_TYPES', ELEMENT_TYPES)

defineExpose({
    elementoPdf,
})
</script>

<style lang="scss" scoped>
.document-container {
    flex: 1;
    overflow: auto;
    background-color: var(--bg-color2);
}

.pages-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    padding: 2rem;
    min-height: 100%;
    width: 100%;
    min-width: min-content;
}

.page-sheet {
    /* Force Light Mode Variables */
    --bg-color: #ffffff;
    --bg-color-hover: whitesmoke;
    --bg-color-selected: #cef8f8;
    --bg-color2: #f2f2f2;
    --text-color: black;
    --text-color2: rgba(60, 60, 60, 0.66);
    --border: solid 1px #dfdfdf;
    --shadow-color: #d1d0d0;

    background-color: white !important;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    position: relative;
    color: #000;
    box-sizing: border-box;
    flex-shrink: 0; /* Prevent pages from squashing */

    /* PAPER SIZES */
    &.A4 {
        &.portrait {
            width: 210mm;
            // min-height: 297mm;
        }
        &.landscape {
            width: 297mm;
            // min-height: 210mm;
        }
    }
    &.LETTER {
        &.portrait {
            width: 215.9mm;
            // min-height: 279.4mm;
        }
        &.landscape {
            width: 279.4mm;
            // min-height: 215.9mm;
        }
    }
    &.LEGAL {
        &.portrait {
            width: 215.9mm;
            // min-height: 355.6mm;
        }
        &.landscape {
            width: 355.6mm;
            // min-height: 215.9mm;
        }
    }

    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 2rem;

    * {
        color: var(--text-color2);
    }

    i {
        font-size: 1.5rem;
    }
}
</style>
