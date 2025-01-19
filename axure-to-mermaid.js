/**
 * @file Axure sitemap to Mermaid diagram converter
 * @module SitemapGenerator
 * @requires $axure
 */

if (typeof $axure !== "undefined") {
  /**
   * Helper function to create and style elements
   * @param {string} elementType - The type of element to create (e.g., 'div', 'button')
   * @param {string} textContent - The text content of the element
   * @param {Object} props - An object containing properties and styles for the element
   * @returns {HTMLElement} The created element
   */
  function createElement(elementType, textContent = '', props = {}) {
    const element = document.createElement(elementType);
    element.textContent = textContent;

    // Apply properties and styles
    for (const [key, value] of Object.entries(props)) {
      if (key === 'style' && typeof value === 'object') {
        // Apply styles individually
        for (const [styleKey, styleValue] of Object.entries(value)) {
          element.style[styleKey] = styleValue;
        }
      } else {
        // Apply other attributes
        element[key] = value;
      }
    }

    return element;
  }

  /**
   * @typedef {Object} Project
   * @property {string} name - Project name from Axure configuration
   * @property {string} id - Project ID from Axure configuration
   */
  const project = {
    "name": $axure.document.configuration.projectName,
    "id": $axure.document.configuration.projectId
  };

  /**
   * @constant {Array} sitemapArray
   * Root nodes of the Axure sitemap structure
   */
  const sitemapArray = $axure.document.sitemap.rootNodes;

  /**
   * Processes sitemap nodes into a flat array with level information
   * @param {Array} nodes - Array of sitemap nodes
   * @param {number} [level=1] - Current hierarchy level
   * @param {string|null} [parentId=null] - ID of parent node
   * @param {Array} [result=[]] - Accumulator for processed nodes
   * @returns {Array} Flattened array of nodes with hierarchy info
   */
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

  /**
   * Generates Mermaid markup from processed sitemap nodes
   * @param {Array} nodes - Processed sitemap nodes
   * @returns {string} Mermaid diagram markup
   */
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

  /**
   * Copies text to clipboard using a temporary textarea
   * @private
   * @param {string} copyText - Text to copy to clipboard
   */
  function copyToClipboard(copyText) {
    const textarea = document.createElement("textarea");
    textarea.value = copyText;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }

  /**
   * Downloads a file with the given content and filename
   * @param {string} content - The content of the file
   * @param {string} filename - The name of the file
   * @param {string} type - The MIME type of the file
   */
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

  /**
   * Converts SVG to PNG using canvas
   * @param {string} svg - The SVG content
   * @param {string} filename - The name of the PNG file
   */
  function convertSvgToPng(svg, filename) {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/png');
    };
    img.src = `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  /**
   * Removes the toolbar and all script resources
   */
  function unloadScript() {
    if (toolbar && toolbar.parentNode) {
      toolbar.parentNode.removeChild(toolbar);
    }
    console.log("Script and resources have been unloaded.");
  }

  // Create floating toolbar
  const toolbar = createElement('div', '', {
    style: {
      position: 'fixed',
      top: '10px',
      right: '10px',
      backgroundColor: 'white',
      padding: '10px',
      border: '1px solid #ccc',
      zIndex: '1000',
      display: 'flex',
      flexDirection: 'column',
      gap: '5px'
    }
  });

  // Add "X" button to the toolbar
  const closeButton = createElement('button', 'X', {
    style: {
      position: 'absolute',
      top: '0',
      right: '0',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 'bold',
      color: '#999'
    },
    onclick: unloadScript
  });

  // Add buttons to the toolbar
  const allButton = createElement('button', 'All', {
    onclick: () => {
      const processedNodes = processSitemap(sitemapArray);
      const mermaidText = generateMermaidMarkup(processedNodes);
      copyToClipboard(mermaidText);
    }
  });

  const startHereButton = createElement('button', 'Start Here', {
    onclick: () => {
      const selectedNode = $axure.document.getSelectedItem();
      if (selectedNode) {
        const processedNodes = processSitemap([selectedNode]);
        const mermaidText = generateMermaidMarkup(processedNodes);
        copyToClipboard(mermaidText);
      }
    }
  });

  const txtButton = createElement('button', 'Txt', { disabled: true });
  const svgButton = createElement('button', 'SVG', { disabled: true });
  const pngButton = createElement('button', 'PNG', { disabled: true });

  toolbar.appendChild(closeButton);
  toolbar.appendChild(allButton);
  toolbar.appendChild(startHereButton);
  toolbar.appendChild(txtButton);
  toolbar.appendChild(svgButton);
  toolbar.appendChild(pngButton);
  document.body.appendChild(toolbar);

  // Main execution
  const processedNodes = processSitemap(sitemapArray);
  const mermaidText = generateMermaidMarkup(processedNodes);

  // Enable buttons after processing
  txtButton.disabled = false;
  svgButton.disabled = false;
  pngButton.disabled = false;

  txtButton.onclick = () => {
    downloadFile(mermaidText, 'sitemap.txt', 'text/plain');
  };

  svgButton.onclick = () => {
    const svgContent = document.querySelector('svg').outerHTML;
    downloadFile(svgContent, 'sitemap.svg', 'image/svg+xml');
  };

  pngButton.onclick = () => {
    const svgContent = document.querySelector('svg').outerHTML;
    convertSvgToPng(svgContent, 'sitemap.png');
  };
}
