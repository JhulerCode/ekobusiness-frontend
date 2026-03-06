<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Detalle de Artículo</strong>
            <div class="buttons">
                <JdButton text="Volver" icon="fa-solid fa-arrow-left" @click="$router.back()" />
            </div>
        </div>

        <div class="detalle-contenido" v-if="articulo">
            <h2>{{ articulo.nombre }}</h2>
            <p>ID: {{ $route.params.id }}</p>
            <!-- Aquí irían más datos del artículo -->
            <div class="card mrg-top2">
                <p>Esta es una vista de detalle unificada que no aparece en el menú lateral.</p>
                <p>
                    Ruta actual: <code>{{ $route.path }}</code>
                </p>
            </div>
        </div>
    </div>
</template>

<script>
import { JdButton } from '@jhuler/components'

export default {
    components: {
        JdButton,
    },
    data: () => ({
        articulo: {
            nombre: 'Artículo de Ejemplo',
        },
    }),
}
</script>

<style lang="scss" scoped>
.detalle-contenido {
    padding: 1rem;
}
</style>
