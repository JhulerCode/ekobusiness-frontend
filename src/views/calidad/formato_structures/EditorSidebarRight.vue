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
            <div class="sidebar-group">
                <div class="group-header" @click="$emit('toggleSection', 'doc_general')">
                    <p class="group-title">General</p>
                    <i
                        :class="[
                            'fas fa-chevron-down',
                            { collapsed: collapsedSections.doc_general },
                        ]"
                    ></i>
                </div>
                <div class="group-content" v-show="!collapsedSections.doc_general">
                    <JdSelect
                        v-model="vista.data.config.paperSize"
                        label="Tamaño"
                        :lista="paperSizes"
                        :disabled="vista.mode !== 'edit'"
                    />

                    <JdInput
                        v-model="vista.data.entity"
                        label="Entidad"
                        placeholder="Ej: traslados, socios..."
                        :disabled="vista.mode !== 'edit'"
                    />
                </div>
            </div>

            <div
                v-for="(gStyle, gType) in vista.data.config.globals"
                :key="gType"
                class="sidebar-group"
            >
                <div class="group-header" @click="$emit('toggleSection', 'global_' + gType)">
                    <p class="group-title">Estilo Global: {{ gType }}</p>
                    <i
                        :class="[
                            'fas fa-chevron-down',
                            { collapsed: collapsedSections['global_' + gType] },
                        ]"
                    ></i>
                </div>
                <div class="group-content" v-show="!collapsedSections['global_' + gType]">
                    <template v-for="tKey in typographyStyles" :key="tKey">
                        <JdSelect
                            v-if="styleFieldsDef[tKey].type === 'select'"
                            v-model="vista.data.config.globals[gType].styles[tKey]"
                            :label="styleFieldsDef[tKey].label"
                            :lista="styleFieldsDef[tKey].list"
                            :disabled="vista.mode !== 'edit'"
                        />
                        <JdInput
                            v-else
                            v-model="vista.data.config.globals[gType].styles[tKey]"
                            :label="styleFieldsDef[tKey].label"
                            :disabled="vista.mode !== 'edit'"
                        />
                    </template>
                </div>
            </div>
        </div>

        <div class="editor-section" v-if="activeTab === 'componente'">
            <template v-if="selectedId && selectedElement">
                <div class="sidebar-group">
                    <div class="group-header" @click="$emit('toggleSection', 'comp_general')">
                        <p class="group-title">General</p>
                        <i
                            :class="[
                                'fas fa-chevron-down',
                                { collapsed: collapsedSections.comp_general },
                            ]"
                        ></i>
                    </div>
                    <div class="group-content" v-show="!collapsedSections.comp_general">
                        <div v-if="config" class="element-info">
                            <i :class="config.icon"></i>
                            <strong>{{ config.label }}</strong>
                        </div>

                        <JdInput
                            label="Nombre"
                            v-model="selectedElement.name"
                            :placeholder="selectedElement.id"
                            :disabled="vista.mode !== 'edit'"
                        />
                    </div>
                </div>

                <!-- DYNAMIC PROPS SECTION -->
                <div v-if="config?.propsFields?.length" class="sidebar-group">
                    <div class="group-header" @click="$emit('toggleSection', 'props')">
                        <p class="group-title">Propiedades</p>
                        <i
                            :class="['fas fa-chevron-down', { collapsed: collapsedSections.props }]"
                        ></i>
                    </div>
                    <div class="group-content" v-show="!collapsedSections.props">
                        <template v-for="field in config.propsFields" :key="field.key">
                            <JdSelect
                                v-if="field.type === 'select'"
                                v-model="selectedElement.props[field.key]"
                                :label="field.label"
                                :lista="field.list === 'fieldList' ? fieldList : field.list"
                                :disabled="vista.mode !== 'edit'"
                            />
                            <JdInput
                                v-else
                                v-model="selectedElement.props[field.key]"
                                :label="field.label"
                                :textarea="field.textarea"
                                :placeholder="field.placeholder"
                                :disabled="vista.mode !== 'edit'"
                            />
                        </template>
                    </div>
                </div>

                <!-- DYNAMIC STYLE SECTIONS -->
                <template v-for="(fields, sectionKey) in groupedStyles" :key="sectionKey">
                    <div class="sidebar-group">
                        <div class="group-header" @click="$emit('toggleSection', sectionKey)">
                            <p class="group-title">{{ styleSectionsLabels[sectionKey] }}</p>
                            <i
                                :class="[
                                    'fas fa-chevron-down',
                                    { collapsed: collapsedSections[sectionKey] },
                                ]"
                            ></i>
                        </div>
                        <div
                            class="group-content style-grid"
                            v-show="!collapsedSections[sectionKey]"
                        >
                            <template v-for="fieldKey in fields" :key="fieldKey">
                                <div :class="{ 'full-width': !styleFieldsDef[fieldKey].grid }">
                                    <JdSelect
                                        v-if="styleFieldsDef[fieldKey].type === 'select'"
                                        v-model="selectedElement.style[fieldKey]"
                                        :label="styleFieldsDef[fieldKey].label"
                                        :lista="styleFieldsDef[fieldKey].list"
                                        :disabled="vista.mode !== 'edit'"
                                    />
                                    <JdInput
                                        v-else
                                        v-model="selectedElement.style[fieldKey]"
                                        :label="styleFieldsDef[fieldKey].label"
                                        :disabled="vista.mode !== 'edit'"
                                    />
                                </div>
                            </template>
                        </div>
                    </div>
                </template>

                <!-- STYLE LABEL SECTION -->
                <div v-if="config?.styleLabelFields?.length" class="sidebar-group">
                    <div class="group-header" @click="$emit('toggleSection', 'inputLabel')">
                        <p class="group-title">Estilo Etiqueta</p>
                        <i
                            :class="[
                                'fas fa-chevron-down',
                                { collapsed: collapsedSections.inputLabel },
                            ]"
                        ></i>
                    </div>
                    <div class="group-content" v-show="!collapsedSections.inputLabel">
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
                                :disabled="vista.mode !== 'edit'"
                            />
                            <JdInput
                                v-else
                                v-model="
                                    (selectedElement.styleLabel = selectedElement.styleLabel || {})[
                                        key
                                    ]
                                "
                                :label="styleFieldsDef[key].label"
                                :disabled="vista.mode !== 'edit'"
                            />
                        </template>
                    </div>
                </div>

                <!-- STYLE VALUE SECTION -->
                <div v-if="config?.styleValueFields?.length" class="sidebar-group">
                    <div class="group-header" @click="$emit('toggleSection', 'inputValue')">
                        <p class="group-title">Estilo Valor</p>
                        <i
                            :class="[
                                'fas fa-chevron-down',
                                { collapsed: collapsedSections.inputValue },
                            ]"
                        ></i>
                    </div>
                    <div class="group-content" v-show="!collapsedSections.inputValue">
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
                                :disabled="vista.mode !== 'edit'"
                            />
                            <JdInput
                                v-else
                                v-model="
                                    (selectedElement.styleValue = selectedElement.styleValue || {})[
                                        key
                                    ]
                                "
                                :label="styleFieldsDef[key].label"
                                :disabled="vista.mode !== 'edit'"
                            />
                        </template>
                    </div>
                </div>

                <!-- OTHER SECTIONS -->
                <div v-if="hasConfig('settings')" class="sidebar-group">
                    <div class="group-header" @click="$emit('toggleSection', 'settings')">
                        <p class="group-title">Configuraciones</p>
                        <i
                            :class="[
                                'fas fa-chevron-down',
                                { collapsed: collapsedSections.settings },
                            ]"
                        ></i>
                    </div>
                    <div class="group-content" v-show="!collapsedSections.settings">
                        <small>No hay configuraciones extras.</small>
                    </div>
                </div>

                <div v-if="hasConfig('visibility')" class="sidebar-group">
                    <div class="group-header" @click="$emit('toggleSection', 'visibility')">
                        <p class="group-title">Visibilidad</p>
                        <i
                            :class="[
                                'fas fa-chevron-down',
                                { collapsed: collapsedSections.visibility },
                            ]"
                        ></i>
                    </div>
                    <div class="group-content" v-show="!collapsedSections.visibility">
                        <JdInput
                            v-model="selectedElement.visibility.condition"
                            label="Condición (JS)"
                            :disabled="vista.mode !== 'edit'"
                        />
                    </div>
                </div>
            </template>

            <div v-else class="empty-state">
                <i class="fas fa-mouse-pointer"></i>
                <span>Selecciona un elemento para editarlo.</span>
            </div>
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
            padding: 0.75rem 0.5rem;
            border: none;
            background: transparent;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 0.85rem;
            color: var(--text-color2);
            border-bottom: 2px solid transparent;

            &:hover {
                color: var(--primary-color) !important;
            }

            &.active {
                color: var(--text-color);
                border-bottom-color: var(--primary-color);
            }
        }
    }

    .editor-section {
        flex: 1;
        overflow-y: auto;
        padding: 1rem 0.5rem 0.5rem;
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }
}

.sidebar-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    .group-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        user-select: none;
        padding-bottom: 0.5rem;

        &:hover {
            .group-title {
                color: var(--primary-color);
            }
            i {
                color: var(--primary-color);
            }
        }

        .group-title {
            font-size: 0.7rem;
            color: var(--text-color2);
            letter-spacing: 0.05rem;
            text-transform: uppercase;
        }

        i {
            font-size: 0.75rem;
            color: var(--text-color2);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

            &.collapsed {
                transform: rotate(-90deg);
            }
        }
    }

    .group-content {
        display: grid;
        gap: 0.85rem;

        &.style-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.85rem 0.75rem;

            .full-width {
                grid-column: span 2;
            }
        }
    }
}

.element-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    i {
        font-size: 1.1rem;
        color: var(--primary-color);
    }

    strong {
        font-size: 0.85rem;
        color: var(--text-color);
        letter-spacing: 0.02rem;
        text-transform: uppercase;
    }
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--text-color2);
    gap: 1rem;
    opacity: 0.6;
    padding: 2rem;
    text-align: center;

    i {
        font-size: 2.5rem;
    }
    span {
        font-size: 0.9rem;
    }
}
</style>
