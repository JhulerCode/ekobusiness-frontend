<template>
    <div class="spin-load" :class="{ lleno: rellenar, 'back-with-color': shadowBack }"
        :style="{'border-radius':`${borderRadius}rem`}">

        <div class="container" :style="{ transform: `scale(${scale})`}">
            <div class="spinner"></div>
        </div>

        <div class="text" v-if="text!=''">{{ text }}</div>
    </div>
</template>

<script>
export default {
    props: {
        text: { type: String, default: '' },
        rellenar: { type: Boolean, default: true },
        shadowBack: { type: Boolean, default: true },
        scale: { type: [String, Number], default: 1 },
        borderRadius: { type: [String, Number], default: '0' },
    }
}
</script>

<style lang="scss" scoped>
.spin-load {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.lleno {
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
}

.back-with-color {
    background-color: rgba($color: #000000, $alpha: 0.5);
}

.text{
    margin-top: 1rem;
}

.spinner {
    border: 0.3rem solid #f3f3f3;
    // border-top: 0.3rem solid red;
    border-top: 0.3rem solid rgb(196, 196, 196);
    border-radius: 50%;
    width: 1.5rem;
    height: 1.5rem;
    animation: spin 0.5s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>