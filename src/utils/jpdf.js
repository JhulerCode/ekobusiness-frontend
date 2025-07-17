import dayjs from 'dayjs'
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import { getItemFromArray, redondear, numeroATexto } from './mine'
import { urls, get } from '@/utils/crud'
import { useAuth } from '@/pinia/auth'
import { logoBase64 } from '@/assets/img/logo.js'

pdfMake.vfs = pdfFonts

const totales = {}

const vista = {}

async function loadDatosSistema() {
    const qry = ['empresa', 'pago_condiciones', 'unidades']

    useAuth().setLoading(true, 'Cargando...')
    const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)
    useAuth().setLoading(false)

    if (res.code != 0) return

    Object.assign(vista, res.data)
}

export const generarOcPDF = async (data) => {
    await loadDatosSistema()

    // const pageWidth = 595
    const marginTop = 40
    const marginLeft = 40
    const lineColor = '#dfdfdf'
    const fillColor = '#e8e8e8'

    let dataRows = data.socio_pedido_items.map(a => [
        { text: truncateTextByWidth(a.nombre), style: 'tableItem' },
        // { text: getItemFromArray(a.unidad, vista.unidades, 'codigo'), style: 'tableItem' },
        { text: a.unidad, style: 'tableItem' },
        { text: redondear(a.cantidad), alignment: 'right', style: 'tableItem' },
        { text: a.pu, alignment: 'right', style: 'tableItem' },
        { text: redondear(a.cantidad * a.pu), alignment: 'right', style: 'tableItem' }
    ])

    // const nombrePrueba = 'Nombre de un producto muy largo que debería truncarse siempre y cuando no seá bien'
    //----- COMPLETAR FILAS VACÍAS ----- //
    const maxItems = 20
    if (dataRows.length < maxItems) {
        let emptyRows = Array.from({ length: maxItems - dataRows.length }, () => [
            { text: '\u200B', style: 'tableItem' },
            { text: '', style: 'tableItem' },
            { text: '', style: 'tableItem' },
            { text: '', style: 'tableItem' },
            { text: '', style: 'tableItem' },
        ])
        dataRows = dataRows.concat(emptyRows)
    }
    // console.log(dataRows)

    sumarItems(data.socio_pedido_items)

    const documentDefinition = {
        pageMargins: [marginTop, marginLeft, marginTop, marginLeft],
        content: [
            // CABECERA
            {
                columnGap: 10,
                columns: [
                    {
                        width: 120,
                        stack: [
                            {
                                image: logoBase64,
                                fit: [120, 73],
                                alignment: 'center',
                            },
                        ]
                    },
                    {
                        width: '*',
                        stack: [
                            {
                                text: vista.empresa.nombre,
                                bold: true,
                                margin: [0, 4, 0, 4],
                                alignment: 'center'
                            },
                            {
                                text: `${vista.empresa.direcciones[0].direccion}\nTel: ${vista.empresa.telefono}\nCorreo: ${vista.empresa.correo}`,
                                alignment: 'center'
                            },
                        ],
                    },
                    {
                        width: 150,
                        stack: [
                            {
                                table: {
                                    widths: ['*'],
                                    body: [
                                        [{
                                            text: `R.U.C. ${vista.empresa.ruc}`, style: 'rucHeader'
                                        }],
                                        [{
                                            text: 'ORDEN DE COMPRA', alignment: 'center', fillColor: fillColor, fontSize: 12, bold: true, margin: [0, 5, 0, 5],
                                        }],
                                        [{
                                            text: data.codigo, style: 'rucHeader'
                                        }]
                                    ]
                                },
                                layout: 'noBorders'
                            },
                            {
                                canvas: [
                                    {
                                        type: 'rect',
                                        x: 0,
                                        y: -73,
                                        w: 150,
                                        h: 73,
                                        r: 10,
                                        lineWidth: 1,
                                        lineColor
                                    }
                                ]
                            },
                        ],
                    }
                ],
            },
            // DATOS GENERALES
            {
                margin: [0, 15, 0, 0],
                // stack: [
                //     {
                table: {
                    widths: [80, 3, '*'],
                    body: [
                        [
                            { text: 'Fecha de emisión', bold: true },
                            { text: ':' },
                            { text: dayjs(data.fecha).format('DD-MM-YYYY') }
                        ],
                        [
                            { text: 'Lugar de entrega', bold: true },
                            { text: ':' },
                            { text: vista.empresa.direcciones[0].direccion }
                        ],
                        [
                            { text: 'Condición de pago', bold: true },
                            { text: ':' },
                            { text: getItemFromArray(data.pago_condicion, vista.pago_condiciones) }
                        ],
                        [
                            { text: 'Moneda', bold: true },
                            { text: ':' },
                            { text: data.moneda1.nombre }
                        ],
                    ]
                },
                layout: {
                    vLineWidth: () => 0,
                    hLineWidth: () => 0,
                },
                // },
                // {
                //     canvas: [
                //         {
                //             type: 'rect',
                //             x: 0,
                //             y: -60.5,
                //             w: pageWidth - (marginLeft * 2),
                //             h: 63,
                //             r: 7,
                //             lineWidth: 1,
                //             lineColor
                //         }
                //     ]
                // },
                // ],
            },
            // PROVEEDOR
            {
                margin: [0, 15, 0, 0],
                columnGap: 20,
                columns: [
                    {
                        width: 250,
                        // stack: [
                        //     {
                        table: {
                            widths: [50, 3, '*'],
                            body: [
                                [
                                    { text: 'DIRIGIDO A:', bold: true, colSpan: 3, fillColor },
                                    {},
                                    {}
                                ],
                                [
                                    { text: 'Compañia', bold: true },
                                    { text: ':' },
                                    { text: data.socio1.nombres },
                                ],
                                [
                                    { text: 'Ruc', bold: true },
                                    { text: ':' },
                                    { text: data.socio1.doc_numero },
                                ],
                                [
                                    { text: 'Contacto', bold: true },
                                    { text: ':' },
                                    { text: data.contacto_datos.nombre },
                                ],
                                [
                                    { text: 'Teléfono', bold: true },
                                    { text: ':' },
                                    { text: data.contacto_datos.telefono },
                                ]
                            ]
                        },
                        layout: {
                            vLineWidth: () => 0,
                            hLineWidth: () => 0,
                        },
                        //     },
                        //     {
                        //         canvas: [
                        //             {
                        //                 type: 'rect',
                        //                 x: 0,
                        //                 y: -73,
                        //                 w: 250,
                        //                 h: 73,
                        //                 r: 10,
                        //                 lineWidth: 1,
                        //                 lineColor
                        //             }
                        //         ]
                        //     },
                        // ]
                    },
                    {
                        width: 250,
                        table: {
                            widths: [50, 3, '*'],
                            body: [
                                [
                                    { text: 'SOLICITADO POR:', bold: true, colSpan: 3, fillColor },
                                    {},
                                    {}
                                ],
                                [
                                    { text: 'Contacto', bold: true },
                                    { text: ':' },
                                    { text: data.createdBy1.nombres + ' ' + data.createdBy1.apellidos },
                                ],
                                [
                                    { text: 'Cargo', bold: true },
                                    { text: ':' },
                                    { text: data.createdBy1.cargo },
                                ],
                                [
                                    { text: 'Teléfono', bold: true },
                                    { text: ':' },
                                    { text: data.createdBy1.telefono },
                                ]
                            ]
                        },
                        layout: {
                            vLineWidth: () => 0,
                            hLineWidth: () => 0,
                        },
                    },
                ],
            },
            // PRODUCTOS
            {
                margin: [0, 20, 0, 0],
                stack: [
                    {
                        table: {
                            widths: [220, 60, 60, 60, 70],
                            body: [
                                [
                                    {
                                        text: 'DESCRIPCIÓN',
                                        style: 'tableHeader',
                                    },
                                    {
                                        text: 'UNIDAD',
                                        style: 'tableHeader',
                                    },
                                    {
                                        text: 'CANTIDAD',
                                        style: 'tableHeader',
                                    },
                                    {
                                        text: 'PRECIO UNIT.',
                                        style: 'tableHeader',
                                    },
                                    {
                                        text: 'IMPORTE',
                                        style: 'tableHeader',
                                    }
                                ],
                                ...dataRows
                            ]
                        },
                        layout: {
                            // hLineWidth: (i) => (i === 1 ? 1 : 0), // Solo línea debajo del encabezado
                            // vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length ? 0 : 1), // Líneas internas
                            hLineWidth: (i, node) => i === node.table.body.length ? 1 : 0,
                            vLineWidth: () => 1,
                            hLineColor: () => lineColor,
                            vLineColor: () => lineColor,
                        },
                    },
                    // {
                    //     canvas: [
                    //         {
                    //             type: 'rect',
                    //             x: 0,
                    //             y: -387,
                    //             w: pageWidth - (marginLeft * 2),
                    //             h: 387,
                    //             r: 7,
                    //             lineWidth: 1,
                    //             lineColor
                    //         }
                    //     ]
                    // },
                ],
            },
            // FOOTER
            {
                margin: [0, 20, 0, 0],
                columns: [
                    {
                        width: 340,
                        stack: [
                            {
                                margin: [0, 0, 0, 5],
                                table: {
                                    widths: ['auto', 'auto'],
                                    body: [
                                        [
                                            { text: 'SON:', bold: true },
                                            { text: numeroATexto(totales.mtoImpVenta) }
                                        ],
                                    ]
                                },
                                layout: 'noBorders'
                            },
                            {
                                canvas: [
                                    {
                                        type: 'rect',
                                        x: 0,
                                        y: 0,
                                        w: 250,
                                        h: 70,
                                        r: 7,
                                        lineWidth: 1,
                                        lineColor
                                    }
                                ]
                            },
                            {
                                table: {
                                    widths: [250],
                                    body: [
                                        [
                                            { text: 'Comentarios:', bold: true },
                                        ],
                                        [
                                            { text: data.observacion }
                                        ]
                                    ]
                                },
                                layout: {
                                    hLineWidth: () => 0,
                                    vLineWidth: () => 0
                                },
                                absolutePosition: { x: 40, y: 720 }
                            }
                        ]
                    },
                    {
                        width: 155,
                        stack: [
                            {
                                table: {
                                    widths: [80, 3, 70],
                                    body: [
                                        [
                                            { text: 'Ope. gravadas' },
                                            { text: ':' },
                                            { text: redondear(totales.mtoOperGravadas), alignment: 'right' }
                                        ],
                                        [
                                            { text: 'Ope. exoneradas' },
                                            { text: ':' },
                                            { text: redondear(totales.mtoOperExoneradas), alignment: 'right' }
                                        ],
                                        [
                                            { text: 'Ope. inafectas' },
                                            { text: ':' },
                                            { text: redondear(totales.mtoOperInafectas), alignment: 'right' }
                                        ],
                                        [
                                            { text: 'Subtotal' },
                                            { text: ':' },
                                            { text: redondear(totales.valorVenta), alignment: 'right' }
                                        ],
                                        [
                                            { text: 'Impuesto' },
                                            { text: ':' },
                                            { text: redondear(totales.mtoIGV), alignment: 'right' }
                                        ],
                                        [
                                            { text: 'Importe total', bold: true },
                                            { text: ':', bold: true },
                                            { text: `${data.moneda1.simbolo} ${redondear(totales.mtoImpVenta)}`, alignment: 'right', bold: true }
                                        ]
                                    ]
                                },
                                layout: {
                                    hLineWidth: () => 0,
                                    vLineWidth: () => 0
                                },
                            },
                            {
                                canvas: [
                                    {
                                        type: 'rect',
                                        x: 0,
                                        y: -91,
                                        w: 177,
                                        h: 94,
                                        r: 7,
                                        lineWidth: 1,
                                        lineColor
                                    }
                                ]
                            },
                        ]
                    }
                ]
            }
        ],
        styles: {
            // CABECERA
            rucHeader: {
                fontSize: 12,
                bold: true,
                alignment: 'center',
                margin: [0, 2, 0, 2]
            },
            // PRODUCTOS
            tableHeader: {
                bold: true,
                alignment: 'center',
                fillColor
            },
            tableItem: {
                margin: [0, 2, 0, 2],
                noWrap: true
            }
        },
        defaultStyle: {
            fontSize: 9,
        }
    }

    return pdfMake.createPdf(documentDefinition)
}

