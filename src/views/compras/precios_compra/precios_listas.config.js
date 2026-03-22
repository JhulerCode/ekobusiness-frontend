export default {
    name: 'vPreciosCompra',
    title: 'Precios',
    apiPath: 'articulo_suppliers',

    headerActions: [
        {
            text: 'Nuevo',
            action: 'nuevo',
            permiso: 'vPreciosCompra:crear',
        },
    ],

    tableColumns: [
        {
            id: 'id',
            title: 'id',
            type: 'text',
            width: '5rem',
            show: false,
            orden: 1,
        },
        {
            id: 'articulo',
            title: 'Artículo',
            prop: 'articulo1.nombre',
            type: 'related',
            relatedUrl: 'articulos',
            width: '20rem',
            show: true,
            seek: true,
            orden: 2,
        },
        {
            id: 'socio',
            title: 'Proveedor',
            prop: 'socio1.nombres',
            type: 'related',
            relatedUrl: 'socios',
            mostrar: 'nombres',
            width: '20rem',
            show: true,
            seek: true,
            orden: 3,
        },
        {
            id: 'currency_id',
            title: 'Moneda',
            prop: 'currency_id1.nombre',
            type: 'related',
            relatedUrl: 'monedas',
            width: '10rem',
            show: true,
            seek: true,
            orden: 4,
        },
        {
            id: 'price',
            title: 'Valor unitario',
            type: 'decimal',
            width: '10rem',
            show: true,
            orden: 5,
        },
    ],

    tableBulkActions: [
        {
            icon: 'fa-solid fa-trash-can',
            text: 'Eliminar',
            action: 'vista.eliminarBulk',
            permiso: 'vPreciosCompra:eliminarBulk',
        },
    ],

    tableRowActions: [
        {
            id: 1,
            label: 'Editar',
            icon: 'fa-solid fa-pen-to-square',
            action: 'editar',
            permiso: 'vPreciosCompra:editar',
        },
        {
            id: 3,
            label: 'Artículos',
            icon: 'fa-solid fa-tags',
            action: 'verArticulos',
            permiso: 'vPrecioListaItems:listar',
        },
    ],
}
