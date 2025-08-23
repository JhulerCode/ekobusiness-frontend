<template>
    <section class="main-center">
        <!-- <PestanasOpen /> -->

        <vProveedores v-if="useVistas.show.vProveedores" />
        <vArticuloCategorias v-if="useVistas.show.vArticuloCategorias" />
        <vArticulos v-if="useVistas.show.vArticulos" />
        <vPrecioListas v-if="useVistas.show.vPrecioListas" />
        <vCompraPedidos v-if="useVistas.show.vCompraPedidos" />
        <vCompras v-if="useVistas.show.vCompras" />
        <vCompraItems v-if="useVistas.show.vCompraItems" />

        <vClientes v-if="useVistas.show.vClientes" />
        <vProductoCategorias v-if="useVistas.show.vProductoCategorias" />
        <vProductosTerminados v-if="useVistas.show.vProductosTerminados" />
        <vPtsIngresos v-if="useVistas.show.vPtsIngresos" />
        <vVentaPedidos v-if="useVistas.show.vVentaPedidos" />
        <vVentas v-if="useVistas.show.vVentas" />

        <vProgramaFiltrantes v-if="useVistas.show.vProgramaFiltrantes" />
        <vProgramaGranel v-if="useVistas.show.vProgramaGranel" />
        <vProgramaLuxury v-if="useVistas.show.vProgramaLuxury" />
        <vProduccionHistorial v-if="useVistas.show.vProduccionHistorial" />
        <vProductosCuarentena v-if="useVistas.show.vProductosCuarentena" />

        <vFormatosBpm v-if="useVistas.show.vFormatosBpm" />
        <vFormatosPhs v-if="useVistas.show.vFormatosPhs" />
        <vFormatosHaccp v-if="useVistas.show.vFormatosHaccp" />
        <vRegistrosSanitarios v-if="useVistas.show.vRegistrosSanitarios" />
        <vInspecciones v-if="useVistas.show.vInspecciones" />

        <vDocumentos v-if="useVistas.show.vDocumentos" />
        <vCajaAperturas v-if="useVistas.show.vCajaAperturas" />
        <vMonedas v-if="useVistas.show.vMonedas" />
        <vMaquinas v-if="useVistas.show.vMaquinas" />
        <vEquipos v-if="useVistas.show.vEquipos" />
        <vColaboradores v-if="useVistas.show.vColaboradores" />
        <vSessions v-if="useVistas.show.vSessions" />
        <vActivityLogs v-if="useVistas.show.vActivityLogs" />
    </section>
</template>

<script>
// import PestanasOpen from './PestanasOpen.vue'

// import vHome from '@/views/u/home/vHome.vue'

// ----- LOGISTICA ENTRADA ----- //
import vProveedores from '@/views/logistica_entrada/proveedores/vProveedores.vue'
import vArticuloCategorias from '@/views/logistica_entrada/categorias/vArticuloCategorias.vue'
import vArticulos from '@/views/logistica_entrada/articulos/vArticulos.vue'
import vPrecioListas from '@/views/logistica_entrada/precios/vPrecioListas.vue'
import vCompraPedidos from '@/views/logistica_entrada/pedidos/vCompraPedidos.vue'
import vCompras from '@/views/logistica_entrada/compras/vCompras.vue'
import vCompraItems from '@/views/logistica_entrada/compra_items/vCompraItems.vue'

// ----- LOGISTICA SALIDA ----- //
import vClientes from '@/views/logistica_salida/clientes/vClientes.vue'
import vProductoCategorias from '@/views/logistica_salida/categorias/vProductoCategorias.vue'
import vProductosTerminados from '@/views/logistica_salida/articulos/vProductosTerminados.vue'
import vPtsIngresos from '@/views/logistica_salida/ingreso_pt/vPtsIngresos.vue'
import vVentaPedidos from '@/views/logistica_salida/pedidos/vVentaPedidos.vue'
import vVentas from '@/views/logistica_salida/ventas/vVentas.vue'

// ----- PRODUCCIÓN ----- //
import vProgramaFiltrantes from '@/views/produccion/filtrante/vProgramaFiltrantes.vue'
import vProgramaGranel from '@/views/produccion/granel/vProgramaGranel.vue'
import vProgramaLuxury from '@/views/produccion/piramidal/vProgramaLuxury.vue'
import vProduccionHistorial from '@/views/produccion/historial/vProduccionHistorial.vue'
import vProductosCuarentena from '@/views/produccion/vProductosCuarentena.vue'

// ----- CALIDAD ----- //
import vFormatosBpm from '@/views/calidad/formatos/vFormatosBpm.vue'
import vFormatosPhs from '@/views/calidad/formatos/vFormatosPhs.vue'
import vFormatosHaccp from '@/views/calidad/formatos/vFormatosHaccp.vue'
import vRegistrosSanitarios from '@/views/calidad/documentos/vRegistrosSanitarios.vue'
import vInspecciones from '@/views/calidad/inspecciones/vInspecciones.vue'

// ----- OPERACIONES ----- //
import vDocumentos from '@/views/operaciones/documentos/vDocumentos.vue'
import vCajaAperturas from '@/views/operaciones/caja_chica/vCajaAperturas.vue'
import vMonedas from '@/views/operaciones/monedas/vMonedas.vue'
import vMaquinas from '@/views/operaciones/maquinas/vMaquinas.vue'
import vEquipos from '@/views/operaciones/equipos/vEquipos.vue'
import vColaboradores from '@/views/operaciones/colaboradores/vColaboradores.vue'
import vSessions from '@/views/operaciones/sessions/vSessions.vue'
import vActivityLogs from '@/views/operaciones/activity_logs/vActivityLogs.vue'

import { useVistas } from '@/pinia/vistas.js'

export default {
    components: {
        // PestanasOpen,
        // vHome,

        vProveedores,
        vArticuloCategorias,
        vArticulos,
        vPrecioListas,
        vCompraPedidos,
        vCompras,
        vCompraItems,

        vClientes,
        vProductoCategorias,
        vProductosTerminados,
        vPtsIngresos,
        vVentaPedidos,
        vVentas,

        vProgramaFiltrantes,
        vProgramaGranel,
        vProgramaLuxury,
        vProduccionHistorial,
        vProductosCuarentena,

        vFormatosBpm,
        vFormatosPhs,
        vFormatosHaccp,
        vRegistrosSanitarios,
        vInspecciones,

        vDocumentos,
        vCajaAperturas,
        vMonedas,
        vMaquinas,
        vEquipos,
        vColaboradores,
        vSessions,
        vActivityLogs,
    },
    data: () => ({
        useVistas: useVistas()
    })
}
</script>

<style lang="scss">
.main-center {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: hidden;

    .vista {
        background-color: var(--bg-color);
        padding: 2rem 2rem;
        border-radius: 0.5rem;

        >.head {
            margin-bottom: 1rem;
            display: flex;
            justify-content: space-between;
            // align-items: center;
            gap: 1rem;
            flex-wrap: wrap;
            border-bottom: var(--border);
            padding-bottom: 1rem;

            strong {
                font-size: 1.4rem;
            }

            .buttons {
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
            }
        }
    }

    .vista-fill {
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
}
</style>
