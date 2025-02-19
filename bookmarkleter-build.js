import * as esbuild from 'esbuild'
import bookmarkleter from 'bookmarkleter'
import fs from 'fs/promises'

const isMinified = process.env.BUILD_MIN === 'true'
const target = process.env.BUILD_TARGET
const outputName = process.env.BUILD_OUTNAME
const entryPoint = process.env.BUILD_ENTRYPOINT

const baseConfig = {
    bundle: true,
    target: 'es2020',
    sourcemap: false,
    minify: isMinified,
    loader: { '.js': 'jsx' }
}

const builds = {
    cloud: {
        ...baseConfig,
        entryPoints: [entryPoint],
        format: 'esm',
        outfile: `dist/${outputName}.cloud${isMinified ? '.min' : ''}.js`,
        define: { '__BUILD_TARGET__': `"${target}"` }
    },
    shape: {
        ...baseConfig,
        entryPoints: [entryPoint],
        format: 'iife',
        outfile: `dist/${outputName}.shape${isMinified ? '.min' : ''}.js`,
        define: { '__BUILD_TARGET__': `"${target}"` },
        globalName: `${outputName.charAt(0).toUpperCase() + outputName.slice(1)}Plugin`
    },
    bookmarklet: {
        ...baseConfig,
        entryPoints: [entryPoint],
        format: 'iife',
        outfile: `dist/${outputName}.bookmarklet${isMinified ? '.min' : ''}.js`,
        define: { '__BUILD_TARGET__': `"${target}"` },
        globalName: `${outputName.charAt(0).toUpperCase() + outputName.slice(1)}Plugin`
    }
}
async function processWithBookmarkleter(filePath) {
    const code = await fs.readFile(filePath, 'utf-8')
    const bookmarkletCode = bookmarkleter(code, {
        urlencode: true,
        iife: true,
        mangleVars: true,
        transpile: true
    })
    
    // Create a new file with -processed suffix
    const newPath = filePath.replace('.js', '-processed.js')
    await fs.writeFile(newPath, bookmarkletCode, 'utf-8')
    console.log(`Processed with bookmarkleter: ${newPath}`)
}

async function build() {
    const config = builds[target]
    if (!config) {
        throw new Error(`Invalid build target: ${target}`)
    }
    
    try {
        await esbuild.build(config)
        console.log(`Build completed: ${config.outfile}`)

        // Process with bookmarkleter for shape and bookmarklet targets
        if (target === 'shape' || target === 'bookmarklet') {
            await processWithBookmarkleter(config.outfile)
        }
    } catch (error) {
        console.error('Build failed:', error)
        process.exit(1)
    }
}

build()