export default {
    name: 'vCajaAperturas',
    title: 'Caja chica',
    apiPath: 'caja_aperturas',

    headerActions: [
        {
            text: 'Nuevo',
            action: 'nuevo',
            permiso: 'vCajaAperturas:aperturarCaja',
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
            id: 'fecha_apertura',
            title: 'Fecha apertura',
            prop: 'fecha_apertura1',
            type: 'date',
            width: '12rem',
            show: true,
            orden: 2,
        },
        {
            id: 'monto_apertura',
            title: 'Monto apertura',
            type: 'number',
            format: 'decimal',
            width: '12rem',
            show: true,
            orden: 3,
        },
        {
            id: 'fecha_cierre',
            title: 'Fecha cierre',
            prop: 'fecha_cierre1',
            type: 'date',
            width: '12rem',
            show: true,
            orden: 4,
        },
        {
            id: 'estado',
            title: 'Estado',
            prop: 'estado1.nombre',
            type: 'select',
            systemKey: 'caja_apertura_estados',
            format: 'estado',
            color: 'estado1.color',
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
            permiso: 'vCajaAperturas:eliminarBulk',
        },
    ],

    tableRowActions: [
        {
            id: 1,
            label: 'Ver',
            icon: 'fa-solid fa-up-right-from-square',
            action: 'ver',
            permiso: 'vCajaAperturas:ver',
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
    ],
}
