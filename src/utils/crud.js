import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { jmsg } from '@/utils/swal'

const host = import.meta.env.VITE_API_HOST

const urls = {
    signin: `${host}/signin`,
    uploads: `${host}/uploads`,

    sistema: `${host}/api/sistema`,

    activity_logs: `${host}/api/activity_logs`,
    articulo_lineas: `${host}/api/articulo_lineas`,
    articulo_categorias: `${host}/api/articulo_categorias`,
    articulos: `${host}/api/articulos`,
    asistencias: `${host}/api/asistencias`,
    caja_aperturas: `${host}/api/caja_aperturas`,
    caja_movimientos: `${host}/api/caja_movimientos`,
    colaboradores: `${host}/api/colaboradores`,
    cuarentena_productos: `${host}/api/cuarentena_productos`,
    documentos: `${host}/api/documentos`,
    formatos: `${host}/api/formatos`,
    formato_values: `${host}/api/formato_values`,
    inspecciones: `${host}/api/inspecciones`,
    kardex: `${host}/api/kardex`,
    maquinas: `${host}/api/maquinas`,
    monedas: `${host}/api/monedas`,
    precio_listas: `${host}/api/precio_listas`,
    precio_lista_items: `${host}/api/precio_lista_items`,
    produccion_ordenes: `${host}/api/produccion_ordenes`,
    receta_insumos: `${host}/api/receta_insumos`,
    sessions: `${host}/api/sessions`,
    socios: `${host}/api/socios`,
    socio_pedidos: `${host}/api/socio_pedidos`,
    socio_pedido_items: `${host}/api/socio_pedido_items`,
    tipo_cambios: `${host}/api/tipo_cambios`,
    transacciones: `${host}/api/transacciones`,
}

async function get(url) {
    let response

    try {
        response = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${useAuth().token}`,
            },
        })
    } catch (error) {
        jmsg('error', error)
        return { code: -2 }
    }

    if (response.status == 401) {
        jmsg('error', 'Acceso denegado: autenticación incorrecta')
        useModals().setModal('mLogin', 'Sesión terminada', null, null)
        return { code: 401 }
    }

    if (response.status == 403) {
        jmsg('error', 'Acceso denegado: permisos insuficientes')
        return { code: 403 }
    }

    if (response.status == 404) {
        jmsg('error', 'Recurso no encontrado')
        return { code: 404 }
    }

    const contentType = response.headers.get("Content-Type")
    if (contentType && contentType.includes("application/json")) {
        const data = await response.json()

        if (data.code == -1) jmsg('error', 'Algo salió mal')

        if (data.code > 0) jmsg('error', data.msg)

        return data
    }
    else {
        const blob = await response.blob()
        return blob
        // const fileName = response.headers
        //     .get("Content-Disposition")
        //     ?.split("filename=")[1]
        //     ?.replace(/"/g, "")
        // saveAs(blob, fileName)
    }
}

function setFormData(item) {
    const formData = new FormData()

    const { archivo, archivos, ...resto } = item

    // Si hay un solo archivo (propiedad archivo)
    if (archivo) {
        formData.append('archivo', archivo)
    }

    // Si hay múltiples archivos (propiedad archivos como array)
    if (archivos && Array.isArray(archivos)) {
        archivos.forEach((file) => {
            formData.append('archivos', file) // backend recibirá como array
        })
    }

    // Agregar el resto de datos como JSON
    formData.append("datos", JSON.stringify(resto))

    return formData
}

function setHeaders(item) {
    const headers = {
        Authorization: `Bearer ${useAuth().token}`,
    }

    if (!item.formData) {
        headers['Content-Type'] = 'application/json'
    }

    return headers
}

async function post(url, item, ms) {
    let query

    try {
        query = await fetch(url, {
            method: 'POST',
            headers: setHeaders(item),
            body: item.formData ? setFormData(item) : JSON.stringify(item),
        })
    } catch (error) {
        jmsg('error', error)
        return { code: -2 }
    }

    if (query.status == 401) {
        jmsg('error', 'Acceso denegado: autenticación incorrecta')
        useModals().setModal('mLogin', 'Sesión terminada', null, null)
        return { code: 401 }
    }

    if (query.status == 403) {
        jmsg('error', 'Acceso denegado: permisos insuficientes')
        return { code: 403 }
    }

    const res = await query.json()

    if (res.code == -1) jmsg('error', 'Algo salió mal')

    if (res.code > 0) jmsg('error', res.msg)

    if (res.code == 0) {
        if (ms != false) {
            jmsg('success', ms == undefined ? 'Creado con éxito' : ms)
        }
    }

    return res
}

async function patch(url, item, ms) {
    let query

    try {
        query = await fetch(`${url}/${item.id}`, {
            method: 'PATCH',
            headers: setHeaders(item),
            body: item.formData ? setFormData(item) : JSON.stringify(item),
        })
    } catch (error) {
        jmsg('error', error)
        return { code: -2 }
    }

    if (query.status == 401) {
        jmsg('error', 'Acceso denegado: autenticación incorrecta')
        useModals().setModal('mLogin', 'Sesión terminada', null, null)
        return { code: 401 }
    }

    if (query.status == 403) {
        jmsg('error', 'Acceso denegado: permisos insuficientes')
        return { code: 403 }
    }

    const res = await query.json()

    if (res.code == -1) jmsg('error', 'Algo salió mal')

    if (res.code > 0) jmsg('error', res.msg)

    if (res.code == 0) {
        if (ms != false) {
            jmsg('success', ms == undefined ? 'Actualizado con éxito' : ms)
        }
    }

    return res
}

async function delet(url, item, ms) {
    let query

    try {
        query = await fetch(`${url}/${item.id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${useAuth().token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(item),
        })
    } catch (error) {
        jmsg('error', error)
        return { code: -2 }
    }

    if (query.status == 401) {
        jmsg('error', 'Acceso denegado: autenticación incorrecta')
        useModals().setModal('mLogin', 'Sesión terminada', null, null)
        return { code: 401 }
    }

    if (query.status == 403) {
        jmsg('error', 'Acceso denegado: permisos insuficientes')
        return { code: 403 }
    }

    const res = await query.json()

    if (res.code == -1) jmsg('error', 'Algo salió mal')

    if (res.code > 0) jmsg('error', res.msg)

    if (res.code == 0) {
        if (ms != false) {
            jmsg('success', ms == undefined ? 'Eliminado con éxito' : ms)
        }
    }

    return res
}

export {
    host,
    urls,
    get,
    post,
    patch,
    delet,
}