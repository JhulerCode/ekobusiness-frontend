import { defineStore } from 'pinia'
import { urls, get, post, patch } from '@/utils/crud.js'
import { deepCopy } from '@/utils/mine'
import { useVistas } from '@/pinia/vistas.js'
import { useModals } from '@/pinia/modals.js'
import menuConfig from '@/config/menu.js'

export const useAuth = defineStore('auth', {
    state: () => ({
        token: null,
        usuario: {},
        app_version: '1.9.1',

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
            this.permisos = []
            this.usuario = {}
            this.tables = {}
            this.avances = {}
        },

        // ----- LOGIN ----- //
        async login() {
            if (this.token == null) return false

            this.setLoading(true, 'Cargando cuenta...')
            const result = await get(`${urls.colaboradores}/login`)
            this.setLoading(false)

            if (result.code != 0) return false

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
        },
        async logout(vueRouter) {
            this.setLoading(true, 'Cerrando sesion...')
            const result = await post(
                `${urls.signin}/logout`,
                { id: this.usuario.colaborador },
                false,
            )
            this.setLoading(false)

            if (result.code != 0) return

            if (vueRouter) vueRouter.replace({ name: 'SignIn' })

            this.initVars()
            useVistas().initVars()
            useModals().initVars()
        },
        verifyPermiso(...permisos) {
            // return this.usuario?.permisos?.includes(permiso)
            return permisos.some((p) => this.usuario?.permisos?.includes(p))
        },

        // ----- TABLES ----- //
        updateQuery(columns, qry) {
            columns
                .filter((a) => a.op)
                .forEach((b) => {
                    qry.fltr[b.id] = { op: b.op, val: b.val, val1: b.val1 }
                })

            qry.cols = columns.filter((a) => a.show).map((b) => b.id)
        },
        async saveTableColumns(tableName, columns) {
            if (!tableName) return

            this.tables[tableName] = columns.map((col) => {
                return {
                    id: col.id,
                    width: col.width,
                    show: col.show,
                    seek: col.seek,
                    sort: col.sort,
                    op: col.op,
                    val: col.val,
                    val1: col.val1,
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
            // ----- RECUPERA LAS COLUMNAS GUARDADAS ----- //
            if (this.tables[tableName]) {
                for (const a of columns) {
                    Object.assign(
                        a,
                        this.tables[tableName].find((b) => b.id === a.id),
                    )
                }
            }
        },
        setInicialTables(tables) {
            this.tables = tables
        },

        // ----- AVANCES ----- //
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

        // ----- PREFERENCIAS ----- //
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
    },
    persist: {
        storage: localStorage,
        paths: ['token', 'isDarkMode', 'tables'],
    },
})