function measureTextWidth(text, font = "Roboto", fontSize = 9) {
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")
    context.font = `${fontSize}pt ${font}`
    return context.measureText(text).width / 1.33
}

function truncateTextByWidth(text, maxWidth = 200) {
    if (measureTextWidth(text) <= maxWidth) {
        return text
    }

    let truncatedText = text
    while (measureTextWidth(truncatedText + "...") > maxWidth && truncatedText.length > 0) {
        truncatedText = truncatedText.slice(0, -1)
    }

    return truncatedText + "..."
}

function sumarItems(items) {
    for (const a of items) calcularUno(a)

    calcularTotales(items)
}

function calcularUno(item) {
    item.vu = item.igv_afectacion == '10' ? item.pu / (1 + (item.igv_porcentaje / 100)) : item.pu

    item.mtoValorVenta = item.cantidad * item.vu
    item.igv = item.igv_afectacion == '10' ? item.mtoValorVenta * (item.igv_porcentaje / 100) : 0
    item.total = item.mtoValorVenta + item.igv
}

function calcularTotales(items) {
    totales.mtoOperGravadas = 0
    totales.mtoOperExoneradas = 0
    totales.mtoOperInafectas = 0
    totales.mtoIGV = 0

    for (const a of items) {
        if (a.igv_afectacion == '10') {
            totales.mtoOperGravadas += a.mtoValorVenta
            totales.mtoIGV += a.igv
        }
        else if (a.igv_afectacion == '20') {
            totales.mtoOperExoneradas += a.mtoValorVenta
        }
        else if (a.igv_afectacion == '30') {
            totales.mtoOperInafectas += a.mtoValorVenta
        }
    }

    totales.valorVenta = totales.mtoOperGravadas + totales.mtoOperExoneradas + totales.mtoOperInafectas
    totales.mtoImpVenta = totales.valorVenta + totales.mtoIGV
}
