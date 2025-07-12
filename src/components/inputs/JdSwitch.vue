<template>
    <div class="container-input">
        <div class="switch" @click="toogle()" :class="{ 'on': inputModel, 'off': !inputModel, 'no-action': disabled }">
            <span>{{ inputModel ? 'Sí' : 'No' }}</span>
            <div class="slider"></div>
        </div>

        <span v-if="label">{{ label }}</span>
    </div>
</template>

<script>
export default {
    props: {
        modelValue: Boolean,

        label: String,
        disabled: { type: Boolean, default: false },
    },
    computed: {
        inputModel: {
            get() {
                return this.modelValue
            },
            set(newValue) {
                this.$emit('update:modelValue', newValue)
            },
        },
    },
    methods: {
        toogle() {
            if (this.disabled) return

            this.inputModel = !this.inputModel

            this.$emit('change', this.inputModel)
        },
    }
}
</script>

<style lang="scss" scoped>

.container-input {
    display: flex;
    align-items: center;
    justify-content: left;
    gap: 0.5rem;
    
    .no-action {
        background-color: var(--bg-color2) !important;
        border: var(--border);
        cursor: not-allowed !important;
   
        
        * {
            cursor: not-allowed !important;
        }

        .slider{
        }

        span{
            color: initial !important;
        }
    }

    .switch {
        position: relative;
        width: 2.5rem;
        height: 1.5rem;
        cursor: pointer;
        background-color: var(--bg-color2);
        border-radius: 1rem;
        transition: .3s;

        .slider {
            position: absolute;
            cursor: pointer;
            background-color: var(--bg-color);
            transition: .3s;
            border-radius: 50%;
            height: 1rem;
            width: 1rem;
            top: 50%;
            left: 0.25rem;
        }

        span{
            position: absolute;
            top: 50%;
            left: 0.25rem;
            font-size: 0.6rem;
            transition: .3s;
        }
    }

    .off {
        background-color: var(--bg-color2);

        .slider {
            transform: translate(0, -50%);
        }

        span {
            transform: translate(1.25rem, -50%);
        }
    }

    .on {
        background-color: var(--primary-color);

        .slider {
            transform: translate(1rem, -50%);
        }

        span {
            transform: translate(0, -50%);
            color: var(--bg-color);
        }
    }

    span {
        font-size: 0.9rem;
    }
}
</style>