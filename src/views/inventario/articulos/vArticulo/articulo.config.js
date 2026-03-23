export default {
    name: 'vArticulo',
    titleKey: 'nombre',
    apiPath: 'articulos',
    permisoEditar: ['vArticulos:editar'],

    headerActions: [
        {
            text: 'Ver kardex',
            icon: 'fa-solid fa-table-list',
            tipo: '2',
            action: 'verKardex',
            permiso: 'vArticulos:kardex',
        },
    ],
}
