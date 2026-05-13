import menuUserInventario from '@/config/menuUserInventario.js'
import menuUserCompras from '@/config/menuUserCompras.js'
import menuUserVentas from '@/config/menuUserVentas.js'
import menuUserProduccion from '@/config/menuUserProduccion.js'

export default [
    menuUserInventario,
    menuUserCompras,
    menuUserVentas,
    menuUserProduccion,
    {
        id: 'calidad',
        label: 'Calidad',
        icon: 'fa-solid fa-magnifying-glass',
        path: 'calidad',
        children: [
            {
                label: 'Formatos calidad',
                goto: 'vFormatoStructures',
                path: 'formatos-estructuras',
                view: 'calidad/formato_structures/vFormatoStructures.vue',
                permisos: [
                    { id: 'vFormatoStructures:listar', label: 'Listar' },
                    { id: 'vFormatoStructures:crear', label: 'Crear' },
                    { id: 'vFormatoStructures:ver', label: 'Ver' },
                    { id: 'vFormatoStructures:editar', label: 'Editar' },
                    { id: 'vFormatoStructures:eliminar', label: 'Eliminar' },
                ],
                children: [
                    {
                        label: 'Diseño de Formato',
                        goto: 'vFormatoStructure',
                        path: ':formato_structure_id',
                        view: 'calidad/formato_structures/vFormatoStructure.vue',
                        permission: 'vFormatoStructures:ver',
                        viewType: 'detail',
                    },
                ],
            },
            {
                label: 'Registros sanitarios',
                goto: 'vRegistrosSanitarios',
                path: 'registros-sanitarios',
                view: 'calidad/documentos/vRegistrosSanitarios.vue',
                permisos: [
                    { id: 'vRegistrosSanitarios:listar', label: 'Listar' },
                    { id: 'vRegistrosSanitarios:crear', label: 'Crear' },
                    { id: 'vRegistrosSanitarios:editar', label: 'Editar' },
                    { id: 'vRegistrosSanitarios:eliminar', label: 'Eliminar' },
                ],
            },
            {
                label: 'Inspecciones de clientes',
                goto: 'vInspecciones',
                path: 'inspecciones',
                view: 'calidad/inspecciones/vInspecciones.vue',
                permisos: [
                    { id: 'vInspecciones:listar', label: 'Listar' },
                    { id: 'vInspecciones:crear', label: 'Crear' },
                    { id: 'vInspecciones:ver', label: 'Ver' },
                    { id: 'vInspecciones:editar', label: 'Editar' },
                    { id: 'vInspecciones:eliminar', label: 'Eliminar' },
                ],
            },
        ],
    },
    {
        id: 'operaciones',
        label: 'Operaciones',
        icon: 'fa-solid fa-gears',
        path: 'operaciones',
        children: [
            {
                label: 'Documentos clave',
                goto: 'vDocumentos',
                path: 'documentos',
                view: 'operaciones/documentos/vDocumentos.vue',
                permisos: [
                    { id: 'vDocumentos:listar', label: 'Listar' },
                    { id: 'vDocumentos:crear', label: 'Crear' },
                    { id: 'vDocumentos:editar', label: 'Editar' },
                    { id: 'vDocumentos:eliminar', label: 'Eliminar' },
                ],
            },
            {
                label: 'Caja chica',
                goto: 'vCajaAperturas',
                path: 'caja-chica',
                view: 'operaciones/caja_chica/vCajaAperturas.vue',
                permisos: [
                    { id: 'vCajaAperturas:listar', label: 'Listar' },
                    { id: 'vCajaAperturas:aperturarCaja', label: 'Aperturar caja' },
                    { id: 'vCajaAperturas:ver', label: 'Ver' },
                    { id: 'vCajaAperturas:cerrarCaja', label: 'Cerrar caja' },
                    { id: 'vCajaAperturas:eliminar', label: 'Eliminar' },
                    { id: 'vCajaMovimientos:listar', label: 'Listar movimientos' },
                    { id: 'vCajaMovimientos:crear', label: 'Crear movimiento' },
                    { id: 'vCajaMovimientos:editar', label: 'Editar movimiento' },
                    { id: 'vCajaMovimientos:eliminar', label: 'Eliminar movimiento' },
                ],
            },
            {
                label: 'Tipos de cambio',
                goto: 'vTipoCambios',
                path: 'tipo-cambios',
                view: 'operaciones/tipo_cambios/vTipoCambios.vue',
                permisos: [
                    { id: 'vTipoCambios:listar', label: 'Listar' },
                    { id: 'vTipoCambios:crear', label: 'Crear' },
                    { id: 'vTipoCambios:editar', label: 'Editar' },
                    { id: 'vTipoCambios:eliminar', label: 'Eliminar' },
                ],
            },
            {
                label: 'Máquinas',
                goto: 'vMaquinas',
                path: 'maquinas',
                view: 'operaciones/maquinas/vMaquinas.vue',
                permisos: [
                    { id: 'vMaquinas:listar', label: 'Listar' },
                    { id: 'vMaquinas:crear', label: 'Crear' },
                    { id: 'vMaquinas:editar', label: 'Editar' },
                    { id: 'vMaquinas:eliminar', label: 'Eliminar' },
                ],
            },
            {
                label: 'Equipos',
                goto: 'vEquipos',
                path: 'equipos',
                view: 'operaciones/equipos/vEquipos.vue',
                permisos: [
                    { id: 'vEquipos:listar', label: 'Listar' },
                    { id: 'vEquipos:crear', label: 'Crear' },
                    { id: 'vEquipos:editar', label: 'Editar' },
                    { id: 'vEquipos:eliminar', label: 'Eliminar' },
                ],
            },
            {
                label: 'Colaboradores',
                goto: 'vColaboradores',
                path: 'colaboradores',
                view: 'operaciones/colaboradores/vColaboradores.vue',
                permisos: [
                    { id: 'vColaboradores:listar', label: 'Listar' },
                    { id: 'vColaboradores:crear', label: 'Crear' },
                    { id: 'vColaboradores:ver', label: 'Ver' },
                    { id: 'vColaboradores:editar', label: 'Editar' },
                    { id: 'vColaboradores:eliminar', label: 'Eliminar' },
                ],
            },
            {
                label: 'Asistencias',
                goto: 'vAsistencias',
                path: 'asistencias',
                view: 'operaciones/asistencias/vAsistencias.vue',
                permisos: [
                    { id: 'vAsistencias:listar', label: 'Listar' },
                    { id: 'vAsistencias:crear', label: 'Crear' },
                    { id: 'vAsistencias:editar', label: 'Editar' },
                    { id: 'vAsistencias:eliminar', label: 'Eliminar' },
                ],
            },
            // {
            //     label: 'Usuarios conectados',
            //     goto: 'vSessions',
            //     path: 'sesiones',
            //     view: 'operaciones/sessions/vSessions.vue',
            //     permisos: [{ id: 'vSessions:listar', label: 'Listar' }],
            // },
        ],
    },
    {
        id: 'configuracion',
        label: 'Configuración',
        icon: 'fa-solid fa-screwdriver-wrench',
        path: 'configuracion',
        children: [
            {
                label: 'Mi empresa',
                goto: 'vEmpresa',
                path: 'empresa',
                view: '_user/empresa/vEmpresa.vue',
                viewType: 'detail',
                permisos: [
                    { id: 'vEmpresa:ver', label: 'Ver' },
                    { id: 'vEmpresa:editar', label: 'Editar' },
                ],
            },
            {
                label: 'Suscripciones',
                goto: 'vSuscripciones',
                path: 'suscripciones',
                view: '_user/suscripciones/vSuscripciones.vue',
                permisos: [{ id: 'vSuscripciones:listar', label: 'Listar' }],
            },
        ],
    },
]
