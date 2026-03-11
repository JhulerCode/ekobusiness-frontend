<template>
    <JdModal modal="mColaborador" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-todo">
            <div class="container-datos">
                <JdSelect
                    label="Tipo documento"
                    :nec="true"
                    v-model="modal.colaborador.doc_tipo"
                    :lista="modal.documentos_identidad || []"
                    :disabled="modal.mode == 3"
                />

                <JdInput
                    label="Nro documento"
                    :nec="true"
                    v-model="modal.colaborador.doc_numero"
                    :disabled="modal.mode == 3"
                />

                <JdInput
                    label="Nombres y apellidos"
                    :nec="true"
                    v-model="modal.colaborador.nombres"
                    :disabled="modal.mode == 3"
                />

                <JdInput
                    label="Fecha de nacimiento"
                    type="date"
                    v-model="modal.colaborador.fecha_nacimiento"
                    :disabled="modal.mode == 3"
                />
                <JdSelect
                    label="Sexo"
                    v-model="modal.colaborador.sexo"
                    :lista="modal.generos || []"
                    :disabled="modal.mode == 3"
                />

                <JdInput
                    label="Dirección"
                    v-model="modal.colaborador.direccion"
                    :disabled="modal.mode == 3"
                />
                <JdInput
                    label="Teléfono"
                    v-model="modal.colaborador.telefono"
                    :disabled="modal.mode == 3"
                />

                <JdInput
                    label="Cargo"
                    :nec="true"
                    v-model="modal.colaborador.cargo"
                    :disabled="modal.mode == 3"
                />

                <JdInput
                    label="Producción código"
                    v-model="modal.colaborador.produccion_codigo"
                    :disabled="modal.mode == 3"
                />

                <JdSwitch label="Activo" v-model="modal.colaborador.activo" :disabled="modal.mode == 3" />

                <JdSwitch
                    label="Tiene usuario?"
                    v-model="modal.colaborador.has_signin"
                    :disabled="modal.mode == 3"
                />
            </div>

            <div class="right" v-if="modal.colaborador.has_signin">
                <div class="container-accesos">
                    <JdSelect
                        label="Vista inicial"
                        :nec="true"
                        v-model="modal.colaborador.vista_inicial"
                        :lista="vistas"
                        mostrar="label"
                        :disabled="modal.mode == 3"
                        groupBy="menu"
                    />

                    <JdInput
                        label="Usuario"
                        :nec="true"
                        v-model="modal.colaborador.usuario"
                        :disabled="modal.mode == 3"
                    />

                    <div>
                        <JdInput
                            label="Contraseña"
                            v-model="modal.colaborador.contrasena"
                            :disabled="modal.mode == 3"
                        />
                        <small class="fa-solid fa-triangle-exclamation"></small>
                        <small> No modificar este campo si no desea actualizar la contraseña</small>
                    </div>
                </div>

                <div class="grupos" v-if="modal.colaborador.has_signin">
                    <div class="mrg-btm05">
                        <strong>--- Permisos ---</strong>
                    </div>

                    <div v-for="a in auth.menu || []" :key="a.id">
                        <div class="grupo-header" @click="toggleGrupo(a.id)">
                            {{ a.label }}

                            <span class="icono-expand">
                                <i
                                    class="fa-solid fa-caret-down"
                                    v-if="modal.grupoExpandido === a.id"
                                ></i>
                                <i class="fa-solid fa-caret-right" v-else></i>
                            </span>
                        </div>

                        <div v-if="a.children && modal.grupoExpandido === a.id">
                            <div v-for="b in a.children" :key="b.id" class="vistas">
                                <div class="vista-header" @click="toggleVista(b.goto)">
                                    {{ b.label }}

                                    <span class="icono-expand">
                                        <i
                                            class="fa-solid fa-caret-down"
                                            v-if="modal.vistaExpandida === b.goto"
                                        ></i>
                                        <i class="fa-solid fa-caret-right" v-else></i>
                                    </span>
                                </div>

                                <div
                                    class="permisos"
                                    v-if="b.permisos && modal.vistaExpandida === b.goto"
                                >
                                    <div class="permisos-acciones">
                                        <JdButton
                                            text="Sel. todo"
                                            tipo="3"
                                            @click="selectAll(b.goto)"
                                        />
                                        <JdButton
                                            text="Sel. ninguno"
                                            tipo="3"
                                            @click="selectNone(b.goto)"
                                        />
                                    </div>

                                    <JdCheckBox
                                        :label="c.label"
                                        v-model="c.val"
                                        v-for="c in b.permisos"
                                        :key="c.id"
                                        class="mrg-btm05"
                                        :disabled="modal.mode == 3"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </JdModal>
</template>

