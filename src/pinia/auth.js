import { defineStore } from 'pinia'
import { urls, get, post, patch } from '@/utils/crud.js'
import { deepCopy } from '@/utils/mine'
import { useVistas } from '@/pinia/vistas.js'
import { useModals } from '@/pinia/modals.js'
import menuConfig from '@/config/menuUser.js'
import menuAdmin from '@/config/menuAdmin.js'

export const useAuth = defineStore('auth', {
    state: () => ({
        token: null,
        refreshPromise: null,
        usuario: {},
        empresa: {},
        empresa_publica: null,
        app_version: '2.0.3',

        menu: menuConfig,

        showNavbar: true,
        loading: { show: false, text: '' },

        isDarkMode: null,
        tables: {},
        avances: {},
    }),
    actions: {
        initVars() {
            this.token = null
            this.usuario = {}
            this.empresa = {}
            this.tables = {}
            this.avances = {}
        },
        clearAuth() {
            this.initVars()
            useVistas().initVars()
            useModals().initVars()
        },

        //--- LOGIN ----- //
        async fetchInfoEmpresaPublica() {
            this.setLoading(true, 'Cargando información...')
            const res = await get(`${urls.public}/info-empresa`)
            this.setLoading(false)

            if (res.code == 0) {
                this.empresa_publica = res.data
            }
        },

        async refreshAccessToken() {
            if (this.refreshPromise) return this.refreshPromise

            this.refreshPromise = (async () => {
                try {
                    const response = await fetch(`${urls.signin}/refresh`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'x-app-version': this.app_version,
                            'x-empresa': this.empresa.subdominio,
                        },
                    })
                    const res = await response.json()

                    if (res.code === 0) {
                        this.token = res.token
                        return true
                    }
                } catch (error) {
                    console.error('Error refreshing token', error)
                } finally {
                    this.refreshPromise = null
                }
                this.clearAuth()
                return false
            })()

            return this.refreshPromise
        },

        async login() {
            if (this.token == null) return false

            this.setLoading(true, 'Cargando cuenta...')
            const result = await get(`${urls.colaboradores}/login`)
            this.setLoading(false)

            if (result.code != 0) {
                this.clearAuth()
                return false
            }

            this.setSessionDatos(result)

            return true
        },
        setSessionDatos(result) {
            this.usuario = deepCopy(result.data)
            this.permisos = this.usuario.permisos

            this.setTheme(this.usuario.theme)
            this.setPrimaryColor(this.usuario.color)
            this.setInicialTables(this.usuario.tables)
            this.setInicialAvances(this.usuario.avances)
            // Formato de fecha
            this.showNavbar = this.usuario.menu_visible

            if (result.empresa) {
                this.empresa = deepCopy(result.empresa)

                // Cargar menú administrativo si el subdominio es 'admin'
                if (this.empresa.subdominio === 'admin') {
                    this.menu = menuAdmin
                } else {
                    // Filtrar menú según módulos contratados
                    if (this.empresa.modulos && this.empresa.modulos.length > 0) {
                        this.menu = menuConfig.filter(
                            (m) => !m.id || this.empresa.modulos.includes(m.id),
                        )
                    } else {
                        this.menu = menuConfig
                    }
                }
            }
        },
        async logout(vueRouter) {
            this.setLoading(true, 'Cerrando sesion...')
            await post(`${urls.signin}/logout`, { id: this.usuario.colaborador }, false)
            this.setLoading(false)

            this.clearAuth()
            if (vueRouter) vueRouter.replace({ name: 'SignIn' })
        },
        verifyPermiso(...permisos) {
            return permisos.flat().some((p) => this.usuario?.permisos?.includes(p))
        },

        //--- TABLES ----- //
        updateQuery(columns, qry) {
            columns
                .filter((a) => a.op)
                .forEach((b) => {
                    // Si es una búsqueda de texto (Contiene) y tiene prop (relación), usamos el prop
                    const field = b.op === 'Contiene' && b.prop ? b.prop : b.id
                    qry.fltr[field] = { op: b.op, val: b.val, val1: b.val1 }
                })

            qry.cols = columns.filter((a) => a.show).map((b) => b.id)
        },
        applyListingRestriction(viewName, qry) {
            // Si el usuario tiene el permiso de listar global, no aplicamos restricciones
            if (this.verifyPermiso(`${viewName}:listar`)) return

            // Buscamos permisos con el patrón "vista:listar:columna"
            // Por ejemplo: "vProduccionOrdenes:listar:responsable"
            const prefix = `${viewName}:listar:`
            const restrictedPermiso = this.usuario?.permisos?.find((p) => p.startsWith(prefix))

            if (restrictedPermiso) {
                const column = restrictedPermiso.split(':').pop()
                if (column) {
                    qry.fltr[column] = { op: 'Es', val: this.usuario.colaborador }
                }
            }
        },
        async saveTableColumns(tableName, columns) {
            if (!tableName) return

            this.tables[tableName] = columns.map((col) => {
                return {
                    id: col.id,
                    width: col.width,
                    show: col.show,
                    op: col.op,
                    val: col.val,
                    val1: col.val1,
                    valLabel: col.valLabel,
                    orden: col.orden,
                    sortDirection: col.sortDirection,
                }
            })

            const send = {
                id: this.usuario.colaborador,
                tables: this.tables,
            }

            this.setLoading(true, 'Cargando...')
            const res = await patch(`${urls.colaboradores}/tables`, send, false)
            this.setLoading(false)

            if (res.code != 0) return
        },
        setColumns(tableName, columns) {
            //--- RECUPERA LAS COLUMNAS GUARDADAS ----- //
            if (this.tables[tableName]) {
                for (const a of columns) {
                    const saved = this.tables[tableName].find((b) => b.id === a.id)
                    if (saved) {
                        Object.assign(a, {
                            width: saved.width,
                            show: saved.show,
                            op: saved.op,
                            val: saved.val,
                            val1: saved.val1,
                            valLabel: saved.valLabel,
                            orden: saved.orden,
                            sortDirection: saved.sortDirection,
                        })
                    }
                }
                columns.sort((a, b) => (a.orden || 0) - (b.orden || 0))
            }
        },
        setInicialTables(tables) {
            this.tables = tables
        },

        //--- AVANCES ----- //
        async saveAvances(card, data) {
            this.avances[card] = data

            const send = {
                id: this.usuario.colaborador,
                avances: this.avances,
            }

            this.setLoading(true, 'Cargando...')
            const res = await patch(`${urls.colaboradores}/avances`, send, false)
            this.setLoading(false)

            if (res.code != 0) return
        },
        setInicialAvances(avances) {
            this.avances = avances
        },

        //--- PREFERENCIAS ----- //
        setTheme(theme) {
            if (!theme) return

            this.usuario.theme = theme
            this.isDarkMode = theme == '2'

            if (theme == '1') {
                document.body.classList.remove('dark-mode')
            } else {
                document.body.classList.add('dark-mode')
            }
        },
        setPrimaryColor(color) {
            if (!color) return

            this.usuario.color = color
            document.documentElement.style.setProperty('--primary-color', color)
            document.documentElement.style.setProperty(
                '--primary-color-dark',
                this.obscurecerColor(color),
            )
        },
        obscurecerColor(color, porcentaje = 10) {
            const r = parseInt(color.substring(1, 3), 16)
            const g = parseInt(color.substring(3, 5), 16)
            const b = parseInt(color.substring(5, 7), 16)

            const rObscurecido = Math.max(0, Math.floor(r - (r * porcentaje) / 100))
            const gObscurecido = Math.max(0, Math.floor(g - (g * porcentaje) / 100))
            const bObscurecido = Math.max(0, Math.floor(b - (b * porcentaje) / 100))

            return `#${rObscurecido.toString(16).padStart(2, '0')}${gObscurecido.toString(16).padStart(2, '0')}${bObscurecido.toString(16).padStart(2, '0')}`
        },

        setLoading(show, text) {
            if (text === undefined) text = ''

            this.loading = { show, text }
        },
        goBack(router) {
            if (window.history.state && window.history.state.back) {
                router.back()
            } else {
                router.push({ name: this.usuario.vista_inicial })
            }
        },
    },
    persist: {
        storage: localStorage,
        paths: ['token', 'isDarkMode', 'tables'],
    },
})
