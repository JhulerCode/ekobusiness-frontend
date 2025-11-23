<template>
    <div class="night-container">
        <canvas ref="canvas"></canvas>
    </div>
</template>

<script>
import { useAuth } from '@/pinia/auth'

export default {
    name: 'StarryLandscapeOption',

    data() {
        return {
            useAuth: useAuth(),

            ctx: null,
            w: 0,
            h: 0,
            stars: [],
            comets: [],
            lastCometTime: 0,
        }
    },

    mounted() {
        const canvas = this.$refs.canvas
        this.ctx = canvas.getContext('2d')

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            this.w = canvas.width
            this.h = canvas.height

            this.createStars()
        }

        resize()
        window.addEventListener('resize', resize)

        this.animate()
    },
    methods: {
        // -------------------------- STARS --------------------------
        createStars() {
            this.stars = []
            const count = 300

            for (let i = 0; i < count; i++) {
                this.stars.push({
                    x: Math.random() * this.w,
                    y: Math.random() * this.h * 0.7,
                    size: Math.random() * 2 + 0.3,
                    brightness: Math.random(),
                    speed: Math.random() * 0.002 + 0.001,
                })
            }
        },

        drawStars() {
            this.stars.forEach((s) => {
                s.brightness += s.speed
                const alpha = 0.5 + Math.sin(s.brightness * 10) * 0.5

                // this.ctx.fillStyle = `rgba(255,255,255,${alpha})`
                const primaryColor = getComputedStyle(document.documentElement)
                    .getPropertyValue('--primary-color')
                    .trim()
                this.ctx.fillStyle = this.hexToRgba(primaryColor, alpha)

                this.ctx.beginPath()
                this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
                this.ctx.fill()
            })
        },
        hexToRgba(hex, alpha) {
            const h = hex.replace('#', '')
            const bigint = parseInt(h, 16)
            const r = (bigint >> 16) & 255
            const g = (bigint >> 8) & 255
            const b = bigint & 255
            return `rgba(${r},${g},${b},${alpha})`
        },

        // -------------------------- COMETS --------------------------
        spawnComet() {
            const now = performance.now()
            if (now - this.lastCometTime < 1000 * 3) return

            this.lastCometTime = now

            this.comets.push({
                x: Math.random() * this.w,
                y: Math.random() * this.h * 0.4,
                vx: Math.random() * 4 + 2,
                vy: Math.random() * -1 - 0.5,
                trail: [],
            })
        },

        drawComets() {
            this.comets.forEach((c) => {
                c.x += c.vx
                c.y += c.vy

                c.trail.push({ x: c.x, y: c.y })
                if (c.trail.length > 20) c.trail.shift()

                const primaryColor = getComputedStyle(document.documentElement)
                    .getPropertyValue('--primary-color')
                    .trim()

                c.trail.forEach((t, i) => {
                    const alpha = i / c.trail.length
                    // this.ctx.fillStyle = `rgba(255,255,255,${alpha})`
                    this.ctx.fillStyle = this.hexToRgba(primaryColor, alpha)
                    this.ctx.beginPath()
                    this.ctx.arc(t.x, t.y, 2, 0, Math.PI * 2)
                    this.ctx.fill()
                })

                this.ctx.fillStyle = primaryColor
                this.ctx.beginPath()
                this.ctx.arc(c.x, c.y, 3, 0, Math.PI * 2)
                this.ctx.fill()
            })

            this.comets = this.comets.filter((c) => c.x < this.w && c.y > 0)
        },

        // -------------------------- SKY --------------------------
        drawGradientSky() {
            const skyColor = this.useAuth.isDarkMode ? '#181818' : '#f2f2f2'
            const skyColor2 = this.useAuth.isDarkMode ? '#282828' : '#ffffff'

            const grd = this.ctx.createLinearGradient(0, 0, 0, this.h * 0.7)
            grd.addColorStop(0, skyColor)
            grd.addColorStop(1, skyColor2)
            this.ctx.fillStyle = grd

            this.ctx.fillRect(0, 0, this.w, this.h)
        },

        // -------------------------- HILLS --------------------------
        drawHills() {
            const hill1Color = this.useAuth.isDarkMode ? '#3A3A3A' : '#BEBEBE'
            const hill2Color = this.useAuth.isDarkMode ? '#2C2C2C' : '#9E9E9E'
            const hill3Color = this.useAuth.isDarkMode ? '#1A1A1A' : '#7A7A7A'

            // Layer 1 (fondo, más claro)
            this.drawHillLayer({
                color: hill1Color,
                baseY: this.h * 0.75,
                amplitude: 70,
                noiseScale: 0.0025,
            })

            // Layer 2 (medio)
            this.drawHillLayer({
                color: hill2Color,
                baseY: this.h * 0.8,
                amplitude: 90,
                noiseScale: 0.0032,
            })

            // Layer 3 (frontal, más oscura)
            this.drawHillLayer({
                color: hill3Color,
                baseY: this.h * 0.88,
                amplitude: 110,
                noiseScale: 0.0042,
            })
        },

        drawHillLayer({ color, baseY, amplitude, noiseScale }) {
            const ctx = this.ctx
            ctx.fillStyle = color
            ctx.beginPath()

            ctx.moveTo(0, this.h)

            for (let x = 0; x <= this.w; x += 2) {
                const y =
                    baseY +
                    Math.sin(x * noiseScale * 2) * amplitude * 0.6 +
                    Math.sin(x * noiseScale * 6) * amplitude * 0.3 +
                    Math.sin(x * noiseScale * 12) * amplitude * 0.1

                ctx.lineTo(x, y)
            }

            ctx.lineTo(this.w, this.h)
            ctx.closePath()
            ctx.fill()
        },

        // -------------------------- ANIMATION --------------------------
        animate() {
            this.ctx.clearRect(0, 0, this.w, this.h)

            this.drawGradientSky()
            this.drawStars()

            this.spawnComet()
            this.drawComets()

            this.drawHills()

            requestAnimationFrame(this.animate)
        },
    },
}
</script>

<style scoped>
.night-container {
    width: 100%;
    height: 100vh;
    overflow: hidden;
}
canvas {
    display: block;
}
</style>
