export default {
    name: 'vArticuloDetalle',
    apiPath: 'articulos',

    headerActions: [
        {
            icon: 'fa-solid fa-pen-to-square',
            text: 'Editar',
            action: 'editar',
            permiso: 'vArticulos:editar',
        },
        {
            icon: 'fa-solid fa-xmark',
            text: 'Cancelar',
            action: 'cancelar',
            tipo: '2',
            show: false,
        },
        {
            icon: 'fa-solid fa-floppy-disk',
            text: 'Guardar',
            action: 'guardar',
            show: false,
        },
    ],
}
