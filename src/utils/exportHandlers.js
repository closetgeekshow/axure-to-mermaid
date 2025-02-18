/**
 * @file Export handlers for different file formats
 * @module ExportHandlers
 * @requires serializeMermaid
 */

import { serializeMermaid } from './mermaidUtils.js';

/**
 * Handles exporting Mermaid text as an SVG file
 * @async
 * @function handleSvgExport
 * @param {string} mermaidText - The Mermaid diagram text
 * @param {boolean} [download=false] - Whether to download the file or open in a new tab
 * @returns {Promise<void>}
 */
export async function handleSvgExport(mermaidText, download = false) {
    const encoded = serializeMermaid(mermaidText);
    const url = `https://mermaid.ink/svg/pako:${encoded}`;
    
    if (download) {
        const response = await fetch(url);
        const svgContent = await response.text();
        downloadFile(svgContent, 'sitemap.svg', 'image/svg+xml');
    } else {
        window.open(url, '_blank');
    }
}

/**
 * Handles exporting Mermaid text as a PNG file
 * @async
 * @function handlePngExport
 * @param {string} mermaidText - The Mermaid diagram text
 * @param {boolean} [download=false] - Whether to download the file or open in a new tab
 * @returns {Promise<void>}
 */
export async function handlePngExport(mermaidText, download = false) {
    const encoded = serializeMermaid(mermaidText);
    const url = `https://mermaid.ink/img/pako:${encoded}?type=png`;
    
    if (download) {
        const response = await fetch(url);
        const blob = await response.blob();
        downloadFile(blob, 'sitemap.png', 'image/png');
    } else {
        window.open(url, '_blank');
    }
}

/**
 * Downloads a file with the specified content and type
 * @function downloadFile
 * @param {Blob|string} content - The content to download
 * @param {string} filename - The name of the file to save
 * @param {string} type - The MIME type of the file
 */
export function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Handles exporting Mermaid text as a TXT file
 * @function handleTxtExport
 * @param {string} mermaidText - The Mermaid diagram text
 */
export function handleTxtExport(mermaidText) {
    downloadFile(mermaidText, 'sitemap.txt', 'text/plain');
}