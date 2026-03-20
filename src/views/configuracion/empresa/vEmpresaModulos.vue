<template>
    <div class="seccion-modulos">
        <p class="instrucciones">
            Seleccione los módulos que estarán disponibles para esta empresa. Esta configuración
            controlará la visibilidad del menú lateral para todos sus usuarios.
        </p>

        <div class="grid-modulos">
            <div
                v-for="modulo in modulosDisponibles"
                :key="modulo.id"
                class="card-modulo"
                :class="{
                    'card-activo': isActivo(modulo.id),
                    'card-disabled': vista.mode === 'view',
                }"
                @click="toggleModulo(modulo.id)"
            >
                <div class="card-icon">
                    <i :class="modulo.icon"></i>
                </div>
                <div class="card-info">
                    <span class="card-label">{{ modulo.label }}</span>
                </div>
                <div class="card-check">
                    <JdCheckBox
                        :modelValue="isActivo(modulo.id)"
                        @update:modelValue="toggleModulo(modulo.id)"
                        :disabled="vista.mode === 'view'"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { useVistas } from '@/pinia/vistas'
import menuConfig from '@/config/menu.js'
import JdCheckBox from '@/components/inputs/JdCheckBox.vue'

export default {
    name: 'vEmpresaModulos',
    components: {
        JdCheckBox,
    },
    computed: {
        vistas: () => useVistas(),
        vista() {
            return this.vistas.vEmpresa
        },
        modulosDisponibles() {
            // Solo mostramos los módulos de nivel superior que tienen un ID (configurables)
            return menuConfig.filter((m) => m.id)
        },
    },
    created() {
        if (!this.vista.data.modulos) {
            this.vista.data.modulos = []
        }
    },
    methods: {
        isActivo(id) {
            return (this.vista.data.modulos || []).includes(id)
        },
        toggleModulo(id) {
            if (this.vista.mode === 'view') return

            if (!this.vista.data.modulos) this.vista.data.modulos = []

            const index = this.vista.data.modulos.indexOf(id)
            if (index === -1) {
                this.vista.data.modulos.push(id)
            } else {
                this.vista.data.modulos.splice(index, 1)
            }
        },
    },
}
</script>

<style scoped>
.seccion-modulos {
    padding: 1.5rem;
}

.instrucciones {
    font-size: 0.9rem;
    color: var(--text-color2);
    margin-bottom: 2rem;
    line-height: 1.4;
}

.grid-modulos {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
    gap: 1.2rem;
}

.card-modulo {
    display: flex;
    align-items: center;
    padding: 1rem;
    /* background-color: var(--bg-color2); */
    border: var(--border);
    border-radius: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
    gap: 1rem;
    position: relative;
    overflow: hidden;
}

.card-modulo:hover:not(.card-disabled) {
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card-activo {
    border-color: var(--primary-color);
    /* background-color: var(--bg-color-selected, rgba(36, 146, 194, 0.1)); */
}

.card-disabled {
    cursor: default;
    opacity: 0.8;
}

.card-icon {
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    /* background-color: var(--bg-color); */
    /* border-radius: 0.5rem; */
    /* color: var(--primary-color); */
    /* border: var(--border); */
    font-size: 1.2rem;
}

.card-activo .card-icon {
    /* background-color: var(--primary-color); */
    /* color: white; */
    /* border-color: var(--primary-color); */
}

.card-info {
    flex: 1;
}

.card-label {
    font-weight: 600;
    font-size: 1rem;
    color: var(--text-color);
}

.card-check {
    pointer-events: none; /* El click se maneja en el card */
}
</style>
