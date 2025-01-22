/**
 * @class SitemapProcessor
 * @description Processes sitemap nodes and generates Mermaid markup
 */
export class SitemapProcessor {
  constructor() {
    // Initialization if needed
  }

  /**
   * Processes the sitemap nodes into a structured format
   * @public
   * @param {Array} nodes - Array of sitemap nodes
   * @param {number} [level=1] - Current depth level in the sitemap
   * @param {string|null} [parentId=null] - ID of the parent node
   * @param {Array} [result=[]] - Accumulator for processed nodes
   * @returns {Array} Processed sitemap nodes
   */
  processSitemap(nodes, level = 1, parentId = null, result = []) {
    nodes.forEach((node) => {
      const nodeId = node.id || `folder_${Math.random().toString(36).substr(2, 7)}`;
      result.push({
        id: nodeId,
        name: node.pageName,
        level: level,
        parentId: parentId,
        type: node.type,
      });

      if (node.children) {
        this.processSitemap(node.children, level + 1, nodeId, result);
      }
    });
    return result;
  }

  /**
   * Generates Mermaid markup from processed nodes
   * @public
   * @param {Array} nodes - Array of processed sitemap nodes
   * @returns {string} Mermaid markup text
   */
  generateMermaidMarkup(nodes) {
    let mermaidText = `graph TD
    classDef containers fill:transparent,stroke-width:0
    
    `;

    const maxLevel = Math.max(...nodes.map((n) => n.level));

    for (let level = 1; level <= maxLevel; level++) {
      const tierNodes = nodes.filter((n) => n.level === level);
      mermaidText += `  subgraph tier${level}[" "]
      `;

      tierNodes.forEach((node) => {
        if (level === 1) {
          mermaidText += `    ${node.id}["${node.name}"]
          `;
        } else {
          mermaidText += `    ${node.parentId} --- ${node.id}["${node.name}"]
          `;
        }
      });

      mermaidText += `  end
      
      `;
    }

    mermaidText += `  class ${Array.from({ length: maxLevel }, (_, i) => `tier${i + 1}`).join(",")} containers`;

    return mermaidText;
  }
  
  /**
   * Finds the current node in the sitemap
   * @public
   * @param {Array} nodes - Array of sitemap nodes
   * @param {string} currentId - ID of the current node
   * @returns {Object|null} The found node or null if not found
   */
  findCurrentNode(nodes, currentId) {
    for (const node of nodes) {
      if (node.id === currentId) return node;
      if (node.children) {
        const found = this.findCurrentNode(node.children, currentId);
        if (found) return found;
      }
    }
    return null;
  }
}