<script>
import { JdModal, JdInput, JdSelect, JdCheckBox, JdSwitch, JdButton } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, post, patch } from '@/utils/crud'
import { incompleteData } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdInput,
        JdSwitch,
        JdSelect,
        JdCheckBox,
        JdButton,
    },
    computed: {
        auth: () => useAuth(),
        modals: () => useModals(),
        storeVistas: () => useVistas(),
        vistas() {
            return this.auth.menu
                .map((a) => a.children.map((b) => ({ id: b.goto, label: b.label, menu: a.label })))
                .flat()
        },
    },
    data: () => ({
        modal: {},

        buttons: [
            { text: 'Grabar', action: 'crear', permiso: 'vColaboradores:crear' },
            {
                text: 'Actualizar',
                action: 'modificar',
                permiso: 'vColaboradores:editar',
            },
        ],
    }),
    created() {
        this.modal = this.modals.mColaborador

        this.showButtons()
        this.loadDatosSistema()
        this.sincronizarChecksConPermisos()
    },
    methods: {
        showButtons() {
            if (this.modal.mode == 1) {
                this.buttons[0].show = true
            } else if (this.modal.mode == 2) {
                this.buttons[1].show = true
            }
        },

        checkDatos() {
            const props = ['nombres', 'doc_tipo', 'doc_numero', 'cargo', 'activo', 'has_signin']

            if (this.modal.colaborador.has_signin) props.push('vista_inicial', 'usuario', 'contrasena')

            if (incompleteData(this.modal.colaborador, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        shapeDatos() {
            this.modal.colaborador.permisos = this.recolectarPermisosSeleccionados()
        },
        async crear() {
            if (this.checkDatos()) return
            this.shapeDatos()

            this.auth.setLoading(true, 'Creando...')
            const res = await post(urls.colaboradores, this.modal.colaborador)
            this.auth.setLoading(false)

            if (res.code != 0) return

            this.storeVistas.addItem('vColaboradores', 'tableData', res.data)

            this.modals.show.mColaborador = false
        },
        async modificar() {
            if (this.checkDatos()) return
            this.shapeDatos()

            this.auth.setLoading(true, 'Actualizando...')
            const res = await patch(urls.colaboradores, this.modal.colaborador)
            this.auth.setLoading(false)

            if (res.code != 0) return

            this.storeVistas.updateItem('vColaboradores', 'tableData', res.data)

            if (this.auth.usuario.id == this.modal.colaborador.id) {
                this.auth.usuario.permisos = this.modal.colaborador.permisos
            }
            this.modals.show.mColaborador = false
        },

        async loadDatosSistema() {
            const qry = ['generos', 'documentos_identidad']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.modal, res.data)
        },

        sincronizarChecksConPermisos() {
            const permisos = this.modal.colaborador.permisos || []

            for (const a of this.auth.menu) {
                if (a.children) {
                    for (const b of a.children) {
                        if (b.permisos) {
                            for (const c of b.permisos) {
                                c.val = permisos.includes(c.id)
                            }
                        }
                    }
                }
            }
        },
        recolectarPermisosSeleccionados() {
            const permisos = []

            for (const a of this.auth.menu) {
                if (a.children) {
                    for (const b of a.children) {
                        if (b.permisos) {
                            for (const c of b.permisos) {
                                if (c.val) permisos.push(c.id)
                            }
                        }
                    }
                }
            }
            return permisos
        },
        toggleGrupo(id) {
            this.modal.grupoExpandido = this.modal.grupoExpandido === id ? null : id
        },
        toggleVista(id) {
            this.modal.vistaExpandida = this.modal.vistaExpandida === id ? null : id
        },

        selectAll(id) {
            for (const a of this.auth.menu) {
                if (a.children) {
                    for (const b of a.children) {
                        if (b.goto == id) {
                            for (const c of b.permisos) {
                                c.val = true
                            }
                        }
                    }
                }
            }
        },
        selectNone(id) {
            for (const a of this.auth.menu) {
                if (a.children) {
                    for (const b of a.children) {
                        if (b.goto == id) {
                            for (const c of b.permisos) {
                                c.val = false
                            }
                        }
                    }
                }
            }
        },
    },
}
</script>

<style lang="scss" scoped>
.container-todo {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem 2rem;
}

.container-datos {
    display: grid;
    grid-template-columns: 30rem;
    gap: 0.5rem;
    height: fit-content;
}

.right {
    .container-accesos {
        display: grid;
        grid-template-columns: 20rem;
        gap: 0.5rem;
        margin-bottom: 2rem;
    }

    .grupos {
        .grupo-header {
            cursor: pointer;
            background: var(--bg-color2);
            padding: 0.5rem 1rem;
            border-radius: 0.3rem;
            margin-bottom: 0.2rem;
            user-select: none;

            .icono-expand {
                float: right;
            }
        }

        .vistas {
            margin-left: 1rem;
            margin-right: 1rem;

            .vista-header {
                cursor: pointer;
                border-bottom: var(--border);
                padding: 0.3rem 0.3rem;
                margin-bottom: 0.2rem;
                user-select: none;

                .icono-expand {
                    float: right;
                }
            }

            .permisos {
                margin-left: 1rem;

                .permisos-acciones {
                    display: flex;
                    margin-bottom: 0.25rem;
                }
            }
        }
    }
}
</style>
