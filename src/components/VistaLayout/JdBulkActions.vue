<template>
    <div class="jd-bulk-actions" ref="containerRef" v-if="count > 0">
        <div class="info-badge">
            <span> {{ count }} {{ messageText }} </span>

            <div class="clear-selection" @click.stop="clearSelection" title="Deseleccionar todos">
                <i class="fa-solid fa-xmark"></i>
            </div>
        </div>

        <div class="actions-trigger" :class="{ active: showMenu }">
            <JdButton
                icon="fa-solid fa-ellipsis-vertical"
                text="Acciones"
                tipo="2"
                @click.stop="toggleMenu"
            />

            <transition name="menu-fade">
                <div v-show="showMenu" class="actions-menu">
                    <div class="menu-header">Acciones masivas</div>
                    <ul>
                        <template v-for="(action, index) in filteredActions" :key="index">
                            <li @click.stop="handleAction(action.action)">
                                <i :class="action.icon"></i>
                                <span>{{ action.text }}</span>
                            </li>
                        </template>
                    </ul>
                </div>
            </transition>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuth } from '@/pinia/auth'

const props = defineProps({
    view: { type: Object, default: () => ({}) },
    dataKey: { type: String },
    bulkActions: { type: Array, default: () => [] },
})

const emit = defineEmits(['bulkActionSelected'])

const auth = useAuth()
const showMenu = ref(false)
const containerRef = ref(null)

const selectedItems = computed(() => {
    return (props.view[props.dataKey] || []).filter((a) => a.selected)
})

const count = computed(() => selectedItems.value.length)

const messageText = computed(() => {
    return count.value === 1 ? 'seleccionado' : 'seleccionados'
})

const filteredActions = computed(() => {
    return props.bulkActions.filter((a) => {
        if (!a.permiso) return true
        return auth.verifyPermiso(a.permiso)
    })
})

const clearSelection = () => {
    if (props.view[props.dataKey]) {
        props.view[props.dataKey].forEach((a) => (a.selected = false))
    }
}

const toggleMenu = () => {
    showMenu.value = !showMenu.value
}

const handleAction = (actionName) => {
    emit('bulkActionSelected', actionName)
    showMenu.value = false
}

const handleClickOutside = (event) => {
    if (containerRef.value && !containerRef.value.contains(event.target)) {
        showMenu.value = false
    }
}

onMounted(() => {
    document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<style lang="scss" scoped>
.jd-bulk-actions {
    display: flex;
    align-items: center;
    gap: 0.25rem;

    .info-badge {
        background-color: var(--bg-color-selected);
        padding: 0.4rem 1rem;
        border-radius: 0.3rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .clear-selection {
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;

            &:hover {
                transform: rotate(90deg);
            }
        }
    }

    .actions-trigger {
        position: relative;

        &.active .trigger-btn {
            background: var(--primary-color) !important;
            color: white !important;
        }
    }

    .actions-menu {
        position: absolute;
        top: calc(100% + 6px);
        left: 50%;
        transform: translateX(-50%);
        background: var(--bg-color);
        border: var(--border);
        border-radius: 0.5rem;
        box-shadow: 0 4px 25px rgba(0, 0, 0, 0.12);
        z-index: 3;
        overflow: hidden;
        min-width: 14rem;

        .menu-header {
            padding: 0.8rem 1rem;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-color2);
            border-bottom: var(--border);
            background: var(--bg-color2);
        }

        ul {
            list-style: none;
            margin: 0;
            padding: 0.3rem;
        }

        li {
            padding: 0.5rem 0.8rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.8rem;
            border-radius: 0.3rem;
            transition: all 0.15s;
            font-size: 0.9rem;
            color: var(--text-color);

            i {
                font-size: 0.9rem;
                width: 1rem;
                text-align: center;
            }

            &:hover {
                background: var(--bg-color-hover);
                color: var(--primary-color);
                i {
                    color: var(--primary-color);
                }
            }
        }
    }
}

// Transitions
.menu-fade-enter-active,
.menu-fade-leave-active {
    transition: all 0.25s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.menu-fade-enter-from,
.menu-fade-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px) scale(0.95);
}

@keyframes slide-in {
    from {
        opacity: 0;
        transform: translateX(-20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}
</style>
