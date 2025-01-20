/**
 * @file Axure sitemap to Mermaid diagram converter
 * @module SitemapGenerator
 * @requires $axure
 */

import { deflate } from 'pako/dist/pako.esm.mjs';
import { fromUint8Array } from 'js-base64';
;


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

  // Add "X" button to the toolbar
  const closeButton = createElement('button', 'X', {
    onclick: unloadScript
  });

  // Add buttons to the toolbar
  let currentMermaidText = '';

  const allButton = createElement('button', 'All', {
      onclick: () => {
          // Process sitemap when All button is clicked
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
                  if (node.id === currentId) {
                      return node;
                  }
                  if (node.children) {
                      const found = findCurrentNode(node.children, currentId);
                      if (found) return found;
                  }
              }
              return null;
          };

          const selectedNode = findCurrentNode(sitemapArray, currentId);
          if (selectedNode) {
              // Process sitemap when Start Here button is clicked
              const processedNodes = processSitemap([selectedNode]);
              currentMermaidText = generateMermaidMarkup(processedNodes);
              copyToClipboard(currentMermaidText);
              enableExportButtons();
          }
      }
  });

  function enableExportButtons() {
      txtButton.disabled = false;
      svgUrlButton.disabled = false;
      svgDownloadButton.disabled = false;
      pngUrlButton.disabled = false;
      pngDownloadButton.disabled = false;
  }

  const txtButton = createElement('button', '📄Txt', { disabled: true });
  const svgUrlButton = createElement('button', '🔗SVG', { disabled: true });
  const svgDownloadButton = createElement('button', '📥SVG', { disabled: true });
  const pngUrlButton = createElement('button', '🔗PNG', { disabled: true });
  const pngDownloadButton = createElement('button', '📥PNG', { disabled: true });

  toolbar.appendChild(allButton);
  toolbar.appendChild(startHereButton);
  toolbar.appendChild(txtButton);
  toolbar.appendChild(svgUrlButton);
  toolbar.appendChild(svgDownloadButton);
  toolbar.appendChild(pngUrlButton);
  toolbar.appendChild(pngDownloadButton);
  toolbar.appendChild(closeButton);

  document.body.appendChild(toolbar);

  // Keep all export buttons disabled initially
  txtButton.disabled = true;
  svgUrlButton.disabled = true;
  svgDownloadButton.disabled = true;
  pngUrlButton.disabled = true;
  pngDownloadButton.disabled = true;
    // Update txt button to use the current mermaid text
    txtButton.onclick = () => {
        downloadFile(currentMermaidText, 'sitemap.txt', 'text/plain');
    };

    // Add these utility functions
    function serializeMermaid(mermaidText) {
      // Create state object matching mermaid-live-editor structure
      const state = {
        code: mermaidText,
        mermaid: JSON.stringify({
          theme: 'default'
        }, null, 2),
        updateEditor: true,
        autoSync: true,
        updateDiagram: true
      };

      // Convert state object to string
      const json = JSON.stringify(state);
  
      // Convert string to Uint8Array
      const data = new TextEncoder().encode(json);
  
      // Compress with pako
      const compressed = deflate(data, { level: 9 });
  
      // Convert to base64 URL-safe string
      return fromUint8Array(compressed, true);
    }
    // Modify the button handlers
    svgUrlButton.onclick = () => {
      const encoded = serializeMermaid(mermaidText);
      const svgUrl = `https://mermaid.ink/svg/pako:${encoded}`;
      window.open(svgUrl, '_blank');
    };

    svgDownloadButton.onclick = async () => {
      const encoded = serializeMermaid(mermaidText);
      const svgUrl = `https://mermaid.ink/svg/pako:${encoded}`;
      const response = await fetch(svgUrl);
      const svgContent = await response.text();
      downloadFile(svgContent, 'sitemap.svg', 'image/svg+xml');
    };

    pngUrlButton.onclick = () => {
      const encoded = serializeMermaid(mermaidText);
      const pngUrl = `https://mermaid.ink/img/pako:${encoded}?type=png`;
      window.open(pngUrl, '_blank');
    };

    pngDownloadButton.onclick = async () => {
      const encoded = serializeMermaid(mermaidText);
      const pngUrl = `https://mermaid.ink/img/pako:${encoded}?type=png`;
      const response = await fetch(pngUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitemap.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };
  }
