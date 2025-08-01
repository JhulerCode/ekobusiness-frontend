import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { jmsg } from '@/utils/swal'

const host = import.meta.env.VITE_API_HOST

const urls = {
    signin: `${host}/signin`,

    sistema: `${host}/api/sistema`,

    activity_logs: `${host}/api/activity_logs`,
    articulo_categorias: `${host}/api/articulo_categorias`,
    articulos: `${host}/api/articulos`,
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
    tipo_cambios: `${host}/api/tipo_cambios`,
    transacciones: `${host}/api/transacciones`,
}

async function get(url) {
    let query

    try {
        query = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${useAuth().token}`,
            },
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

    if (query.status == 404) {
        jmsg('error', 'Recurso no encontrado')
        return { code: 404 }
    }

    const res = await query.json()

    if (res.code == -1) jmsg('error', 'Algo salió mal')

    if (res.code > 0) jmsg('error', res.msg)

    return res
}

function setFormData(item) {
    const formData = new FormData();

    for (const key in item) {
        const value = item[key];

        formData.append(key, value);
    }

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

async function getFile(url) {
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${useAuth().token}`,
        }
    })

    if (!response.ok) {
        jmsg('error', 'Archivo no encontrado')
        return
    }

    const blob = await response.blob()
    const newuri = window.URL.createObjectURL(blob)

    window.open(newuri, '_blank')
}

export {
    host,
    urls,
    get,
    post,
    patch,
    delet,
    getFile,
}
