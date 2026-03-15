<template>
    <div class="vista vista-fill">
        <div class="head">
            <div class="head-left">
                <JdButton icon="fa-solid fa-arrow-left" @click="$router.back()" tipo="2" />
                <strong v-if="articulo">{{ articulo.nombre }}</strong>
                <strong v-else>Cargando...</strong>
            </div>
            <div class="head-right">
                <!-- Acciones adicionales si se requieren -->
            </div>
        </div>

        <div class="detalle-contenido bg-color p-8 overflow-y-auto" v-if="articulo">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Columna Izquierda: Información Principal -->
                <div class="lg:col-span-2 space-y-6">
                    <div class="card p-6 shadow-sm border border-gray-100">
                        <h3 class="text-lg font-semibold mb-4 border-b pb-2">Información General</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <div class="detail-item">
                                <span class="text-gray-500 block text-sm">Nombre del Artículo</span>
                                <span class="font-medium text-lg">{{ articulo.nombre }}</span>
                            </div>
                            <div class="detail-item">
                                <span class="text-gray-500 block text-sm">Código de Barra / EAN</span>
                                <span class="font-mono bg-gray-50 px-2 py-1 rounded">{{ articulo.codigo_barra || 'Sin código' }}</span>
                            </div>
                            <div class="detail-item">
                                <span class="text-gray-500 block text-sm">Unidad de Medida</span>
                                <span>{{ articulo.unidad }}</span>
                            </div>
                            <div class="detail-item">
                                <span class="text-gray-500 block text-sm">ID Sistema</span>
                                <span class="text-gray-400">#{{ articulo.id }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="card p-6 shadow-sm border border-gray-100">
                        <h3 class="text-lg font-semibold mb-4 border-b pb-2">Clasificación</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <div class="detail-item">
                                <span class="text-gray-500 block text-sm">Línea</span>
                                <span>{{ articulo.linea1?.nombre || 'No asignada' }}</span>
                            </div>
                            <div class="detail-item">
                                <span class="text-gray-500 block text-sm">Categoría</span>
                                <span>{{ articulo.categoria1?.nombre || 'No asignada' }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Columna Derecha: Estados y Stock -->
                <div class="space-y-6">
                    <div class="card p-6 shadow-sm border border-gray-100 bg-blue-50/30">
                        <h3 class="text-lg font-semibold mb-4 border-b pb-2 border-blue-100">Inventario</h3>
                        <div class="text-center py-4">
                            <span class="text-gray-500 block text-sm mb-1">Stock Actual</span>
                            <span class="text-4xl font-bold text-blue-600">{{ articulo.stock }}</span>
                            <span class="block text-gray-400 text-sm mt-1">{{ articulo.unidad }}</span>
                        </div>
                    </div>

                    <div class="card p-6 shadow-sm border border-gray-100">
                        <h3 class="text-lg font-semibold mb-4 border-b pb-2">Atributos</h3>
                        <div class="space-y-3">
                            <div class="flex justify-between items-center">
                                <span class="text-gray-500">Estado:</span>
                                <span :class="articulo.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'" class="px-3 py-1 rounded-full text-xs font-bold uppercase">
                                    {{ articulo.activo ? 'Activo' : 'Inactivo' }}
                                </span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-gray-500">Se Compra:</span>
                                <span>{{ articulo.purchase_ok ? 'Sí' : 'No' }}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-gray-500">Se Vende:</span>
                                <span>{{ articulo.sale_ok ? 'Sí' : 'No' }}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-gray-500">Precio Ref:</span>
                                <span class="font-semibold text-lg">{{ articulo.precio }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { JdButton } from '@jhuler/components'
import { get, urls } from '@/utils/crud'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'

export default {
    components: {
        JdButton,
    },
    data: () => ({
        articulo: null,
    }),
    computed: {
        auth: () => useAuth(),
        vistas: () => useVistas(),
    },
    async created() {
        this.vistas.initVista('vArticuloDetalle', { articulo: null })
        await this.loadArticulo()
    },
    methods: {
        async loadArticulo() {
            this.auth.setLoading(true, 'Cargando artículo...')
            const qry = {
                incl: ['categoria1', 'linea1'],
            }
            const res = await get(
                `${urls.articulos}/uno/${this.$route.params.id}?qry=${JSON.stringify(qry)}`,
            )
            this.auth.setLoading(false)
            if (res.code === 0) {
                this.articulo = res.data
                this.vistas['vArticuloDetalle'].articulo = res.data
                document.title = `${this.articulo.nombre} - Eko Business`
            }
        },
    },
}
</script>

<style lang="scss" scoped>
.vista {
    background-color: var(--bg-color2);
}

.head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background-color: var(--bg-color);
    border-bottom: 1px solid var(--border-color);

    .head-left {
        display: flex;
        align-items: center;
        gap: 1.5rem;

        strong {
            font-size: 1.5rem;
            color: var(--text-color);
        }
    }
}

.detalle-contenido {
    flex: 1;
}

.card {
    background-color: var(--bg-color);
    border-radius: 0.75rem;
}

.detail-item {
    display: flex;
    flex-direction: column;
}
</style>
