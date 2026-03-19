export default {
    name: 'vCompraPedidoItems',
    title: 'Artículos pedidos',
    apiPath: 'socio_pedido_items',

    headerActions: [
        {
            icon: 'fa-solid fa-download',
            text: 'Exportar página actual',
            action: 'vista.downloadActualTablePage',
            tipo: '2',
        },
    ],

    tableColumns: [
        {
            id: 'socio_pedido1.fecha',
            title: 'Fecha',
            prop: 'socio_pedido1.fecha1',
            type: 'date',
            width: '8rem',
            show: true,
            orden: 1,
        },
        {
            id: 'socio_pedido1.codigo',
            title: 'Nro pedido',
            prop: 'socio_pedido1.codigo',
            type: 'text',
            width: '11rem',
            show: true,

            orden: 2,
        },
        {
            id: 'socio_pedido1.socio',
            title: 'Proveedor',
            prop: 'socio_pedido1.socio1.nombres',
            type: 'related',
            relatedUrl: 'socios',
            mostrar: 'nombres',
            width: '15rem',
            show: true,

            orden: 3,
        },
        {
            id: 'articulo',
            title: 'Artículo',
            prop: 'articulo1.nombre',
            type: 'related',
            relatedUrl: 'articulos',
            width: '20rem',
            show: true,

            orden: 4,
        },
        {
            id: 'pu',
            title: 'Valor unitario',
            type: 'number',
            toRight: true,
            width: '8rem',
            show: true,
            orden: 5,
        },
        {
            id: 'cantidad',
            title: 'Cantidad',
            type: 'number',
            format: 'decimal',
            toRight: true,
            width: '8rem',
            show: true,
            orden: 6,
        },
        {
            id: 'entregado',
            title: 'Entregado',
            type: 'number',
            format: 'decimal',
            toRight: true,
            width: '8rem',
            show: true,
            orden: 7,
        },
    ],
}
