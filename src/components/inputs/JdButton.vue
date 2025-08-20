<template>
    <div class="jd-button" :title="title" :class="`${small ? 'small' : 'normal'}`">
        <LoadingSpin :borderRadius="small ? 0.3 : 0.4" :scale="small ? 0.7 : 1" v-if="spin" />

        <div ref="btn" class="btn" :class="`btn${tipo}`">
            <!--:style="{ backgroundColor: `var(--${backColor})` }"
             @mouseenter="handleMouseEnter()"
            @mouseleave="handeMouseLeave()" -->

            <i v-if="icon" :class="icon"></i>
            <!-- :style="{ color: `var(--${color})` }" -->
            <span :class="{ 'hide-text': spin }" v-if="text">
                {{ text }}
            </span>
        </div>
    </div>
</template>

<script>
import LoadingSpin from '@/components/LoadingSpin.vue'

export default {
    components: {
        LoadingSpin
    },
    props: {
        // backColor: { type: String, default: 'bg-color2' },
        // color: { type: String, default: 'text-color' },
        icon: String,
        text: String,
        spin: { type: Boolean, default: false },
        disabled: { type: Boolean, default: false },
        title: String,
        small: { type: Boolean, default: false },
        tipo: { type: [String, Number], default: 1 },
    },
    data: () => ({
        originalColor: '',
    }),
    mounted() {
        // this.$refs.btn.style.backgroundColor = `var(--${this.backColor})`
    },
    methods: {
        // handleMouseEnter() {
        //     this.originalColor = window.getComputedStyle(this.$refs.btn).backgroundColor
        //     this.$refs.btn.style.backgroundColor = this.darkenColor(this.originalColor)
        // },
        // handeMouseLeave() {
        //     this.$refs.btn.style.backgroundColor = this.originalColor
        // },
        // darkenColor(color) {
        //     const rgb = color.match(/\d+/g);

        //     if (rgb) {
        //         let r = parseInt(rgb[0]) * 0.90; // Reducir brillo en un 10%
        //         let g = parseInt(rgb[1]) * 0.90;
        //         let b = parseInt(rgb[2]) * 0.90;

        //         // Asegurar que no sea menor que 0 y convertir a entero
        //         r = Math.max(0, Math.floor(r));
        //         g = Math.max(0, Math.floor(g));
        //         b = Math.max(0, Math.floor(b));

        //         return `rgb(${r}, ${g}, ${b})`;
        //     }

        //     return color;
        // }
    },
}
</script>

<style lang="scss" scoped>
.jd-button {
    overflow: hidden;
    width: fit-content;
    position: relative;

    .btn {
        cursor: pointer;
        user-select: none;

        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.3rem;
        height: 100%;
        width: 100%;

        .hide-text {
            opacity: 0.2;
        }
    }

    .btn1 {
        border: solid 1px var(--primary-color);
        background-color: var(--primary-color);

        *{
            color: white;
        }

        &:hover {
            background-color: var(--primary-color-dark);
        }
    }

    .btn2 {
        background-color: var(--bg-color);
        border: solid 1px var(--primary-color);

        *{
            color: var(--primary-color);
        }

        &:hover {
            background-color: var(--bg-color-hover);
        }
    }

    .btn3 {
        background-color: var(--bg-color);
        border: solid 1px var(--bg-color);
        padding: calc(0.5rem - 2px) 0.6rem !important;

        *{
            color: var(--primary-color);
        }

        &:hover {
            border-bottom: solid 1px var(--primary-color);
        }
    }
}

.normal {
    .btn {
        padding: 0.5rem 0.9rem;
        border-radius: 0.3rem;

        * {
            font-size: 0.85rem;
        }
    }

    // .spinner {
    //     border-radius: 0.3rem;
    // }
}

.small {
    .btn {
        padding: calc(0.3rem - 2px) 0.35rem !important;
        border-radius: 0.3rem;

        * {
            font-size: 0.8rem !important;
        }
    }
}
</style>