/**
 * @file Configuration constants for the application
 * @module CONFIG
 */

/**
 * @typedef {Object} ButtonConfig
 * @property {string} text - Button display text
 * @property {string} type - Button type (generate|copy|download|url)
 */

/**
 * @typedef {Object} ToolbarStyle
 * @property {string} bottom - Bottom position
 * @property {string} right - Right position
 * @property {string} backgroundColor - Background color
 * @property {string} padding - Padding
 * @property {string} border - Border style
 * @property {string} zIndex - Z-index value
 * @property {string} gap - Gap between elements
 */

/**
 * @constant {Object} CONFIG
 * @property {Object.<string, ButtonConfig>} buttons - Button configurations
 * @property {string[]} dependencies - External dependency URLs
 * @property {Object} mermaid - Mermaid configuration
 * @property {Object} toolbar - Toolbar styling configuration
 */
export const CONFIG = {
    buttons: {
        all: { text: 'All', type: 'generate' },
        startHere: { text: 'Start Here', type: 'generate' },
        copy: { text: 'Copy', type: 'copy' },
        txtDownload: { text: 'Txt', type: 'download' },
        svgUrl: { text: 'SVG', type: 'url' },
        svgDownload: { text: 'SVG', type: 'download' },
        pngUrl: { text: 'PNG', type: 'url' },
        pngDownload: { text: 'PNG', type: 'download' }
    },
    dependencies: [
        'https://cdn.jsdelivr.net/npm/pako@2.1.0/dist/pako.min.js',
        'https://cdn.jsdelivr.net/npm/js-base64@3.7.5/base64.min.js'
    ],
    mermaid: {
        theme: 'default',
        baseUrl: 'https://mermaid.ink'
    },
    toolbar: {
        style: {
            bottom: '2vh',
            right: '2vw',
            backgroundColor: 'white',
            padding: '10px',
            border: '1px solid #ccc',
            zIndex: '1000',
            gap: '0.125rem'
        }
    }
};