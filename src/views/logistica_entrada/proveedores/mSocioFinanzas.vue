<template>
    <div class="finanzas">
        <div class="container-datos1">
            <JdSelect
                label="Lista de precios"
                v-model="socio.precio_lista"
                :lista="modal.precio_listas"
                :loaded="modal.precio_listasLoaded"
                @reload="loadPrecioLista()"
                :disabled="modal.mode == 3"
                style="grid-column: 1/4"
                v-if="this.socio.tipo == 1"
            />

            <!-- <JdInput label="Condición de pago" type="number" v-model="socio.pago_condicion" :disabled="modal.mode == 3"
                style="grid-column: 4/6;" /> -->

            <JdSelect
                label="Condición de pago"
                :nec="true"
                v-model="socio.pago_condicion"
                :lista="modal.pago_condiciones"
                :disabled="modal.mode == 3"
                style="grid-column: 1/4"
            />
        </div>

        <span>- - - Bancos - - -</span>
        <div class="bancos">
            <div class="container-datos">
                <JdInput
                    label="Banco"
                    :nec="true"
                    v-model="nuevo.nombre"
                    :disabled="modal.mode == 3"
                />

                <JdSelect
                    label="Moneda"
                    :nec="true"
                    v-model="nuevo.moneda"
                    :lista="modal.monedas"
                    :disabled="modal.mode == 3"
                />

                <JdInput label="NC" :nec="true" v-model="nuevo.nc" :disabled="modal.mode == 3" />

                <JdInput label="CCI" v-model="nuevo.cci" :disabled="modal.mode == 3" />

                <JdSwitch
                    label="Principal?"
                    v-model="nuevo.principal"
                    :disabled="modal.mode == 3"
                />

                <div class="botones" v-if="modal.mode != 3">
                    <JdButton text="Agregar" tipo="3" @click="agregar()" v-if="!this.nuevo.id" />
                    <JdButton text="Nuevo" tipo="3" @click="setNuevo()" v-if="this.nuevo.id" />
                    <JdButton text="Eliminar" tipo="3" @click="eliminar()" v-if="this.nuevo.id" />
                    <JdButton text="Modificar" tipo="3" @click="modificar()" v-if="this.nuevo.id" />
                </div>
            </div>

            <JdTable
                :columns="columns"
                :datos="socio.bancos || []"
                height="13rem"
                :seeker="false"
                :rowSelectable="true"
                :download="false"
                :rsUno="true"
                @rowSelected="setExistente"
            >
                <template v-slot:cNombre="{ item }">
                    <i class="fa-regular fa-star" v-if="item.principal"></i>
                    {{ item.nombre }}
                </template>
            </JdTable>
        </div>
    </div>
</template>

<script>
import JdInput from '@/components/inputs/JdInput.vue'
import JdSelect from '@/components/inputs/JdSelect.vue'
import JdSwitch from '@/components/inputs/JdSwitch.vue'
import JdTable from '@/components/JdTable.vue'
import JdButton from '@/components/inputs/JdButton.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get } from '@/utils/crud'
import { genId, incompleteData } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdInput,
        JdSelect,
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
            {
                id: 'nombre',
                title: 'Nombre',
                slot: 'cNombre',
                width: '15rem',
                show: true,
                sort: true,
            },
        ],
    }),
    created() {
        this.modal = this.useModals.mSocio
        this.socio = this.useModals.mSocio.item

        if (this.modal.precio_listasLoaded) return
        if (this.socio.tipo == 1) {
            if (this.modal.mode != 3) {
                this.loadPrecioLista()
            }
        }
    },
    methods: {
        async loadPrecioLista() {
            const qry = {
                fltr: { activo: { op: 'Es', val: true } },
            }

            this.useAuth.setLoading(true, 'Cargando...')
            this.modal.precio_listasLoaded = false
            const res = await get(`${urls.precio_listas}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)
            this.modal.precio_listasLoaded = true

            if (res.code !== 0) return

            this.modal.precio_listas = res.data
        },

        setNuevo() {
            this.nuevo = { principal: false }

            for (const a of this.socio.bancos) a.selected = false
        },
        setExistente(item) {
            if (item.selected == false) {
                this.nuevo = {}
            } else {
                this.nuevo = { ...item }
            }
        },
        checkDatos() {
            const props = ['nombre', 'moneda', 'nc']

            if (incompleteData(this.nuevo, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            const i = this.socio.bancos.findIndex(
                (a) => a.nombre == this.nuevo.nombre && a.id != this.nuevo.id,
            )
            if (i !== -1) {
                jmsg('error', 'El nombre del banco ya existe')
                return true
            }

            if (this.nuevo.principal == true) {
                const j = this.socio.bancos.some(
                    (a) => a.principal == true && a.id != this.nuevo.id,
                )
                if (j == true) {
                    jmsg('error', 'Ya existe un banco principal')
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

            if (this.socio.bancos.length == 0) this.nuevo.principal = true

            this.socio.bancos.push({
                id: genId(),
                ...this.nuevo,
            })

            this.setNuevo()
        },
        eliminar() {
            const i = this.socio.bancos.findIndex((a) => a.id == this.nuevo.id)
            this.socio.bancos.splice(i, 1)

            this.setNuevo()
        },
        modificar() {
            if (this.checkDatos()) return
            this.shapeDatos()

            const i = this.socio.bancos.findIndex((a) => a.id == this.nuevo.id)
            this.socio.bancos.splice(i, 1, this.nuevo)

            this.setNuevo()
        },
    },
}
</script>

<style lang="scss" scoped>
.container-datos1 {
    display: grid;
    grid-template-columns: repeat(5, 7.4rem);
    gap: 0.5rem;
    height: fit-content;
    margin-bottom: 1.5rem;
}

.bancos {
    display: flex;
    gap: 2rem;
    margin-top: 0.5rem;

    .container-datos {
        display: grid;
        grid-template-columns: 20rem;
        gap: 0.5rem;
        height: fit-content;
    }
}
</style>
