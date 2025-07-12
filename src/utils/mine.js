import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

function playAudio(source) {
    const audio = new Audio(source)
    audio.play()

    audio.addEventListener('ended', () => {
        audio.remove()
    })
}

function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj))
}

function generarId(array, prop) {
    if (prop == undefined) prop = 'id'
    let id

    if (array.length == 0) {
        id = 1
    }
    else {
        const masAlto = array.reduce((max, objeto) => {
            if (objeto[prop] > max) return objeto[prop]
            return max
        }, 0)
        id = masAlto + 1
    }

    return id
}

function genId() {
    return `${Date.now()}${Math.floor(Math.random() * 900) + 100}`
}

function incompleteData(obj, p) {
    // p = array de propiedades a evaluar
    if (p === undefined) {
        for (let prop in obj) {
            if (obj[prop] === "" || obj[prop] === null || obj[prop] === undefined) {
                console.log(prop + ': ' + obj[prop])
                return true
            }
        }
    } else {
        for (let a of p) {
            if (obj[a] === "" || obj[a] === null || obj[a] === undefined) {
                console.log(a + ': ' + obj[a])
                return true
            }
        }
    }

    return false
}

function redondear(num, dec = 2) {
    if (num === null || num === undefined) return num

    return num.toLocaleString('en-US', {
        minimumFractionDigits: dec,
        maximumFractionDigits: dec
    })
}

function loadFiles(event) {
    const files = event.target.files

    if (!files.length) return Promise.resolve([])

    const promises = Array.from(files).map(file => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()

            const name = file.name
            const size = ((file.size / 1024).toFixed(1)) + ' KB' // Convert to KB
            const type = file.type
            const lastModifiedDate = file.lastModifiedDate.toLocaleDateString()
            const uri = URL.createObjectURL(file)

            reader.onload = () => {
                try {
                    const b64 = reader.result
                    resolve({ b64, name, size, type, lastModifiedDate, uri })
                } catch (error) {
                    reject(error)
                }
            }

            reader.onerror = error => reject(error)
            reader.readAsDataURL(file)
        })
    })

    return Promise.all(promises)
}

function getItemFromArray(idVal, array = [], prop = 'nombre', idProp = 'id') {
    const item = array.find(a => a[idProp] == idVal)
    return item ? item[prop] : null
}

