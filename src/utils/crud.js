import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { jmsg } from '@/utils/swal'

const host = import.meta.env.VITE_API_HOST
const subdominio_prueba = 'app'

const urls = {
    signin: `${host}/api/auth`,

    sistema: `${host}/api/sistema`,
    empresas: `${host}/api/empresas`,

    activity_logs: `${host}/api/activity_logs`,
    articulo_lineas: `${host}/api/articulo_lineas`,
    articulo_categorias: `${host}/api/articulo_categorias`,
    articulos: `${host}/api/articulos`,
    asistencias: `${host}/api/asistencias`,
    caja_aperturas: `${host}/api/caja_aperturas`,
    caja_movimientos: `${host}/api/caja_movimientos`,
    colaboradores: `${host}/api/colaboradores`,
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
    transaccion_items: `${host}/api/transaccion_items`,
    ubigeos: `${host}/api/ubigeos`,
}

async function get(url) {
    let response

    try {
        response = await fetch(url, {
            method: 'GET',
            headers: setHeaders(),
        })
    } catch (error) {
        jmsg('error', error)
        return { code: -2 }
    }

    return await process(response, false)
}

async function post(url, item, ms) {
    let response

    try {
        response = await fetch(url, {
            method: 'POST',
            headers: setHeaders(item),
            body: setBody(item),
        })
    } catch (error) {
        jmsg('error', error)
        return { code: -2 }
    }

    if (ms !== false && ms == null) {
        ms = 'Creado con éxito'
    }

    return await process(response, ms)
}

async function patch(url, item, ms) {
    let response

    try {
        response = await fetch(`${url}/${item.id}`, {
            method: 'PATCH',
            headers: setHeaders(item),
            body: setBody(item),
        })
    } catch (error) {
        jmsg('error', error)
        return { code: -2 }
    }

    if (ms !== false && ms == null) {
        ms = 'Actualizado con éxito'
    }

    return await process(response, ms)
}

async function delet(url, item, ms) {
    let response

    try {
        response = await fetch(`${url}/${item.id}`, {
            method: 'DELETE',
            headers: setHeaders(item),
            body: setBody(item),
        })
    } catch (error) {
        jmsg('error', error)
        return { code: -2 }
    }

    if (ms !== false && ms == null) {
        ms = 'Eliminado con éxito'
    }

    return await process(response, ms)
}

function setHeaders(item) {
    const headers = {
        Authorization: `Bearer ${useAuth().token}`,
    }

    if (item && !item.formData) headers['Content-Type'] = 'application/json'

    headers['x-app-version'] = useAuth().app_version

    headers['x-empresa'] = getSubdominio()

    return headers
}

function setBody(item) {
    if (!item) return null
    if (!item.formData) return JSON.stringify(item)

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

async function process(response, ms) {
    const contentType = response.headers.get("Content-Type")

    if (contentType && contentType.includes("application/json")) {
        const res = await response.json()

        if ([401, 403, 404, 426].includes(response.status)) {
            jmsg('error', res.msg)

            if (response.status == 401) useModals().setModal('mLogin', 'Sesión terminada', null, null)

            return { code: response.status }
        }

        if (res.code == -1) jmsg('error', 'Algo salió mal')

        if (res.code > 0) jmsg('error', res.msg)

        if (res.code == 0 && ms != false) jmsg('success', ms)

        return res
    }
    else {
        const blob = await response.blob()
        return blob
    }
}

function getSubdominio() {
    const hostname = window.location.hostname

    const parts = hostname.split(".")

    if (parts.length > 2) return parts[0]

    return subdominio_prueba
}

export {
    host,
    urls,
    get,
    post,
    patch,
    delet,
}