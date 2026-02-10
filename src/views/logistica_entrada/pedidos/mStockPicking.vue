<template>
    <JdModal modal="mStockPicking" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <div class="left">
                <JdSelect
                    :nec="true"
                    :label="modal.transaccion.tipo == 1 ? 'Proveedor' : 'Cliente'"
                    :lista="modal.socios || []"
                    mostrar="nombres_apellidos"
                    :loaded="modal.sociosLoaded"
                    @reload="loadSocios()"
                    v-model="modal.transaccion.socio"
                    :disabled="modal.transaccion.socio != null"
                    style="grid-column: 1/5"
                />

                <JdSelect
                    label="Nro pedido"
                    :nec="true"
                    v-model="modal.transaccion.socio_pedido"
                    :lista="modal.pedidos || []"
                    mostrar="codigo"
                    :disabled="true"
                    v-if="modal.transaccion.socio_pedido"
                    style="grid-column: 1/4"
                />
            </div>

            <div class="right">
                <JdInput
                    type="date"
                    label="Fecha"
                    :nec="true"
                    v-model="modal.transaccion.fecha"
                    @change="changeDate"
                    :disabled="modal.mode == 3"
                    style="grid-column: 1/4"
                />

                <JdInput
                    label="Guía de remisión"
                    :nec="true"
                    v-model="modal.transaccion.guia"
                    style="grid-column: 1/5"
                    :disabled="modal.mode == 3"
                />
            </div>
        </div>

        <div class="extra-datos">
            <ul class="pestanas">
                <li @click="pestana = 1" :class="{ 'pestana-activo': pestana == 1 }">Contenido</li>
            </ul>

            <div class="pestana-body">
                <mStockPickingLine v-if="pestana == 1" ref="mStockPickingLine" />
            </div>
        </div>

        <div class="botom">
            <div class="left">
                <JdTextArea
                    label="Observación"
                    v-model="modal.transaccion.observacion"
                    :disabled="modal.mode == 3"
                />

                <JdTextArea
                    label="Motivo de anulación"
                    v-model="modal.transaccion.anulado_motivo"
                    :disabled="true"
                    v-if="modal.transaccion.anulado_motivo"
                />

                <small>{{ modal.transaccion.id }}</small>
            </div>
        </div>
    </JdModal>
</template>

<script>
import { JdModal, JdInput, JdSelect, JdTextArea } from '@jhuler/components'

import mStockPickingLine from './mStockPickingLine.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, post } from '@/utils/crud'
import { getItemFromArray, redondear, incompleteData, obtenerNumeroJuliano } from '@/utils/mine'
import { jqst, jmsg } from '@/utils/swal'

import dayjs from 'dayjs'