function numeroATexto(num) {
    const unidades = ["", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
    const decenas = ["", "DIEZ", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
    const especiales = ["DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISEIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE"];
    const centenas = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"];

    function convertir(n) {
        if (n < 10) return unidades[n];
        if (n < 20) return especiales[n - 10];
        if (n < 100) return decenas[Math.floor(n / 10)] + (n % 10 === 0 ? "" : " Y " + unidades[n % 10]);
        if (n < 1000) return (n === 100 ? "CIEN" : centenas[Math.floor(n / 100)]) + (n % 100 === 0 ? "" : " " + convertir(n % 100));
        if (n < 1000000) return (n < 2000 ? "MIL" : convertir(Math.floor(n / 1000)) + " MIL") + (n % 1000 === 0 ? "" : " " + convertir(n % 1000));
        if (n < 1000000000) return convertir(Math.floor(n / 1000000)) + " MILLONES" + (n % 1000000 === 0 ? "" : " " + convertir(n % 1000000));
        return "";
    }

    const parteEntera = Math.floor(num);
    const parteDecimal = Math.round((num - parteEntera) * 100);

    const textoEntero = convertir(parteEntera);
    const textoDecimal = parteDecimal < 10 ? "0" + parteDecimal : parteDecimal;

    return `${textoEntero} CON ${textoDecimal}/100`;
}

function openOptionsCase(itemid, this1) {
    const rect = document.getElementById(`button-options-${itemid}`).getBoundingClientRect()

    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight

    this1.$nextTick(() => {
        const el = this1.$refs.optionsCase.$el

        setTimeout(() => {
            const rect2 = el.getBoundingClientRect()

            if (screenWidth < (rect.left + rect2.width)) {
                el.style.right = `${(screenWidth - rect.right) + window.scrollX}px`
            }
            else {
                el.style.left = `${rect.left + window.scrollX}px`
            }

            if (screenHeight < (rect.bottom + rect2.height)) {
                el.style.bottom = `${(screenHeight - rect.top) + window.scrollY + 5}px`
            }
            else {
                el.style.top = `${rect.bottom + window.scrollY + 5}px`
            }
        }, 0)
    })
}

async function tryOficialExcel(element, file, reader, headers) {
    element.value = null

    if (file.size > 5000000) return { code: 1, msg: 'Archivo muy pesado' }

    const workbook = new ExcelJS.Workbook()
    const uint8Array = new Uint8Array(reader.result)
    await workbook.xlsx.load(uint8Array)
    const worksheet = workbook.getWorksheet(1)
    const firstRow = worksheet.getRow(1)

    const headers1 = []
    for (let i = 1; i <= worksheet.lastColumn.number; i++) {
        const cell = firstRow.getCell(i)
        headers1.push(cell ? cell.value : null)
    }
    // console.log(headers)
    // console.log(headers1)
    if (JSON.stringify(headers) !== JSON.stringify(headers1)) return { code: 2, msg: 'El archivo no es el formato oficial' }

    const jsonData = []
    worksheet.eachRow(row => {
        const rowData = []
        for (let i = 1; i <= worksheet.lastColumn.number; i++) {
            const cell = row.getCell(i)
            rowData.push(cell.value != null ? cell.value : '')
        }
        jsonData.push(rowData)
    })
    jsonData.shift()

    const jsonObject = jsonData.reduce((acc, curr) => {
        const obj = {}
        headers1.forEach((header, index) => {
            obj[header] = curr[index]
        })
        acc.push(obj)
        return acc
    }, [])

    return { code: 0, data: jsonObject }
}

async function downloadExcel(columns, datos = [], nombre = `${Date.now()}.xlsx`) {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Hoja1')

    // Agrega las columnas a la hoja de cálculo
    const headerRow = columns.map(a => a.title)
    worksheet.addRow(headerRow)

    // Agrega los datos a la hoja de cálculo
    datos.forEach((dato) => {
        const row = []

        columns.forEach((column) => {
            if (column.prop) {
                row.push(getNestedProp(dato, column.prop))
            } else {
                row.push(dato[column.id])
            }
        })

        worksheet.addRow(row)
    })

    // Configura la hoja de cálculo para que se descargue automáticamente
    const excelBuffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, nombre)
}

// function selectRow(item, many = true) {
//     if (many == false) {
//         console.log(1)
//     }

//     item.selected = !item.selected
// }

function obtenerNumeroJuliano(fecha = new Date()) {
    // Convert string date to Date object if needed
    if (typeof fecha === 'string') {
        fecha = new Date(fecha + ' 01:00:00')
    }

    // Validate if fecha is a valid Date
    // if (!(fecha instanceof Date) || isNaN(fecha)) {
    //     throw new Error('Invalid date format')
    // }

    const inicioAnio = new Date(fecha.getFullYear(), 0, 0)
    const diferencia = fecha - inicioAnio
    const unDia = 1000 * 60 * 60 * 24
    const diaDelAnio = Math.floor(diferencia / unDia)

    const anio = fecha.getFullYear().toString().slice(-2)

    return `${anio}-${diaDelAnio.toString().padStart(3, '0')}`
}

function getNestedProp(obj, prop) {
    const result = prop
        .split('.')
        .reduce((acc, part) => acc?.[part], obj)

    return result === undefined || result === null ? '' : result
}

// function runMethod() {

// }

export {
    playAudio,
    deepCopy,
    generarId,
    genId,
    incompleteData,
    redondear,
    loadFiles,
    getItemFromArray,
    numeroATexto,
    openOptionsCase,
    tryOficialExcel,
    // selectRow,
    obtenerNumeroJuliano,
    downloadExcel,
    // runMethod
}