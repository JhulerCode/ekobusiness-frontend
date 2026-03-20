export default {
    name: 'vProductoLineas',
    title: 'Líneas de productos',
    apiPath: 'articulo_lineas',

    headerActions: [
        {
            text: 'Nuevo',
            action: 'nuevo',
            permiso: 'vProductoLineas:crear',
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
            id: 'nombre',
            title: 'Nombre',
            type: 'text',
            width: '15rem',
            show: true,
            seek: true,
            orden: 1,
        },
        {
            id: 'activo',
            title: 'Activo?',
            prop: 'activo1.nombre',
            type: 'select',
            systemKey: 'estados',
            editable: true,
            format: 'estado',
            color: 'activo1.color',
            width: '10rem',
            show: true,
            orden: 2,
        },
        {
            id: 'is_ecommerce',
            title: 'Ecommerce?',
            prop: 'is_ecommerce1.nombre',
            type: 'select',
            systemKey: 'estados',
            format: 'estado',
            color: 'is_ecommerce1.color',
            width: '10rem',
            show: true,
            orden: 3,
        },
        {
            id: 'descripcion',
            title: 'Descripción',
            type: 'text',
            width: '20rem',
            show: true,
            seek: true,
            orden: 4,
        },
    ],

    // tableBulkActions: [
    //     {
    //         icon: 'fa-solid fa-pen-to-square',
    //         text: 'Editar',
    //         action: 'vista.editarBulk',
    //         permiso: 'vProductoLineas:editarBulk',
    //     },
    //     {
    //         icon: 'fa-solid fa-trash-can',
    //         text: 'Eliminar',
    //         action: 'vista.eliminarBulk',
    //         permiso: 'vProductoLineas:eliminarBulk',
    //     },
    // ],

    tableRowActions: [
        {
            label: 'Editar',
            icon: 'fa-solid fa-pen-to-square',
            action: 'editar',
            permiso: 'vProductoLineas:editar',
        },
        {
            label: 'Eliminar',
            icon: 'fa-solid fa-trash-can',
            action: 'vista.eliminar',
            permiso: 'vProductoLineas:eliminar',
        },
        {
            label: 'Actualizar fotos',
            icon: 'fa-solid fa-image',
            action: 'openUploadFiles',
            permiso: 'vProductoLineas:actualizarFotos',
        },
    ],
}
