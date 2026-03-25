export default {
    titleKey: 'nombre',
    apiPath: 'articulos',
    permisoEditar: ['vArticulos:editar'],
    permisoClonar: ['vArticulos:clonar'],

    headerActions: [
        {
            text: 'Actualizar fotos',
            icon: 'fa-solid fa-image',
            tipo: '2',
            action: 'actualizarFotos',
            permiso: 'vArticulos:actualizarFotos',
        },
        {
            text: 'Lista de materiales',
            icon: 'fa-solid fa-list',
            tipo: '2',
            action: 'verListaMateriales',
            permiso: 'vArticulos:listaMateriales',
        },
        {
            text: 'Kardex',
            icon: 'fa-solid fa-table-list',
            tipo: '2',
            action: 'verKardex',
            permiso: 'vArticulos:kardex',
        },
        {
            text: 'Lotes',
            icon: 'fa-solid fa-table-list',
            tipo: '2',
            action: 'verLotes',
            permiso: 'vArticulos:lotes',
        },
        {
            text: 'Ajustar stock',
            icon: 'fa-solid fa-wrench',
            tipo: '2',
            action: 'ajusteStock',
            permiso: 'vArticulos:ajusteStock',
        },
    ],
}
