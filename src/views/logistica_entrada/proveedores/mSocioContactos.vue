<template>
    <div class="contactos">
        <div class="container-datos">
            <JdInput label="Nombre" :nec="true" v-model="nuevo.nombre" :disabled="modal.mode == 3" />

            <JdInput label="Cargo" :nec="true" v-model="nuevo.cargo" :disabled="modal.mode == 3" />

            <JdInput label="Celular" type="tel" :nec="true" v-model="nuevo.telefono" :disabled="modal.mode == 3" />

            <JdInput label="Correo" type="email" v-model="nuevo.correo" :disabled="modal.mode == 3" />

            <JdSwitch label="Principal?" v-model="nuevo.principal" :disabled="modal.mode == 3" />

            <div class="botones" v-if="modal.mode != 3">
                <JdButton text="Agregar" tipo="3" @click="agregar()" v-if="!this.nuevo.id" />
                <JdButton text="Nuevo" tipo="3" @click="setNuevo()" v-if="this.nuevo.id" />
                <JdButton text="Eliminar" tipo="3" @click="eliminar()" v-if="this.nuevo.id" />
                <JdButton text="Modificar" tipo="3" @click="modificar()" v-if="this.nuevo.id" />
            </div>
        </div>

        <JdTable :columns="columns" :datos="socio.contactos || []" height="15rem" :seeker="false" :rowSelectable="true"
            :download="false" :rsUno="true" @rowSelected="setExistente">

            <template v-slot:cNombre="{ item }">
                <i class="fa-regular fa-star" v-if="item.principal"></i>
                {{ item.nombre }}
            </template>
        </JdTable>
    </div>
</template>

<script>
import JdInput from '@/components/inputs/JdInput.vue'
import JdSwitch from '@/components/inputs/JdSwitch.vue'
import JdTable from '@/components/JdTable.vue'
import JdButton from '@/components/inputs/JdButton.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { genId, incompleteData } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdInput,
        JdSwitch,
        JdTable,
        JdButton,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},
        socio: {},
        nuevo: { principal: false },

        columns: [
            { id: 'nombre', title: 'Nombre', slot: 'cNombre', width: '15rem', show: true, sort: true },
        ],
    }),
    created() {
        this.modal = this.useModals.mSocio
        this.socio = this.useModals.mSocio.item
    },
    methods: {
        setNuevo() {
            this.nuevo = { principal: false }

            for (const a of this.socio.contactos) a.selected = false
        },
        setExistente(item) {
            if (item.selected == false) {
                this.nuevo = {}
            }
            else {
                this.nuevo = { ...item }
            }
        },
        checkDatos() {
            const props = ['nombre', 'cargo', 'telefono']

            if (incompleteData(this.nuevo, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            const i = this.socio.contactos.findIndex(a => a.nombre == this.nuevo.nombre && a.id != this.nuevo.id)
            if (i !== -1) {
                jmsg('error', 'El nombre de contacto ya existe')
                return true
            }

            if (this.nuevo.principal == true) {
                const j = this.socio.contactos.some(a => a.principal == true && a.id != this.nuevo.id)
                if (j == true) {
                    jmsg('error', 'Ya existe un contacto principal')
                    return true
                }
            }

            return false
        },
        shapeDatos() {
            this.nuevo.selected = false
        },
        agregar() {
            if (this.checkDatos()) return
            this.shapeDatos()

            if (this.socio.contactos.length == 0) this.nuevo.principal = true

            this.socio.contactos.push({
                id: genId(),
                ...this.nuevo
            })

            this.setNuevo()
        },
        eliminar() {
            const i = this.socio.contactos.findIndex(a => a.id == this.nuevo.id)
            this.socio.contactos.splice(i, 1)

            this.setNuevo()
        },
        modificar() {
            if (this.checkDatos()) return
            this.shapeDatos()

            const i = this.socio.contactos.findIndex(a => a.id == this.nuevo.id)
            this.socio.contactos.splice(i, 1, this.nuevo)

            this.setNuevo()
        }
    }
}
</script>

<style lang="scss" scoped>
.contactos {
    display: flex;
    gap: 2rem;

    .container-datos {
        display: grid;
        grid-template-columns: 20rem;
        gap: 0.5rem;
        height: fit-content;
    }
}
</style>