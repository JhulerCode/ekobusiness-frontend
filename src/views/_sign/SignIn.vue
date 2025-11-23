<template>
    <main class="signin">
        <SignInAnimation />

        <div class="center">
            <SignInLeft />
            <SignInRight />
        </div>
    </main>
</template>

<script>
import SignInAnimation from './SignInAnimation.vue'
import SignInLeft from './SignInLeft.vue'
import SignInRight from './SignInRight.vue'

import { useAuth } from '@/pinia/auth'

export default {
    components: {
        SignInAnimation,
        SignInLeft,
        SignInRight,
    },
    data: () => ({
        useAuth: useAuth(),
    }),
    created() {
        if (this.useAuth.isDarkMode) {
            document.body.classList.add('dark-mode')
        }
    },
}
</script>

<style lang="scss" scoped>
.signin {
    height: 100dvh;
    width: 100vw;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--bg-color2);
}

.center {
    position: absolute;
    display: flex;
    border-radius: 1.5rem;
    box-shadow: 0 0 1rem var(--shadow-color);
    max-width: 90%;
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
}

@media (max-width: 900px) {
    .left {
        display: none !important;
    }

    .right {
        border-radius: 2rem;
    }
}
</style>