export default {
    components: {
        JdModal,
        JdInput,
        JdSelect,
        JdTextArea,

        mStockPickingLine,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),
        getItemFromArray,
        redondear,

        modal: {},
        pestana: 1,

        buttons: [
            { text: 'Guardar avance', action: 'guardarAvance', tipo: '2' },
            { text: 'Nuevo', action: 'nuevo', tipo: '2' },
            { text: 'Grabar', action: 'grabar' },
            { text: 'Actualizar', action: 'modificar' },
        ],
    }),
    async created() {
        this.modal = this.useModals.mStockPicking

        this.showButtons()

        // this.loadDatosSistema()

        // if (this.modal.mode == 1) {
        //     if (this.modal.transaccion.tipo == 1 || this.modal.transaccion.tipo == 5) {
        //         if (this.modal.transaccion.socio_pedido) {
        //             setTimeout(() => {
        //                 this.$refs.mStockPickingLine.agregarPedidoItems(
        //                     this.modal.socio_pedido_items,
        //                 )
        //             }, 300)
        //         }

        //         this.loadSocios()
        //     }
        // }
    },
    methods: {
        showButtons() {
            if (this.modal.mode == 1) {
                this.buttons[0].show = true
                this.buttons[2].show = true
            } else if (this.modal.mode == 2) {
                this.buttons[3].show = true
            }

            if (this.useAuth.verifyPermiso('vCompras:crear', 'vVentas:crear')) {
                this.buttons[1].show = true
            }
        },

        // async loadSocios() {
        //     const qry = {
        //         fltr: {
        //             tipo: { op: 'Es', val: this.modal.transaccion.tipo == 1 ? 1 : 2 },
        //             activo: { op: 'Es', val: true },
        //         },
        //         cols: [
        //             'nombres',
        //             'apellidos',
        //             'nombres_apellidos',
        //             'contactos',
        //             'direcciones',
        //             'precio_lista',
        //         ],
        //         incl: ['precio_lista1'],
        //         ordr: [
        //             ['nombres', 'ASC'],
        //             ['apellidos', 'ASC'],
        //         ],
        //     }

        //     this.modal.socios = []
        //     this.modal.sociosLoaded = false
        //     this.useAuth.setLoading(true, 'Cargando...')
        //     const res = await get(`${urls.socios}?qry=${JSON.stringify(qry)}`)
        //     this.useAuth.setLoading(false)
        //     this.modal.sociosLoaded = true

        //     if (res.code !== 0) return

        //     this.modal.socios = res.data

        //     if (this.modal.transaccion.socio) {
        //         this.modal.socio = this.modal.socios.find(
        //             (a) => a.id == this.modal.transaccion.socio,
        //         )
        //     }
        // },
        // async loadDatosSistema() {
        //     const qry = ['transaccion_estados']

        //     this.useAuth.setLoading(true, 'Cargando...')
        //     this.modal.datosSistemaLoaded = false
        //     const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)
        //     this.useAuth.setLoading(false)
        //     this.modal.datosSistemaLoaded = true

        //     if (res.code != 0) return

        //     Object.assign(this.modal, res.data)
        // },

        initStockPicking() {
            this.modal.transaccion = {
                tipo: this.modal.transaccion.tipo,
                fecha: dayjs().format('YYYY-MM-DD'),
                socio_pedido: null,
                estado: 1,
                transaccion_items: [],
            }

            this.modal.mode = 1
            this.modal.socio = {}
            this.setTotalesCero()
        },
        async nuevo() {
            if (this.modal.mode == 3 || this.modal.transaccion.transaccion_items.length == 0) {
                this.initStockPicking()
            } else {
                const resQst = await jqst('¿Está seguro de generar un nuevo pedido?')
                if (resQst.isConfirmed) this.initStockPicking()
            }

            if (this.modal.mode != 1) this.loadSocios()
        },

        async changeDate() {
            for (const a of this.modal.transaccion.transaccion_items) {
                a.lote = this.setLote()
            }
        },
        setLote() {
            return `${obtenerNumeroJuliano(this.modal.transaccion.fecha)}-${Math.floor(Math.random() * 90 + 10)}`
        },

        checkDatos() {
            const props = ['tipo', 'fecha', 'socio', 'guia']

            if (incompleteData(this.modal.transaccion, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            if (this.modal.transaccion.transaccion_items.length == 0) {
                jmsg('warning', 'Agregue al menos un articulo')
                return true
            }

            for (const a of this.modal.transaccion.transaccion_items) {
                const props1 = ['articulo', 'cantidad']

                if (incompleteData(a, props1)) {
                    jmsg('warning', 'Ingrese los datos necesarios de los articulos')
                    return true
                }

                if (this.modal.transaccion.tipo == 'abastacer_maquila') {
                    if (!a.kardexes || a.kardexes.length == 0) {
                        jmsg('warning', `Agregue al menos un lote en ${a.articulo1.nombre}`)
                        return true
                    }

                    if (a.articulo1.type != 'combo') {
                        const kardexesTotal = a.kardexes.reduce(
                            (sum, a) => sum + (a.cantidad ?? 0),
                            0,
                        )

                        if (kardexesTotal != a.cantidad) {
                            jmsg('warning', `Cantidades diferentes en ${a.articulo1.nombre}`)
                            return true
                        }
                    } else {
                        const kardexesTotales = {}
                        for (const b of a.kardexes) {
                            if (!kardexesTotales[b.articulo]) {
                                kardexesTotales[b.articulo] = 0
                            }
                            kardexesTotales[b.articulo] += b.cantidad
                        }

                        for (const b of a.articulo1.combo_articulos) {
                            const cantidadComponente = b.cantidad * a.cantidad
                            if (cantidadComponente != kardexesTotales[b.articulo]) {
                                jmsg('warning', `Cantidades diferentes en ${b.articulo1.nombre}`)
                                return true
                            }
                        }
                    }
                }
            }

            return false
        },
        // async grabar1() {
        //     if (this.checkDatos()) return
        //     console.log(this.modal.transaccion)
        // },
        async grabar() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Grabando...')
            const res = await post(urls.transacciones, this.modal.transaccion)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            // const vista = this.modal.transaccion.tipo == 1 ? 'vCompras' : 'vVentas'
            // this.useVistas.addItem(vista, 'transacciones', res.data, 'first')
            this.useModals.show.mStockPicking = false
        },
        // async modificar() {
        //     if (this.checkDatos()) return
        //     this.shapeDatos()

        //     this.useAuth.setLoading(true, 'Modificando...')
        //     const res = await patch(urls.transacciones, this.modal.transaccion)
        //     this.useAuth.setLoading(false)

        //     if (res.code != 0) return

        //     const vista = this.modal.transaccion.tipo == 1 ? 'vCompras' : 'vVentas'
        //     this.useVistas.updateItem(vista, 'transacciones', res.data)
        //     this.useModals.show.mStockPicking = false
        // },
        async guardarAvance() {
            const resQst = await jqst('¿Está seguro de guardar y reemplazar el guardado anterior?')
            if (resQst.isConfirmed) {
                const card = this.modal.transaccion.tipo == 1 ? 'mCompra' : 'mVenta'
                this.useAuth.saveAvances(card, this.modal.transaccion)
                this.useModals.show.mStockPicking = false
            }
        },
    },
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2rem;
    gap: 2rem;

    .left {
        display: grid;
        grid-template-columns: repeat(4, 7rem);
        gap: 0.5rem;
        height: fit-content;
    }

    .right {
        display: grid;
        grid-template-columns: repeat(4, 5rem);
        gap: 0.5rem;
        height: fit-content;
    }
}

.extra-datos {
    border-top: var(--border);
    border-bottom: var(--border);

    .pestanas {
        display: flex;
        background-color: var(--bg-color2);

        li {
            padding: 0.3rem 0.5rem;
            font-size: 0.8rem;
            cursor: pointer;
        }

        .pestana-activo {
            background-color: var(--bg-color);
        }
    }

    .pestana-body {
        padding: 1rem 0;
        width: 60rem;
    }
}

.botom {
    display: flex;
    justify-content: space-between;
    margin-top: 2rem;
    gap: 2rem;

    .left {
        display: grid;
        grid-template-columns: 30rem;
        gap: 0.5rem;
        height: fit-content;
    }

    .totales {
        background-color: var(--bg-color2);
        padding: 1rem;
        border-radius: 0.5rem;
        display: grid;
        grid-template-columns: 10rem 10rem;
        gap: 0.5rem;
        align-items: center;
        height: fit-content;

        p {
            text-align: right;
        }

        .total {
            font-size: 1.4rem;
            text-align: right;
        }
    }
}
</style>
