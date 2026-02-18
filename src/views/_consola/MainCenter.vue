<template>
    <section class="main-center">
        <!-- <PestanasOpen /> -->
        <vProductoLineas v-if="useVistas.show.vProductoLineas" />
        <vArticuloCategorias v-if="useVistas.show.vArticuloCategorias" />
        <vArticulos v-if="useVistas.show.vArticulos" />
        <vInventarioArticulos v-if="useVistas.show.vInventarioArticulos" />

        <vProveedores v-if="useVistas.show.vProveedores" />
        <vCompraPedidos v-if="useVistas.show.vCompraPedidos" />
        <vCompraPedidoItems v-if="useVistas.show.vCompraPedidoItems" />
        <vCompras v-if="useVistas.show.vCompras" />
        <vCompraItems v-if="useVistas.show.vCompraItems" />

        <vClientes v-if="useVistas.show.vClientes" />
        <vVentaPedidos v-if="useVistas.show.vVentaPedidos" />
        <vVentaPedidoItems v-if="useVistas.show.vVentaPedidoItems" />
        <vVentas v-if="useVistas.show.vVentas" />
        <vVentaItems v-if="useVistas.show.vVentaItems" />

        <vMrpBom v-if="useVistas.show.vMrpBom" />
        <vPrograma v-if="useVistas.show.vPrograma" />
        <vProduccionHistorial v-if="useVistas.show.vProduccionHistorial" />
        <vProductosCuarentena v-if="useVistas.show.vProductosCuarentena" />
        <vPtsIngresos v-if="useVistas.show.vPtsIngresos" />
        <vReporteProduccion v-if="useVistas.show.vReporteProduccion" />

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
        <vAsistencias v-if="useVistas.show.vAsistencias" />
        <vSessions v-if="useVistas.show.vSessions" />
        <vActivityLogs v-if="useVistas.show.vActivityLogs" />
    </section>
</template>

<script>
// import PestanasOpen from './PestanasOpen.vue'
// import vHome from '@/views/u/home/vHome.vue'

// ----- INVENTARIO ----- //
import vProductoLineas from '@/views/inventario/lineas/vProductoLineas.vue'
import vArticuloCategorias from '@/views/inventario/categorias/vArticuloCategorias.vue'
import vArticulos from '@/views/inventario/articulos/vArticulos.vue'
import vInventarioArticulos from '@/views/inventario/inventario/vInventarioArticulos.vue'

// ----- COMPRAS ----- //
import vProveedores from '@/views/logistica_entrada/proveedores/vProveedores.vue'
import vCompraPedidos from '@/views/logistica_entrada/pedidos/vCompraPedidos.vue'
import vCompraPedidoItems from '@/views/logistica_entrada/pedido_items/vCompraPedidoItems.vue'
import vCompras from '@/views/logistica_entrada/compras/vCompras.vue'
import vCompraItems from '@/views/logistica_entrada/compra_items/vCompraItems.vue'

// ----- LOGISTICA SALIDA ----- //
import vClientes from '@/views/logistica_salida/clientes/vClientes.vue'
import vVentaPedidos from '@/views/logistica_salida/pedidos/vVentaPedidos.vue'
import vVentaPedidoItems from '@/views/logistica_salida/pedido_items/vVentaPedidoItems.vue'
import vVentas from '@/views/logistica_salida/ventas/vVentas.vue'
import vVentaItems from '@/views/logistica_salida/venta_items/vVentaItems.vue'

// ----- PRODUCCIÓN ----- //
import vMrpBom from '@/views/produccion/mrp_bom/vMrpBom.vue'
import vPrograma from '@/views/produccion/vPrograma.vue'
import vProduccionHistorial from '@/views/produccion/historial/vProduccionHistorial.vue'
import vProductosCuarentena from '@/views/produccion/vProductosCuarentena.vue'
import vPtsIngresos from '@/views/logistica_salida/ingreso_pt/vPtsIngresos.vue'
import vReporteProduccion from '@/views/produccion/vReporteProduccion.vue'

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
import vAsistencias from '@/views/operaciones/asistencias/vAsistencias.vue'
import vSessions from '@/views/operaciones/sessions/vSessions.vue'
import vActivityLogs from '@/views/operaciones/activity_logs/vActivityLogs.vue'

import { useVistas } from '@/pinia/vistas.js'

export default {
    components: {
        // PestanasOpen,
        // vHome,
        vProductoLineas,
        vArticuloCategorias,
        vArticulos,
        vInventarioArticulos,

        vProveedores,
        vCompraPedidos,
        vCompraPedidoItems,
        vCompras,
        vCompraItems,

        vClientes,
        vVentaPedidos,
        vVentaPedidoItems,
        vVentas,
        vVentaItems,

        vMrpBom,
        vPrograma,
        vProduccionHistorial,
        vProductosCuarentena,
        vPtsIngresos,
        vReporteProduccion,

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
        vAsistencias,
        vSessions,
        vActivityLogs,
    },
    data: () => ({
        useVistas: useVistas(),
    }),
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

        > .head {
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

    .tablero {
        height: 100%;
        overflow-y: auto;
        // padding: 0 1rem;

        .head {
            display: flex;
            justify-content: space-between;
            gap: 1rem;
            flex-wrap: wrap;
            // position: sticky;
            top: 0;
            background-color: var(--bg-color2);
            padding: 1rem 0;
            // z-index: 3;

            strong {
                font-size: 1.4rem;
            }

            .buttons {
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
            }
        }

        .card {
            padding: 1rem;
            background-color: var(--bg-color);
            border-radius: 1rem;
            box-shadow: 0 0 0.5rem var(--shadow-color);
            overflow: hidden;
        }

        .card-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1.5rem;
        }

        .monto-resumen {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            // text-align: center;

            p {
                color: var(--text-color2);
            }

            span {
                font-size: 1.5rem;
            }
        }

        .cols2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            margin-bottom: 2rem;
        }
    }
}
</style>
