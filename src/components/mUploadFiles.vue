<template>
    <JdModal modal="mUploadFiles">
        <div class="buttons">
            <JdButton text="Explorar" @click="$refs.inputFile.click()" />

            <JdButton text="Eliminar" icon="fa-solid fa-trash-can" @click="eliminar()"
                v-if="modal.item.foto && files.length == 0" />

            <JdButton text="Actualizar" backColor="primary-color" color="text-color3" @click="actualizar()" />
            <!-- v-if="files.length > 0" -->
        </div>

        <!-- <div class="container-foto" v-if="files.length == 0">
            <img
                src="https://img.freepik.com/vector-premium/vector-icono-imagen-predeterminado-pagina-imagen-faltante-diseno-sitio-web-o-aplicacion-movil-no-hay-foto-disponible_87543-11093.jpg">
        </div> -->

        <ul class="files" v-if="files.length > 0">
            <li v-for="(a, i) in files" :key="i" class="container-foto">
                <template>
                    <img :src="a.uri">
                </template>

                <template v-if="modal.accept = 'application/pdf'">
                    {{ a.name }}
                </template>
            </li>
        </ul>

        {{ this.modal.formData }}

        <input type="file" hidden ref="inputFile" :multiple="modal.varios > 1" :accept="modal.accept"
            @change="onFileChange">
    </JdModal>
</template>

<script>
import JdModal from '@/components/JdModal.vue'
import JdButton from '@/components/inputs/JdButton.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'

// import { loadFiles, genId } from '@/utils/mine'
// import { jmsg } from '@/utils/swal'
import { host, urls, delet } from '@/utils/crud'

export default {
    components: {
        JdModal,
        JdButton,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),

        modal: {},
        files: [],
        host,
    }),
    created() {
        this.modal = this.useModals.mUploadFiles
    },
    methods: {
        // async onFileChange(event) {
        //     this.files.length = 0

        //     const asd = event.target.files

        //     let maximo = true

        //     if (this.files.length == 0) {
        //         if (asd.length && asd.length > this.modal.varios) maximo = false
        //     }
        //     else {
        //         const falta = this.modal.varios - this.files.length
        //         if (asd.length && asd.length > falta) maximo = false
        //     }

        //     if (maximo == false) {
        //         return jmsg('warning', `Puedes subir ${this.modal.varios} modal.files como máximo`)
        //     }

        // const archivos = await loadFiles(event)

        // for (const a of archivos) {
        //     const id = genId(this.files)
        //     this.files.push({ ...a, id })
        // }
        // },
        async onFileChange(event) {
            this.modal.formData = new FormData()
            Array.from(event.target.files).forEach((archivo) => {
                this.modal.formData.append('archivos', archivo);
            });

            console.log(this.modal.formData)
        },

        async actualizar() {
            const uri = `${urls[this.modal.item.url]}/upload/${this.modal.item.id}`

            const res = await fetch(uri, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${useAuth().token}`,
                },
                body: this.modal.formData,
            });

            console.log(res)
        },
        // async actualizar() {
        //     const uri = urls[this.modal.item.url] + this.modal.item.route
        // const send = {
        //     id: this.modal.item.id,
        //     files: this.files
        // }

        // this.useAuth.setLoading(true, 'Subiendo...')
        // const res = await patch(uri, send)
        // this.useAuth.setLoading(false)

        // if (res.code !== 0) return

        // this.$emit('uploaded', { id: send.id, documento: res.fileName })
        // this.useModals.show.mUploadFiles = false
        // },
        async eliminar() {
            const uri = urls[this.modal.item.url] + this.modal.item.route
            const send = {
                id: this.modal.item.id,
                foto: this.modal.item.foto
            }

            this.useAuth.setLoading(true, 'Eliminando...')
            const response = await delet(uri, send)
            this.useAuth.setLoading(false)

            if (response.code !== 0) return

            this.$emit('deleted', { id: send.id })
            this.useModals.show.mUploadFiles = false
        },
    }
}
</script>

<style lang="scss" scoped>
.buttons {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.container-foto {
    width: 33.5rem;

    img {
        width: 100%;
    }
}

@media (max-width: 540px) {
    .container-foto {
        width: 100% !important;
    }
}
</style>
