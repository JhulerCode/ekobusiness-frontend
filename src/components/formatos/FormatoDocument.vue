<template>
    <div ref="elementoPdf" class="pdfall" :class="{ 'is-editing': editable }">
        <!-- Render the Root Structure recursively -->
        <RenderBlock
            v-if="estructura.structure"
            :block="estructura.structure"
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
        <div v-else class="empty-state">Diseño no inicializado</div>
    </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import RenderBlock from './RenderBlock.vue'
import { useAuth } from '@/pinia/auth'

const props = defineProps({
    estructura: { type: Object, required: true },
    values: { type: Object, default: () => ({}) },
    listas: { type: Object, default: () => ({}) },
    mode: { type: Number, default: 3 },
    editable: { type: Boolean, default: false },
    selectedId: { type: String, default: null },
    hoveredId: { type: String, default: null },
})

defineEmits(['elegir-obj', 'select', 'hover'])

const auth = useAuth()
const elementoPdf = ref(null)

// Provide context to all nested blocks
provide('formContext', {
    fields: props.estructura.fields || [], // Fallback if still using global fields registry
    mode: props.mode,
    auth,
})

defineExpose({
    elementoPdf,
})
</script>

<style lang="scss" scoped>
.pdfall {
    width: 8.27in;
    box-sizing: border-box; /* Total width will be exactly 8.27in including padding */
    background-color: white !important;
    box-shadow: 0 0 1rem rgba(0, 0, 0, 0.3);
    position: relative;
    color: #333; /* Ensure text is dark on white paper */

    * {
        margin: 0;
        padding: 0;
        color: #000;
        font-size: 0.9rem;
        --primary-border: #409eff;
        --primary-light: rgba(64, 158, 255, 0.1);
    }
}

.empty-state {
    padding: 2rem;
    text-align: center;
    color: #909399;
    border: 2px dashed #dcdfe6;
}
</style>
