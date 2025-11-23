<template>
    <ul class="pestanas">
        <!-- <li class="pestana" @click="useVistas.showVista('vHome')" :class="{ activo: useVistas.show.vHome }">
            <span>Inicio</span>
        </li> -->

        <li v-for="(a, i) in useVistas.pestanas" :key="i" :draggable="a.ever != true" @dragover.prevent
            @dragenter="dragEnter(i)" @drop="drop(i)" @dragstart="dragStart(i, $event)" @dragend="dragEnd" class="pestana"
            :class="{ 'dragging-over': a.isDraggingOver, activo: useVistas.show[a.goto] }"
            @click="useVistas.showVista(a.goto, a.label)">

            <span>{{ a.label }}</span>

            <div class="close-pestana" v-if="a.ever != true" @click.stop="useVistas.closePestana(a.goto)">
                <i class="fa-solid fa-xmark"></i>
            </div>
        </li>
    </ul>
</template>

<script>
import { useVistas } from '@/pinia/vistas.js'

export default {
    data: () => ({
        isDragging: false,
        draggedIndex: null,

        useVistas: useVistas(),
    }),
    methods: {
        dragStart(index, event) {
            this.isDragging = true
            this.draggedIndex = index
            event.dataTransfer.effectAllowed = 'move'
        },
        dragEnd() {
            for (const a of this.useVistas.pestanas) a.isDraggingOver = false
            this.isDragging = false
        },
        dragEnter(index) {
            for (let i = 0; i < this.useVistas.pestanas.length; i++) {
                this.useVistas.pestanas[i].isDraggingOver = i == index ? true : false
            }
        },
        drop(targetIndex) {
            if (this.draggedIndex !== null) {
                const draggedColumn = this.useVistas.pestanas.splice(this.draggedIndex, 1)[0]
                this.useVistas.pestanas.splice(targetIndex, 0, draggedColumn)
                this.draggedIndex = null
            }
        },
    },
}
</script>

<style lang="scss" scoped>
.pestanas {
    display: flex;
    flex-wrap: wrap;
    gap: 0.2rem;

    .pestana {
        padding: 0.5rem;
        display: flex;
        gap: 0.5rem;
        align-items: center;
        border-radius: 0.3rem 0.3rem 0 0;
        border: solid 1px whitesmoke;
        cursor: pointer;

        span {
            font-size: 0.9rem;
            white-space: nowrap;
            overflow-x: auto;
        }

        .close-pestana {
            border: var(--border);
            height: 1.2rem;
            width: 1.2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 0.3rem;

            i {
                font-size: 0.8rem;
            }

            &:hover {
                background-color: var(--bg-color2);
            }
        }
    }

    .activo {
        background-color: var(--bg-color);
        border-bottom: solid 1px white !important;
    }

    .dragging-over {
        background-color: yellow;
    }

    // .active-class-exact {
    //     background-color: var(--bg-color);
    // }
}
</style>