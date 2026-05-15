<template>
    <div class="editor-side">
        <div class="side-tabs">
            <button
                :class="{ active: activeTab === 'document' }"
                @click="activeTab = 'document'"
                title="Documento"
            >
                Documento
            </button>
            <button
                :class="{ active: activeTab === 'componente' }"
                @click="activeTab = 'componente'"
                title="Componente"
            >
                Componente
            </button>
        </div>

        <div class="editor-section" v-if="activeTab === 'document'">
            <div class="editor-content">
                <JdSelect
                    v-model="vista.data.config.paperSize"
                    label="Tamaño"
                    :lista="paperSizes"
                />

                <JdInput
                    v-model="vista.data.entity"
                    label="Entidad"
                    placeholder="Ej: traslados, socios..."
                    :disabled="vista.mode !== 'edit'"
                />

                <div v-for="(gStyle, gType) in vista.data.config.globals" :key="gType">
                    <div
                        class="editor-header clickable"
                        @click="$emit('toggleSection', 'global_' + gType)"
                    >
                        <strong>Estilo Global: {{ gType.toUpperCase() }}</strong>
                        <i
                            :class="[
                                'fas fa-sm',
                                collapsedSections['global_' + gType]
                                    ? 'fa-chevron-right'
                                    : 'fa-chevron-down',
                            ]"
                        ></i>
                    </div>
                    <div v-show="!collapsedSections['global_' + gType]">
                        <template v-for="tKey in typographyStyles" :key="tKey">
                            <JdSelect
                                v-if="styleFieldsDef[tKey].type === 'select'"
                                v-model="vista.data.config.globals[gType][tKey]"
                                :label="styleFieldsDef[tKey].label"
                                :lista="styleFieldsDef[tKey].list"
                            />
                            <JdInput
                                v-else
                                v-model="vista.data.config.globals[gType][tKey]"
                                :label="styleFieldsDef[tKey].label"
                            />
                        </template>
                    </div>
                </div>
            </div>
        </div>

        <div class="editor-section" v-if="activeTab === 'componente'">
            <div class="editor-content" v-if="selectedId && selectedElement">
                <div class="element-info">
                    <i :class="config.icon"></i>
                    <strong>{{ config.label }}</strong>
                </div>
                <JdInput
                    label="Nombre"
                    v-model="selectedElement.name"
                    :placeholder="selectedElement.id"
                />

                <!-- DYNAMIC PROPS SECTION -->
                <div v-if="config?.propsFields?.length">
                    <div class="editor-header clickable" @click="$emit('toggleSection', 'props')">
                        <strong>Propiedades</strong>
                        <i
                            :class="[
                                'fas fa-sm',
                                collapsedSections.props ? 'fa-chevron-right' : 'fa-chevron-down',
                            ]"
                        ></i>
                    </div>
                    <div v-show="!collapsedSections.props">
                        <template v-for="field in config.propsFields" :key="field.key">
                            <JdSelect
                                v-if="field.type === 'select'"
                                v-model="selectedElement.props[field.key]"
                                :label="field.label"
                                :lista="field.list === 'fieldList' ? fieldList : field.list"
                            />
                            <JdInput
                                v-else
                                v-model="selectedElement.props[field.key]"
                                :label="field.label"
                                :textarea="field.textarea"
                                :placeholder="field.placeholder"
                            />
                        </template>
                    </div>
                </div>

                <!-- STYLE LABEL SECTION -->
                <div v-if="config?.styleLabelFields?.length">
                    <div
                        class="editor-header clickable"
                        @click="$emit('toggleSection', 'inputLabel')"
                    >
                        <strong>Estilo Etiqueta</strong>
                        <i
                            :class="[
                                'fas fa-sm',
                                collapsedSections.inputLabel
                                    ? 'fa-chevron-right'
                                    : 'fa-chevron-down',
                            ]"
                        ></i>
                    </div>
                    <div v-show="!collapsedSections.inputLabel">
                        <template v-for="key in config.styleLabelFields" :key="key">
                            <JdSelect
                                v-if="styleFieldsDef[key].type === 'select'"
                                v-model="
                                    (selectedElement.styleLabel = selectedElement.styleLabel || {})[
                                        key
                                    ]
                                "
                                :label="styleFieldsDef[key].label"
                                :lista="styleFieldsDef[key].list"
                            />
                            <JdInput
                                v-else
                                v-model="
                                    (selectedElement.styleLabel = selectedElement.styleLabel || {})[
                                        key
                                    ]
                                "
                                :label="styleFieldsDef[key].label"
                            />
                        </template>
                    </div>
                </div>

                <!-- STYLE VALUE SECTION -->
                <div v-if="config?.styleValueFields?.length">
                    <div
                        class="editor-header clickable"
                        @click="$emit('toggleSection', 'inputValue')"
                    >
                        <strong>Estilo Valor</strong>
                        <i
                            :class="[
                                'fas fa-sm',
                                collapsedSections.inputValue
                                    ? 'fa-chevron-right'
                                    : 'fa-chevron-down',
                            ]"
                        ></i>
                    </div>
                    <div v-show="!collapsedSections.inputValue">
                        <template v-for="key in config.styleValueFields" :key="key">
                            <JdSelect
                                v-if="styleFieldsDef[key].type === 'select'"
                                v-model="
                                    (selectedElement.styleValue = selectedElement.styleValue || {})[
                                        key
                                    ]
                                "
                                :label="styleFieldsDef[key].label"
                                :lista="styleFieldsDef[key].list"
                            />
                            <JdInput
                                v-else
                                v-model="
                                    (selectedElement.styleValue = selectedElement.styleValue || {})[
                                        key
                                    ]
                                "
                                :label="styleFieldsDef[key].label"
                            />
                        </template>
                    </div>
                </div>

                <!-- DYNAMIC STYLE SECTIONS -->
                <template v-for="(fields, sectionKey) in groupedStyles" :key="sectionKey">
                    <div>
                        <div
                            class="editor-header clickable"
                            @click="$emit('toggleSection', sectionKey)"
                        >
                            <strong>{{ styleSectionsLabels[sectionKey] }}</strong>
                            <i
                                :class="[
                                    'fas fa-sm',
                                    collapsedSections[sectionKey]
                                        ? 'fa-chevron-right'
                                        : 'fa-chevron-down',
                                ]"
                            ></i>
                        </div>
                        <div v-show="!collapsedSections[sectionKey]">
                            <div class="style-grid">
                                <template v-for="fieldKey in fields" :key="fieldKey">
                                    <div :class="{ 'full-width': !styleFieldsDef[fieldKey].grid }">
                                        <JdSelect
                                            v-if="styleFieldsDef[fieldKey].type === 'select'"
                                            v-model="selectedElement.style[fieldKey]"
                                            :label="styleFieldsDef[fieldKey].label"
                                            :lista="styleFieldsDef[fieldKey].list"
                                        />
                                        <JdInput
                                            v-else
                                            v-model="selectedElement.style[fieldKey]"
                                            :label="styleFieldsDef[fieldKey].label"
                                        />
                                    </div>
                                </template>
                            </div>
                        </div>
                    </div>
                </template>

                <!-- OTHER SECTIONS -->
                <div v-if="hasConfig('settings')">
                    <div
                        class="editor-header clickable"
                        @click="$emit('toggleSection', 'settings')"
                    >
                        <strong>Configuraciones</strong>
                        <i
                            :class="[
                                'fas fa-sm',
                                collapsedSections.settings ? 'fa-chevron-right' : 'fa-chevron-down',
                            ]"
                        ></i>
                    </div>
                    <div v-show="!collapsedSections.settings">
                        <small>No hay configuraciones extras.</small>
                    </div>
                </div>

                <div v-if="hasConfig('visibility')">
                    <div
                        class="editor-header clickable"
                        @click="$emit('toggleSection', 'visibility')"
                    >
                        <strong>Visibilidad</strong>
                        <i
                            :class="[
                                'fas fa-sm',
                                collapsedSections.visibility
                                    ? 'fa-chevron-right'
                                    : 'fa-chevron-down',
                            ]"
                        ></i>
                    </div>
                    <div v-show="!collapsedSections.visibility">
                        <JdInput
                            v-model="selectedElement.visibility.condition"
                            label="Condición (JS)"
                        />
                    </div>
                </div>
            </div>

            <small v-else>Selecciona un elemento para editarlo.</small>
        </div>
    </div>
