<template>
    <div
        v-if="block.visible !== false"
        :id="block.id"
        class="render-block"
        :class="[
            block.type,
            ...(block.classList || []),
            {
                'is-selected': selectedId === block.id,
                selectable: editable,
                'is-hovered': hoveredId === block.id,
            },
        ]"
        :style="combinedStyle"
        @click.stop="onSelect"
        @mouseenter.stop="$emit('hover', block.id)"
        @mouseleave.stop="$emit('hover', null)"
    >
        <!-- 1. CONTAINER TYPES (Recursion) -->
        <template v-if="['document', 'page', 'group', 'grid'].includes(block.type)">
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
            <!-- Manual Inputs (Texto, Numero, Fecha, etc) -->
            <template v-if="block.type.startsWith('input_')">
                <FieldRenderer
                    :field="{
                        label: block.props?.label,
                        component: blockConfig.renderComponent,
                        inputType: blockConfig.inputType,
                        id: block.props?.fieldId,
                        relatedPath: block.props?.relatedPath,
                        optionsKey: block.props?.optionsKey,
                        searchUrl: block.props?.searchUrl,
                        searchField: block.props?.searchField,
                        mostrar: block.props?.mostrar,
                        searchFltr: block.props?.searchFltr,
                        searchCols: block.props?.searchCols,
                        searchOrdr: block.props?.searchOrdr,
                        searchLimt: block.props?.searchLimt,
                    }"
                    v-model="values[block.props?.fieldId]"
                    :data="values"
                    :listas="listas"
                    :mode="mode"
                    :label-style="labelStyle"
                    :value-style="valueStyle"
                    @elegir-obj="(obj, fId) => $emit('elegir-obj', obj, fId)"
                    :style="typographyStyle"
                />
            </template>

            <!-- HTML / TEXT -->
            <div v-else-if="block.type === 'h1'" :style="typographyStyle">
                {{ block.props?.content }}
            </div>
            <div v-else-if="block.type === 'h2'" :style="typographyStyle">
                {{ block.props?.content }}
            </div>
            <div v-else-if="block.type === 'h3'" :style="typographyStyle">
                {{ block.props?.content }}
            </div>
            <div v-else-if="block.type === 'p'" :style="typographyStyle">
                {{ block.props?.content }}
            </div>
            <div v-else-if="block.type === 'small'" :style="typographyStyle">
                {{ block.props?.content }}
            </div>

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
import { ELEMENT_TYPES } from '@/views/calidad/formato_structures/constants'
const props = defineProps({
    block: { type: Object, required: true },
    editable: { type: Boolean, default: false },
    selectedId: { type: String, default: null },
    hoveredId: { type: String, default: null },
    mode: { type: Number, default: 3 },
    values: { type: Object, default: () => ({}) },
    listas: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['select', 'hover', 'elegir-obj', 'delete'])

const blockConfig = computed(() => {
    return ELEMENT_TYPES.find((e) => e.type === props.block.type) || {}
})

const formContext = inject('formContext')

const labelStyle = computed(() => {
    const style = {}
    const globalStyle = formContext.config?.globals?.inputLabel?.styles || {}
    const blockStyle = props.block.styleLabel || {}

    const keys = ['fontSize', 'fontWeight', 'color', 'textAlign', 'fontFamily']
    keys.forEach((k) => {
        style[k] = blockStyle[k] || globalStyle[k]
    })
    return style
})

const valueStyle = computed(() => {
    const style = {}
    const globalStyle = formContext.config?.globals?.inputValue?.styles || {}
    const blockStyle = props.block.styleValue || {}

    const keys = ['fontSize', 'fontWeight', 'color', 'textAlign', 'fontFamily']
    keys.forEach((k) => {
        style[k] = blockStyle[k] || globalStyle[k]
    })
    return style
})

const onSelect = () => {
    if (!props.editable) return
    emit('select', props.block.id, props.block)
}

const typographyStyle = computed(() => {
    const style = {}
    const globalForType = formContext.globals?.[props.block.type]?.styles || {}
    const keys = [
        'fontSize',
        'fontWeight',
        'color',
        'textAlign',
        'fontFamily',
        'lineHeight',
        'fontStyle',
        'textDecoration',
        'textTransform',
    ]
    keys.forEach((k) => {
        // Preference: 1. block.style, 2. globalForType
        if (props.block.style?.[k]) {
            style[k] = props.block.style[k]
        } else if (globalForType[k]) {
            style[k] = globalForType[k]
        }
    })
    return style
})

const combinedStyle = computed(() => {
    let s = { ...props.block.style }
    if (props.block.type === 'page') {
        // Enforce layout for pages
        s.display = 'flex'
        s.flexDirection = 'column'
    }
    return s
})
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

.section {
    margin: 0;
    padding: 0;
}
</style>
