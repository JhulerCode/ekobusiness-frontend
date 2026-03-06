<template>
    <section class="main-center">
        <router-view />
    </section>
</template>

<script>
export default {}
</script>

<style lang="scss">
.main-center {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: hidden;

    .vista {
        background-color: var(--bg-color);
        padding: 2rem 2rem;

        > .head {
            margin-bottom: 1rem;
            display: flex;
            justify-content: space-between;
            // align-items: center;
            gap: 1rem;
            flex-wrap: wrap;
            border-bottom: var(--border);
            padding-bottom: 1rem;

            strong {
                font-size: 1.4rem;
            }

            .buttons {
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
            }
        }
    }

    .vista-fill {
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .tablero {
        height: 100%;
        overflow-y: auto;
        // padding: 0 1rem;

        .head {
            display: flex;
            justify-content: space-between;
            gap: 1rem;
            flex-wrap: wrap;
            top: 0;
            background-color: var(--bg-color2);
            padding: 1rem 0;

            strong {
                font-size: 1.4rem;
            }

            .buttons {
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
            }
        }

        .card {
            padding: 1rem;
            background-color: var(--bg-color);
            border-radius: 1rem;
            box-shadow: 0 0 0.5rem var(--shadow-color);
            overflow: hidden;
        }

        .card-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1.5rem;
        }

        .monto-resumen {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            // text-align: center;

            p {
                color: var(--text-color2);
            }

            span {
                font-size: 1.5rem;
            }
        }

        .cols2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            margin-bottom: 2rem;
        }
    }
}
</style>
