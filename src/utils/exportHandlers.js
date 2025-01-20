import { serializeMermaid } from './mermaid.js';

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

export function handleTxtExport(mermaidText) {
    downloadFile(mermaidText, 'sitemap.txt', 'text/plain');
}


