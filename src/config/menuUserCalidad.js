export default {
    id: 'calidad',
    label: 'Calidad',
    icon: 'fa-solid fa-magnifying-glass',
    path: 'calidad',
    children: [
        {
            label: 'Formatos calidad',
            goto: 'vFormatoStructures',
            path: 'formatos-estructuras',
            view: '_user/calidad/formato_structures/vFormatoStructures.vue',
            permisos: [
                { id: 'vFormatoStructures:listar', label: 'Listar' },
                { id: 'vFormatoStructures:crear', label: 'Crear' },
                { id: 'vFormatoStructures:ver', label: 'Ver' },
                { id: 'vFormatoStructures:editar', label: 'Editar' },
                { id: 'vFormatoStructures:eliminar', label: 'Eliminar' },
            ],
            children: [
                {
                    label: 'Detalle',
                    goto: 'vFormatoStructure',
                    path: ':formato_structure_id',
                    view: '_user/calidad/formato_structures/vFormatoStructure.vue',
                    permission: 'vFormatoStructures:ver',
                    viewType: 'detail',
                    children: [
                        {
                            label: 'Registros',
                            goto: 'vFormatoStructureValues',
                            path: 'formato-values',
                            view: '_user/calidad/formato_values/vFormatoValues.vue',
                            permission: 'vFormatoValues:listar',
                            // permisos: [
                            //     { id: 'vFormatoValues:listar', label: 'Listar' },
                            //     { id: 'vFormatoValues:crear', label: 'Crear' },
                            //     { id: 'vFormatoValues:ver', label: 'Ver' },
                            //     { id: 'vFormatoValues:editar', label: 'Editar' },
                            //     { id: 'vFormatoValues:eliminar', label: 'Eliminar' },
                            // ],
                        },
                    ],
                },
            ],
        },
        {
            label: 'Registros sanitarios',
            goto: 'vRegistrosSanitarios',
            path: 'registros-sanitarios',
            view: '_user/calidad/documentos/vRegistrosSanitarios.vue',
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
            view: '_user/calidad/inspecciones/vInspecciones.vue',
            permisos: [
                { id: 'vInspecciones:listar', label: 'Listar' },
                { id: 'vInspecciones:crear', label: 'Crear' },
                { id: 'vInspecciones:ver', label: 'Ver' },
                { id: 'vInspecciones:editar', label: 'Editar' },
                { id: 'vInspecciones:eliminar', label: 'Eliminar' },
            ],
        },
    ],
}
