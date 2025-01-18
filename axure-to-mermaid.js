/**
 * @file Axure sitemap to Mermaid diagram converter
 * @module SitemapGenerator
 * @requires $axure
 */

if (typeof $axure !== "undefined") {
  /**
   * @typedef {Object} Project
   * @property {string} name - Project name from Axure configuration
   * @property {string} id - Project ID from Axure configuration
   */
  const project = {
    "name": $axure.document.configuration.projectName,
    "id": $axure.document.configuration.projectId
  }

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
        
    mermaidText += `  class ${Array.from({length: maxLevel}, (_, i) => `tier${i + 1}`).join(',')} containers`;
        
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

  // Main execution
  const processedNodes = processSitemap(sitemapArray);
  console.dir(processedNodes);
  const mermaidText = generateMermaidMarkup(processedNodes);

  const mermaidTextarea = document.querySelector('[data-label*="mermaid text"] textarea');
  
  if (mermaidTextarea) {
    mermaidTextarea.value = mermaidText;
  } else {
    copyToClipboard(mermaidText);
  }
}
