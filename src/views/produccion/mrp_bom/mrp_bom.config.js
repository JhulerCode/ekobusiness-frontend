export default {
    name: 'vMrpBom',
    title: 'Lista de materiales',
    apiPath: 'mrp_boms',

    headerActions: [
        {
            text: 'Nuevo',
            action: 'nuevo',
            permiso: 'vMrpBom:crear',
        },
        {
            icon: 'fa-solid fa-download',
            text: 'Exportar página actual',
            action: 'vista.downloadActualTablePage',
            tipo: '2',
        },
    ],

    tableColumns: [
        {
            id: 'articulo1.nombre',
            title: 'Producto',
            prop: 'articulo1.nombre',
            type: 'related',
            relatedUrl: 'articulos',
            width: '25rem',
            show: true,
            seek: true,
            orden: 1,
        },
        {
            id: 'tipo',
            title: 'Tipo',
            prop: 'tipo1.nombre',
            type: 'text',
            width: '10rem',
            show: true,
            seek: true,
            orden: 2,
        },
    ],

    tableRowActions: [
        {
            label: 'Ver',
            icon: 'fa-solid fa-folder-open',
            action: 'ver',
            permiso: 'vMrpBom:ver',
        },
        {
            label: 'Editar',
            icon: 'fa-solid fa-pen-to-square',
            action: 'editar',
            permiso: 'vMrpBom:editar',
        },
        {
            label: 'Eliminar',
            icon: 'fa-solid fa-trash-can',
            action: 'vista.eliminar',
            permiso: 'vMrpBom:eliminar',
        },
    ],
}
