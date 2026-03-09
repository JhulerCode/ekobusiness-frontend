import fs from 'fs'
import path from 'path'

const targets = [
    'src/views/operaciones/activity_logs/vActivityLogs.vue',
    'src/views/operaciones/asistencias/vAsistencias.vue',
    'src/views/operaciones/caja_chica/vCajaAperturas.vue',
    'src/views/operaciones/colaboradores/vColaboradores.vue',
    'src/views/operaciones/documentos/vDocumentos.vue',
    'src/views/operaciones/equipos/vEquipos.vue',
    'src/views/operaciones/maquinas/vMaquinas.vue',
    'src/views/operaciones/monedas/vMonedas.vue',
]

for (let p of targets) {
    const fullPath = path.resolve(process.cwd(), p)
    if (!fs.existsSync(fullPath)) continue

    let cnt = fs.readFileSync(fullPath, 'utf8')

    let tnMatch = cnt.match(/tableName:\s*['"]([^'"]+)['"]/)
    if (!tnMatch) continue
    let tableName = tnMatch[1]

    let reloadMethodMatch = cnt.match(/:reload="([^"]+)"/)
    let reloadMethod = reloadMethodMatch ? reloadMethodMatch[1] : 'loadDatos'

    let loadMethodMatch = cnt.match(/(?:async )?(load[A-Za-z0-9_]*)\s*\(\)\s*{/g)
    let allLoads = loadMethodMatch
        ? loadMethodMatch.map((x) =>
              x
                  .replace(/async\s+/, '')
                  .split('(')[0]
                  .trim(),
          )
        : []
    if (!reloadMethodMatch) {
        let potentialLoads = allLoads.filter(
            (x) => !x.includes('Config') && !x.includes('Colaborador'),
        )
        if (potentialLoads.length > 0) reloadMethod = potentialLoads[0]
    }

    let configCols = ''
    let colsStart = cnt.indexOf('columns: [')
    if (colsStart !== -1) {
        let bracketCount = 0
        let cEnd = -1
        for (let i = colsStart + 8; i < cnt.length; i++) {
            if (cnt[i] == '[') bracketCount++
            if (cnt[i] == ']') {
                bracketCount--
                if (bracketCount == 0) {
                    cEnd = i
                    break
                }
            }
        }
        configCols = cnt.substring(colsStart, cEnd + 1)
    }

    let configOpts = ''
    let optsStart = cnt.indexOf('tableRowOptions: [')
    let isRowOptsProp = true
    if (optsStart === -1) {
        optsStart = cnt.indexOf('options: [')
        isRowOptsProp = false
    }
    if (optsStart !== -1) {
        let bracketCount = 0
        let oEnd = -1
        for (let i = optsStart + (isRowOptsProp ? 16 : 8); i < cnt.length; i++) {
            if (cnt[i] == '[') bracketCount++
            if (cnt[i] == ']') {
                bracketCount--
                if (bracketCount == 0) {
                    oEnd = i
                    break
                }
            }
        }
        configOpts = cnt.substring(optsStart, oEnd + 1)
    }

    let bn = path.basename(fullPath).replace('v', '').replace('.vue', '')
    let configFileName =
        bn.replace(/[A-Z]/g, (letter) => '_' + letter.toLowerCase()).replace(/^_/, '') +
        '.config.js'
    let configPath = path.join(path.dirname(fullPath), configFileName)

    if (configCols) {
        let configJs = 'export const columns = ' + configCols.replace(/^columns:\s*/, '') + '\n'
        if (configOpts)
            configJs +=
                '\nexport const tableRowOptions = ' +
                configOpts.replace(/^(tableRowOptions|options):\s*/, '') +
                '\n'
        else configJs += '\nexport const tableRowOptions = []\n'
        fs.writeFileSync(configPath, configJs)

        cnt = cnt
            .replace(configCols + ',\n\n', '')
            .replace(configCols + ',\n', '')
            .replace(configCols + ',', '')
            .replace(configCols, '')
    }

    if (configOpts) {
        cnt = cnt
            .replace(configOpts + ',\n\n', '')
            .replace(configOpts + ',\n', '')
            .replace(configOpts + ',', '')
            .replace(configOpts, '')
    }

    let importCols = `import { columns, tableRowOptions } from './${configFileName}'`
    cnt = cnt.replace(
        /tableName:\s*['"][^'"]+['"],?/,
        `tableName: '${tableName}',\n        columns,\n        tableRowOptions,`,
    )

    cnt = cnt.replace(
        /import\s*{\s*([^}]+)\s*}\s*from\s*['"]@jhuler\/components['"]/g,
        (match, p1) => {
            let pkgs = p1
                .split(',')
                .map((s) => s.trim())
                .filter((s) => s !== 'JdTable' && s !== 'JdPaginacion' && s !== 'JdBuscador')
                .filter(Boolean)
            if (!pkgs.includes('JdButton')) pkgs.push('JdButton')
            return `import { ${pkgs.join(', ')} } from '@jhuler/components'\nimport JdTable from '@/components/JdTable/JdTable.vue'\nimport JdBuscador from '@/components/JdBuscador.vue'\nimport JdPaginacion from '@/components/JdPaginacion.vue'\n${importCols}`
        },
    )

    if (cnt.includes('components: {') && !cnt.includes('JdBuscador')) {
        cnt = cnt.replace(
            /(components:\s*{[^}]*)/,
            `$1\n        JdTable,\n        JdBuscador,\n        JdPaginacion,`,
        )
    }

    let headMatch = cnt.match(/<div class="head">([\s\S]*?)<JdTable/)
    if (headMatch) {
        let insideHead = headMatch[1]
        let titleMatch = insideHead.match(/<strong>([^<]+)<\/strong>/)
        let title = titleMatch ? titleMatch[1] : tableName

        let afterStrong = insideHead.split(/<\/strong>/)[1]
        let buttons = (afterStrong || '').replace(/<\/div>\s*$/, '').trim()

        let newHead = `
        <div class="head-left">
            <strong>${title}</strong>
            ${buttons}
        </div>

        <div class="head-center">
            <JdBuscador
                v-if="vista.loaded"
                :view="vista"
                :columns="columns"
                :tableName="tableName"
                @open-filters="openConfigFiltros"
                @reload="${reloadMethod}"
            />
        </div>

        <div class="head-right">
            <JdPaginacion :view="vista" @reload="${reloadMethod}" v-if="vista.loaded" />

            <JdButton
                icon="fa-solid fa-file-excel"
                tipo="2"
                title="Exportar"
                @click="$refs['jdtable'].downloadData()"
            />

            <JdButton
                icon="fa-solid fa-gear"
                tipo="2"
                title="Columnas"
                @click="$refs['jdtable'].openConfigCols()"
            />
        </div>
        `
        let fullHead = '<div class="head">' + newHead + '\n        </div>\n\n        <JdTable'
        cnt = cnt.replace(headMatch[0], fullHead)
    }

    let tMatch = cnt.match(/<JdTable([^>]+)>/)
    if (tMatch) {
        let props = tMatch[1]
        if (!props.includes('ref="jdtable"')) props += '\n            ref="jdtable"'
        if (!props.includes(':rowOptions="tableRowOptions"') && configOpts)
            props += '\n            :rowOptions="tableRowOptions"'
        if (!props.includes('@rowOptionSelected="runMethod"') && configOpts)
            props += '\n            @rowOptionSelected="runMethod"'

        cnt = cnt.replace(tMatch[0], `<JdTable${props}>`)
    }

    fs.writeFileSync(fullPath, cnt)
    console.log('processed', fullPath)
}