</template>

<script>
import JdInput from '@/components/inputs/JdInput.vue'
import JdSelect from '@/components/inputs/JdSelect.vue'

export default {
    name: 'EditorSidebarRight',
    components: { JdInput, JdSelect },
    props: {
        selectedId: String,
        selectedElement: Object,
        config: Object,
        groupedStyles: Object,
        collapsedSections: Object,
        styleFieldsDef: Object,
        styleSectionsLabels: Object,
        paperSizes: Array,
        typographyStyles: Array,
        fieldList: Array,
        vista: Object,
    },
    data() {
        return {
            activeTab: 'componente',
        }
    },
    methods: {
        hasConfig(key) {
            if (!this.selectedElement) return false
            if (key === 'settings') return true
            if (key === 'visibility') return true
            return false
        },
    },
}
</script>

<style lang="scss" scoped>
.editor-side {
    flex: 0 0 20rem;
    min-width: 20rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .side-tabs {
        display: flex;
        border-bottom: var(--border);
        flex-shrink: 0;

        button {
            padding: 0.5rem 0.75rem;
            border: none;
            background: transparent;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 0.9rem;
            border-bottom: 2px solid transparent;

            &:hover {
                color: var(--primary-color);
            }

            &.active {
                border-bottom-color: var(--primary-color);
            }
        }
    }

    .editor-section {
        flex: 1;
        overflow-y: auto;
        padding: 1rem 0.5rem 0.5rem;

        .editor-header {
            padding: 0.6rem 0.75rem;
            background-color: var(--bg-color2);
            display: flex;
            justify-content: space-between;
            align-items: center;
            user-select: none;

            &.clickable {
                cursor: pointer;
                &:hover {
                    background-color: var(--bg-color-hover);
                }
            }

            i {
                color: var(--text-color2);
            }

            strong {
                font-size: 0.75rem;
                text-transform: uppercase;
                color: var(--text-color2);
            }
        }
    }

    .element-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        // padding: 0.5rem;
        // margin-bottom: 0.5rem;
        // border-radius: 0.5rem;
        // background-color: var(--bg-color-hover);

        i {
            font-size: 1.1rem;
            color: var(--primary-color);
        }

        strong {
            font-size: 0.85rem;
            color: var(--text-color);
            letter-spacing: 0.02rem;
        }
    }

    .editor-content {
        display: grid;
        gap: 0.75rem;
    }
}
</style>
