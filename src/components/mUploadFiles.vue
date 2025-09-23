<template>
    <JdModal modal="mUploadFiles">
        <div class="buttons">
            <input
                type="file"
                hidden
                ref="inputFile"
                :multiple="(modal.cantidad || 1) > 1"
                :accept="modal.accept"
                @change="onFileChange"
            />

            <JdButton text="Explorar" tipo="2" @click="$refs.inputFile.click()" />

            <JdButton
                text="Actualizar"
                backColor="primary-color"
                color="text-color3"
                @click="actualizar()"
            />
        </div>

        <ul class="container-files">
            <li
                v-for="(a, i) in files"
                :key="i"
                class="container-file"
                draggable="true"
                @dragstart="onDragStart(i)"
                @dragover.prevent
                @drop="onDrop(i)"
            >
                <template v-if="a.id == null">
                    <div class="container-foto">
                        <img :src="a.blob" />
                    </div>
                </template>

                <template v-else>
                    <div class="container-foto">
                        <img :src="`${host}/uploads/${a.id}`" />
                    </div>
                </template>

                <div class="file-name">
                    <small>{{ a.orden }} {{ a.name }}</small>
                </div>

                <div class="act-delete">
                    <i class="fa-solid fa-xmark" @click="eliminar(a, i)"></i>
                </div>
            </li>
        </ul>
    </JdModal>
</template>

<script>
import { JdModal, JdButton } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { host, patch } from '@/utils/crud'

export default {
    components: {
        JdModal,
        JdButton,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        modal: {},
        files: [],
        eliminados: [],
        host,
    }),
    created() {
        this.modal = this.useModals.mUploadFiles
        this.files = JSON.parse(JSON.stringify(this.modal.item.archivos))
    },
    methods: {
        async onFileChange(e) {
            const files = e.target.files

            if (files.length > 0) {
                for (const a of files) {
                    this.files.push({
                        file: a,
                        orden: this.files.length + 1,
                        name: a.name,
                        blob: URL.createObjectURL(a),
                    })
                }
            }
        },
        async actualizar() {
            const send = {
                id: this.modal.item.id,
                formData: true,
                archivos: this.files.filter((a) => a.id == null).map((a) => a.file),
                eliminados: this.eliminados,
                vigentes: this.files.map((a) => ({
                    id: a.id,
                    orden: a.orden,
                    name: a.name,
                })),
            }

            this.useAuth.setLoading(true, 'Subiendo...')
            const res = await patch(this.modal.url, send)
            this.useAuth.setLoading(false)

            if (res.code !== 0) return

            if (this.modal.prop) {
                const tabla = this.useVistas[this.modal.vista][this.modal.tabla]
                const i = tabla.findIndex((a) => a.id == this.modal.item.id)
                tabla[i][this.modal.prop] = res.data
            }

            this.useModals.show.mUploadFiles = false
        },
        async eliminar(a, i) {
            if (a.id == null) {
                this.files.splice(i, 1)
            } else {
                this.eliminados.push(a)
                this.files.splice(i, 1)
            }

            this.files.forEach((file, idx) => {
                file.orden = idx + 1
            })
        },
        onDragStart(index) {
            this.dragIndex = index
        },
        onDrop(index) {
            if (this.dragIndex === null) return

            // Sacamos el elemento arrastrado
            const movedItem = this.files.splice(this.dragIndex, 1)[0]

            // Lo insertamos en la nueva posición
            this.files.splice(index, 0, movedItem)

            // Reasignamos orden
            this.files.forEach((f, idx) => {
                f.orden = idx + 1
            })

            // Reset drag
            this.dragIndex = null
        },
    },
}
</script>

<style lang="scss" scoped>
.buttons {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.container-files {
    max-height: 70dvh;
    height: fit-content;
    overflow-y: auto;
    overflow-x: hidden;
    display: grid;
    grid-template-columns: repeat(4, 10rem);
    gap: 0.5rem;
}

.container-file {
    background-color: var(--bg-color2);
    border-radius: 0.5rem;
    padding: 0.5rem;
    position: relative;

    .container-foto {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 8rem;

        img {
            max-width: 100%;
            max-height: 100%;
        }
    }

    .act-delete {
        position: absolute;
        top: 0.3rem;
        right: 0.3rem;
        background-color: var(--bg-color);
        border-radius: 50%;
        box-shadow: 0 0 0.5rem var(--shadow-color);
        opacity: 0;
        cursor: pointer;
    }

    &:hover {
        .act-delete {
            opacity: 1;
        }
    }
}

@media (max-width: 540px) {
    .container-files {
        grid-template-columns: repeat(2, 10rem);
    }
}
</style>
