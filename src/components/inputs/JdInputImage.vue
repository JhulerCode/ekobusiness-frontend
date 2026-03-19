<template>
    <div class="jd-input-image" :class="{ disabled }" :style="{ height }">
        <div class="image-box">
            <template v-if="previewUrl">
                <img :src="previewUrl" alt="Preview" class="preview-img" />
            </template>

            <img src="@/assets/img/image-placeholder.png" v-else />

            <div class="overlay" v-if="!disabled">
                <button class="btn-change" @click.stop="triggerClick">
                    <i class="fa-solid fa-pencil"></i>
                </button>

                <button class="btn-delete" @click.stop="deleteFile" v-if="previewUrl">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>

        <input
            type="file"
            accept="image/*"
            hidden
            ref="inputFile"
            @change="handleFile"
            :disabled="disabled"
        />
    </div>
</template>

<script>
export default {
    name: 'JdInputImage',
    props: {
        modelValue: { type: [String, Object, null] },
        disabled: { type: Boolean, default: false },
        height: { type: String, default: '8rem' },
    },
    emits: ['update:modelValue', 'handleFile', 'deleteFile'],
    data() {
        return {
            localBlob: null,
            localFile: null,
        }
    },
    computed: {
        previewUrl() {
            // 1. Mostrar el archivo local recién seleccionado si hay.
            if (this.localBlob) return this.localBlob

            // 2. O mostrar la imagen que viene de base de datos.
            if (typeof this.modelValue === 'string' && this.modelValue) return this.modelValue
            if (this.modelValue && this.modelValue.url) return this.modelValue.url

            return null
        },
    },
    methods: {
        triggerClick() {
            if (this.disabled) return
            this.$refs.inputFile.value = null
            this.$refs.inputFile.click()
        },
        handleFile(e) {
            const file = e.target.files[0]
            if (file) {
                this.localFile = file
                this.localBlob = URL.createObjectURL(file)
                this.$emit('update:modelValue', file.name)
                this.$emit('handleFile', file, this.localBlob)
            }
        },
        deleteFile() {
            this.localFile = null
            this.localBlob = null
            this.$emit('update:modelValue', null)
            this.$emit('deleteFile')
        },
    },
}
</script>

<style lang="scss" scoped>
.jd-input-image {
    border: var(--border);
    border-radius: 0.5rem;
    overflow: hidden;

    .image-box {
        position: relative;
        height: 100%;
        width: 100%;
        padding: 0.3rem;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--bg-color);
        transition: all 0.2s ease;

        &:hover {
            .overlay {
                opacity: 1;
            }
        }

        img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }

        .overlay {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            opacity: 0;
            transition: opacity 0.2s ease;

            button {
                padding: 0.3rem 0.5rem;
                border: none;
                border-radius: 0.25rem;
                cursor: pointer;
                font-weight: 500;
                font-size: 0.85rem;
                background-color: white;
                color: black;
            }
        }
    }
}
</style>
