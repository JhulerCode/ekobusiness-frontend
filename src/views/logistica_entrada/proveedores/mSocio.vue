<template>
    <JdModal modal="mSocio" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <JdSelect
                label="Tipo doc"
                :nec="true"
                v-model="socio.doc_tipo"
                :lista="modal.documentos_identidad || []"
                mostrar="nombre"
                :disabled="modal.mode == 3"
                style="grid-column: 1/3"
            />

            <JdInput
                label="Nro documento"
                :nec="true"
                v-model="socio.doc_numero"
                :disabled="modal.mode == 3"
                style="grid-column: 3/5"
            />

            <JdInput
                label="Razón social o nombre"
                :nec="true"
                v-model="socio.nombres"
                :disabled="modal.mode == 3"
                style="grid-column: 1/5"
            />

            <JdInput
                label="E-mail"
                v-model="socio.correo"
                :disabled="modal.mode == 3"
                style="grid-column: 1/3"
            />

            <JdInput
                label="Teléfono"
                v-model="socio.telefono1"
                :disabled="modal.mode == 3"
                style="grid-column: 1/3"
            />

            <JdSwitch label="Activo?" v-model="socio.activo" :disabled="modal.mode == 3" />
        </div>

        <div class="extra-datos">
            <ul class="pestanas">
                <li @click="pestana = 1" :class="{ 'pestana-activo': pestana == 1 }">
                    Direcciones
                </li>
                <li @click="pestana = 2" :class="{ 'pestana-activo': pestana == 2 }">Contactos</li>
                <li @click="pestana = 3" :class="{ 'pestana-activo': pestana == 3 }">Finanzas</li>
                <li @click="pestana = 4" :class="{ 'pestana-activo': pestana == 4 }">Documentos</li>
            </ul>

            <div class="pestana-body">
                <mSocioDirecciones v-if="pestana == 1" />
                <mSocioContactos v-if="pestana == 2" />
                <mSocioFinanzas v-if="pestana == 3" />
                <mSocioDocumentos v-if="pestana == 4" />
            </div>
        </div>
    </JdModal>
</template>

<script>
import { JdModal, JdInput, JdSelect, JdSwitch } from '@jhuler/components'

import mSocioDirecciones from './mSocioDirecciones.vue'
import mSocioContactos from './mSocioContactos.vue'
import mSocioFinanzas from './mSocioFinanzas.vue'
import mSocioDocumentos from './mSocioDocumentos.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, post, patch } from '@/utils/crud'
import { incompleteData } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdSelect,
        JdInput,
        JdSwitch,
        mSocioDirecciones,
        mSocioContactos,
        mSocioFinanzas,
        mSocioDocumentos,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},
        socio: {},
        pestana: 1,

        buttons: [
            { text: 'Grabar', action: 'crear', spin: false },
            { text: 'Actualizar', action: 'modificar', spin: false },
        ],
    }),
    created() {
        this.modal = this.useModals.mSocio
        this.socio = this.useModals.mSocio.item

        this.showButtons()
        this.loadDatosSistema()
        // if (this.modal.mode != 3) this.loadMonedas()
        this.loadMonedas()
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
            const props = ['tipo', 'doc_tipo', 'doc_numero', 'nombres']

            if (incompleteData(this.socio, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            // if (this.socio.direcciones.length == 0) {
            //     jmsg('warning', 'Agregue al menos una dirección')
            //     return true
            // }

            // if (this.socio.tipo == 1) {
            //     if (this.socio.doc_tipo == 6) {
            //         if (this.socio.contactos.length == 0) {
            //             jmsg('warning', 'Agregue al menos un contacto')
            //             return true
            //         }
            //     }
            // }

            return false
        },
        shapeDatos() {
            for (const a of this.socio.direcciones) a.selected = false
            for (const a of this.socio.contactos) a.selected = false
            for (const a of this.socio.bancos) a.selected = false
            for (const a of this.socio.documentos) a.selected = false
        },
        async crear() {
            if (this.checkDatos()) return
            this.shapeDatos()

            this.useAuth.setLoading(true, 'Grabando...')
            const res = await post(urls.socios, this.socio)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const vista = this.socio.tipo == 1 ? 'vProveedores' : 'vClientes'
            this.useVistas.addItem(vista, 'socios', res.data)
            this.useModals.show.mSocio = false
        },
        async modificar() {
            if (this.checkDatos()) return
            this.shapeDatos()

            this.useAuth.setLoading(true, 'Actualizando...')
            const res = await patch(urls.socios, this.socio)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const vista = this.socio.tipo == 1 ? 'vProveedores' : 'vClientes'
            this.useVistas.updateItem(vista, 'socios', res.data)
            this.useModals.show.mSocio = false
        },

        async loadDatosSistema() {
            const qry = ['documentos_identidad', 'pago_condiciones']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.modal, res.data)
        },
        async loadMonedas() {
            const qry = {
                fltr: {},
                cols: ['id', 'nombre', 'simbolo', 'estandar'],
                ordr: [
                    ['estandar', 'DESC'],
                    ['nombre', 'ASC'],
                ],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            this.modal.monedasLoaded = false
            const res = await get(`${urls.monedas}?qry=${JSON.stringify(qry)}`)
            this.modal.monedasLoaded = true
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.monedas = res.data
        },
    },
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: repeat(4, 10rem);
    gap: 0.5rem;
}

.extra-datos {
    border: var(--border);
    margin-top: 2rem;

    .pestanas {
        display: flex;
        background-color: var(--bg-color2);

        li {
            padding: 0.3rem 0.5rem;
            cursor: pointer;
        }

        .pestana-activo {
            background-color: var(--bg-color);
        }
    }

    .pestana-body {
        padding: 1rem;
    }
}

@media (max-width: 540px) {
    .container-datos {
        grid-template-columns: minmax(100%, 33.5rem) !important;

        > * {
            grid-column: 1/2 !important;
        }
    }
}
</style>
