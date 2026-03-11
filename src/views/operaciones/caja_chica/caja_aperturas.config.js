export const HEADER_ACTIONS = [
    {
        text: 'Nuevo',
        action: 'nuevo',
        permiso: 'vCajaAperturas:aperturarCaja',
    },
    {
        icon: 'fa-solid fa-download',
        text: 'Exportar página actual',
        action: 'vista.downloadActualTablePage',
        tipo: '2',
    }
]

export const TABLE_COLUMNS = [
    {
        id: 'fecha_apertura',
        title: 'Fecha apertura',
        type: 'date',
        format: 'date',
        width: '12rem',
        show: true,
        seek: true,
        sort: true,
        orden: 1,
    },
    {
        id: 'monto_apertura',
        title: 'Monto apertura',
        type: 'number',
        format: 'decimal',
        width: '12rem',
        show: true,
        seek: false,
        sort: false,
        orden: 2,
    },
    {
        id: 'fecha_cierre',
        title: 'Fecha cierre',
        type: 'date',
        format: 'date',
        width: '12rem',
        show: true,
        seek: true,
        sort: true,
        orden: 3,
    },
    {
        id: 'estado',
        title: 'Estado',
        type: 'select',
        prop: 'estado1.nombre',
        format: 'estado',
        width: '10rem',
        show: true,
        seek: false,
        sort: false,
        orden: 4,
    },
]

export const TABLE_ROW_ACTIONS = [
    {
        id: 1,
        label: 'Ver',
        icon: 'fa-solid fa-up-right-from-square',
        action: 'ver',
        permiso: 'vCajaAperturas:ver',
    },
    {
        id: 3,
        label: 'Eliminar',
        icon: 'fa-solid fa-trash-can',
        action: 'vista.eliminar',
        permiso: 'vCajaAperturas:eliminar',
        ocultar: { estado: 2 },
    },
    {
        id: 4,
        label: 'Movimientos',
        icon: 'fa-solid fa-right-left',
        action: 'agregarMovimientos',
        permiso: 'vCajaMovimientos:listar',
        ocultar: { estado: 2 },
    },
    {
        id: 2,
        label: 'Cerrar caja',
        icon: 'fa-solid fa-check-double',
        action: 'cerrarCaja',
        permiso: 'vCajaAperturas:cerrarCaja',
        ocultar: { estado: 2 },
    },
]
