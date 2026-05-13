<template>
    <div
        v-if="block.visible !== false"
        :id="block.id"
        class="render-block"
        :class="[
            block.type,
            ...(block.classList || []),
            { 'is-selected': selectedId === block.id, 'selectable': editable, 'is-hovered': hoveredId === block.id }
        ]"
        :style="block.style"
        @click.stop="onSelect"
        @mouseenter.stop="$emit('hover', block.id)"
        @mouseleave.stop="$emit('hover', null)"
    >
        <!-- 1. CONTAINER TYPES (Recursion) -->
        <template v-if="block.type === 'page' || block.type === 'group'">
            <RenderBlock
                v-for="child in block.children"
                :key="child.id"
                :block="child"
                :selectedId="selectedId"
                :hoveredId="hoveredId"
                :editable="editable"
                :values="values"
                :listas="listas"
                :mode="mode"
                @select="(id, el) => $emit('select', id, el)"
                @hover="(id) => $emit('hover', id)"
                @delete="(id) => $emit('delete', id)"
                @elegir-obj="(obj, fId) => $emit('elegir-obj', obj, fId)"
            />
        </template>

        <!-- 2. COMPONENT TYPES -->
        <template v-else>
            <!-- Field Input -->
            <template v-if="block.type === 'field'">
                <FieldRenderer
                    v-if="fieldConfig"
                    :field="fieldConfig"
                    v-model="values[block.props?.fieldId]"
                    :data="values"
                    :listas="listas"
                    :mode="mode"
                    @elegir-obj="(obj, fId) => $emit('elegir-obj', obj, fId)"
                />
            </template>

            <!-- HTML / TEXT -->
            <div v-else-if="block.type === 'h1'" class="h1">{{ block.props?.content }}</div>
            <div v-else-if="block.type === 'h2'" class="h2">{{ block.props?.content }}</div>
            <div v-else-if="block.type === 'h3'" class="h3">{{ block.props?.content }}</div>
            <div v-else-if="block.type === 'p'" class="p">{{ block.props?.content }}</div>
            <div v-else-if="block.type === 'text'" class="text">{{ block.props?.content }}</div>
            <div v-else-if="block.type === 'small'" class="small">{{ block.props?.content }}</div>

            <!-- IMAGE -->
            <img
                v-else-if="block.type === 'image'"
                :src="block.props?.src"
                :alt="block.props?.alt"
                class="image-block"
            />
        </template>
    </div>
</template>

<script setup>
import { computed, inject } from 'vue'
import FieldRenderer from './FieldRenderer.vue'

const props = defineProps({
    block: { type: Object, required: true },
    editable: { type: Boolean, default: false },
    selectedId: { type: String, default: null },
    hoveredId: { type: String, default: null },
    mode: { type: Number, default: 3 },
    values: { type: Object, default: () => ({}) },
    listas: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['select', 'hover', 'elegir-obj', 'delete'])
const formContext = inject('formContext')

const fieldConfig = computed(() => {
    if (props.block.type !== 'field') return null
    return formContext.fields.find(f => f.id === props.block.props?.fieldId) || props.block.props?.fieldConfig
})

const onSelect = () => {
    if (!props.editable) return
    emit('select', props.block.id, props.block)
}
</script>

<style lang="scss" scoped>
.render-block {
    position: relative;
    box-sizing: border-box;
    transition: all 0.2s;
    outline: 1px solid transparent;
    min-width: 0;
    
    &.selectable:hover {
        outline: 1px dashed #409eff;
        background-color: rgba(64, 158, 255, 0.05);
        cursor: pointer;
    }
}

.render-block.is-hovered {
    outline-color: var(--primary-color);
    background-color: rgba(36, 146, 194, 0.05);
}

.render-block.is-selected {
    outline: 2px solid var(--primary-color);
    outline-offset: -2px;
    background-color: rgba(36, 146, 194, 0.1);
    z-index: 10;
}

.render-block-item {
    width: 100%;
    cursor: pointer;
    outline: 1px solid transparent;
    transition: all 0.2s;
}

.render-block-item.is-hovered {
    outline: 1px dashed var(--primary-color) !important;
}

.render-block-item.is-selected {
    outline: 2px solid var(--primary-color) !important;
}

.image-block {
    max-width: 100%;
    height: auto;
}

.field-error {
    font-size: 0.8rem;
    color: #f56c6c;
    background: #fef0f0;
    padding: 4px;
    border: 1px solid #fbc4c4;
}

.section { margin: 0; padding: 0; }
.h1 { font-size: 2rem; font-weight: bold; margin: 0; }
.h2 { font-size: 1.5rem; font-weight: bold; margin: 0; }
.h3 { font-size: 1.25rem; font-weight: bold; margin: 0; }
.p { margin: 0; line-height: 1.4; }
.small { font-size: 0.8rem; color: #606266; }
</style>
