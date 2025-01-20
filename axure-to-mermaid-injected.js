/**
 * @file Axure sitemap to Mermaid diagram converter with dynamic script loading
 */

function loadScript(url, callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = url;
  script.onload = callback;
  document.head.appendChild(script);
}

// Initialize by loading required scripts in sequence
loadScript('https://cdn.jsdelivr.net/npm/pako@2.1.0/dist/pako.min.js', () => {
  loadScript('https://cdn.jsdelivr.net/npm/js-base64@3.7.5/base64.min.js', initializeSitemapConverter);
});

function initializeSitemapConverter() {
  if (typeof $axure === "undefined") {
    console.error('Axure environment not found');
    return;
  }

  function createElement(elementType, textContent = '', props = {}) {
    const element = document.createElement(elementType);
    element.textContent = textContent;

    for (const [key, value] of Object.entries(props)) {
      if (key === 'style' && typeof value === 'object') {
        for (const [styleKey, styleValue] of Object.entries(value)) {
          element.style[styleKey] = styleValue;
        }
      } else {
        element[key] = value;
      }
    }

    return element;
  }

  const project = {
    "name": $axure.document.configuration.projectName,
    "id": $axure.document.configuration.projectId
  };

  const sitemapArray = $axure.document.sitemap.rootNodes;

  function processSitemap(nodes, level = 1, parentId = null, result = []) {
    nodes.forEach(node => {
      const nodeId = node.id || `folder_${Math.random().toString(36).substr(2, 7)}`;
      result.push({
        id: nodeId,
        name: node.pageName,
        level: level,
        parentId: parentId,
        type: node.type
      });

      if (node.children) {
        processSitemap(node.children, level + 1, nodeId, result);
      }
    });
    return result;
  }

  function generateMermaidMarkup(nodes) {
    let mermaidText = `---\nconfig:\n  title: ${project.name} Sitemap\n---\n\ngraph TD\n  classDef containers fill:transparent,stroke-width:0\n\n`;

    const maxLevel = Math.max(...nodes.map(n => n.level));

    for (let level = 1; level <= maxLevel; level++) {
      const tierNodes = nodes.filter(n => n.level === level);
      mermaidText += `  subgraph tier${level}[" "]\n`;

      tierNodes.forEach(node => {
        if (level === 1) {
          mermaidText += `    ${node.id}["${node.name}"]\n`;
        } else {
          mermaidText += `    ${node.parentId} --- ${node.id}["${node.name}"]\n`;
        }
      });

      mermaidText += `  end\n\n`;
    }

    mermaidText += `  class ${Array.from({ length: maxLevel }, (_, i) => `tier${i + 1}`).join(',')} containers`;

    return mermaidText;
  }

  function copyToClipboard(copyText) {
    const textarea = document.createElement("textarea");
    textarea.value = copyText;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }

  function downloadFile(content, filename, type) {
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

  function unloadScript() {
    if (toolbar && toolbar.parentNode) {
      toolbar.parentNode.removeChild(toolbar);
    }
    console.log("Script and resources have been unloaded.");
  }

  // Create toolbar and buttons
  const toolbar = createElement('div', '', {
    style: {
      position: 'fixed',
      bottom: '2vh',
      right: '2vw',
      backgroundColor: 'white',
      padding: '10px',
      border: '1px solid #ccc',
      zIndex: '1000',
      display: 'flex',
      flexDirection: 'row',
      gap: '0.125rem'
    }
  });

  let currentMermaidText = '';

  function enableExportButtons() {
    txtButton.disabled = false;
    svgUrlButton.disabled = false;
    svgDownloadButton.disabled = false;
    pngUrlButton.disabled = false;
    pngDownloadButton.disabled = false;
  }

  function serializeMermaid(mermaidText) {
    const state = {
      code: mermaidText,
      mermaid: JSON.stringify({
        theme: 'default'
      }, null, 2),
      updateEditor: true,
      autoSync: true,
      updateDiagram: true
    };

    const json = JSON.stringify(state);
    const data = new TextEncoder().encode(json);
    const compressed = pako.deflate(data, { level: 9 });
    return Base64.fromUint8Array(compressed, true);
  }

  // Create all buttons
  const closeButton = createElement('button', 'X', { onclick: unloadScript });
  const allButton = createElement('button', 'All', {
    onclick: () => {
      const processedNodes = processSitemap(sitemapArray);
      currentMermaidText = generateMermaidMarkup(processedNodes);
      copyToClipboard(currentMermaidText);
      enableExportButtons();
    }
  });

  const startHereButton = createElement('button', 'Start Here', {
    onclick: () => {
      const currentId = $axure.page.shortId;
      const findCurrentNode = (nodes, currentId) => {
        for (const node of nodes) {
          if (node.id === currentId) return node;
          if (node.children) {
            const found = findCurrentNode(node.children, currentId);
            if (found) return found;
          }
        }
        return null;
      };

      const selectedNode = findCurrentNode(sitemapArray, currentId);
      if (selectedNode) {
        const processedNodes = processSitemap([selectedNode]);
        currentMermaidText = generateMermaidMarkup(processedNodes);
        copyToClipboard(currentMermaidText);
        enableExportButtons();
      }
    }
  });

  const txtButton = createElement('button', '📄Txt', { 
    disabled: true,
    onclick: () => {
      downloadFile(currentMermaidText, 'sitemap.txt', 'text/plain');
    }
  });

  const svgUrlButton = createElement('button', '🔗SVG', { 
    disabled: true,
    onclick: () => {
      const encoded = serializeMermaid(currentMermaidText);
      window.open(`https://mermaid.ink/svg/pako:${encoded}`, '_blank');
    }
  });

  const svgDownloadButton = createElement('button', '📥SVG', { 
    disabled: true,
    onclick: async () => {
      const encoded = serializeMermaid(currentMermaidText);
      const response = await fetch(`https://mermaid.ink/svg/pako:${encoded}`);
      const svgContent = await response.text();
      downloadFile(svgContent, 'sitemap.svg', 'image/svg+xml');
    }
  });

  const pngUrlButton = createElement('button', '🔗PNG', { 
    disabled: true,
    onclick: () => {
      const encoded = serializeMermaid(currentMermaidText);
      window.open(`https://mermaid.ink/img/pako:${encoded}?type=png`, '_blank');
    }
  });

  const pngDownloadButton = createElement('button', '📥PNG', { 
    disabled: true,
    onclick: async () => {
      const encoded = serializeMermaid(currentMermaidText);
      const response = await fetch(`https://mermaid.ink/img/pako:${encoded}?type=png`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitemap.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  });

  // Add all buttons to toolbar
  [allButton, startHereButton, txtButton, svgUrlButton, svgDownloadButton, 
   pngUrlButton, pngDownloadButton, closeButton].forEach(button => {
    toolbar.appendChild(button);
  });

  document.body.appendChild(toolbar);
}