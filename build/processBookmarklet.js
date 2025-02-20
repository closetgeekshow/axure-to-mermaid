import bookmarkleter from 'bookmarkleter'
import fs from 'fs/promises'

async function processBookmarklet(inputPath, outputPath) {
    const code = await fs.readFile(inputPath, 'utf-8')
    const bookmarkletCode = bookmarkleter(code, {
        urlencode: true,
        iife: true,
        mangleVars: true,
        transpile: true
    })
    
    outputPath = outputPath || inputPath.replace('.js', '.bookmarklet.js')    
    await fs.writeFile(outputPath, bookmarkletCode, 'utf-8')
    console.log(`Processed bookmarklet saved to: ${outputPath}`)
}

// Allow running from command line
if (process.argv[2]) {
    processBookmarklet(process.argv[2], process.argv[3])
} else {
    console.log('Please provide an input file path')
}