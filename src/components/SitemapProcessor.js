/**
 * @class SitemapProcessor
 * @description Processes sitemap nodes and generates Mermaid markup
 */
export class SitemapProcessor {
  #processedNodes = null;
  #nodeMap = new Map();

  /**
   * Initializes the processor with sitemap nodes
   * @param {Array} nodes - Array of sitemap nodes
   * @returns {Array} Processed nodes
   */
  initialize(nodes) {
    this.#processedNodes = this.processSitemap(nodes);
    this.#processedNodes.forEach(node => this.#nodeMap.set(node.id, node));
    return this.#processedNodes;
  }

  /**
   * Processes sitemap nodes into flat structure
   * @param {Array} nodes - Array of sitemap nodes
   * @param {string} parentId - Parent node ID
   * @returns {Array} Processed nodes
   */
  processSitemap(nodes, parentId = null) {
    return nodes.flatMap(node => {
      const id = node.id || `f${(parentId || node.pageName).split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 0)}`;
      return [
        { id, name: node.pageName, parentId, type: node.type },
        ...(node.children ? this.processSitemap(node.children, id) : [])
      ];
    });
  }

  /**
   * Generates Mermaid markup from processed nodes
   * @param {string} startNodeId - Optional starting node ID for subtree
   * @returns {string} Mermaid markup text
   */
  generateMermaidMarkup(startNodeId = null) {
    if (!this.#processedNodes) {
      throw new Error('Sitemap not initialized. Call initialize() first.');
    }

    const relevantNodes = startNodeId 
      ? this.#getSubtreeNodes(startNodeId)
      : this.#processedNodes;

    return this.#generateMarkup(relevantNodes);
  }

  /**
   * Gets nodes in subtree starting from given node
   * @private
   */
  #getSubtreeNodes(startNodeId) {
    const startNode = this.#nodeMap.get(startNodeId);
    return this.#processedNodes.filter(node => 
      this.#isNodeInSubtree(node, startNode)
    );
  }

  /**
   * Checks if node is in subtree
   * @private
   */
  #isNodeInSubtree(node, startNode) {
    let current = node;
    while (current) {
      if (current.id === startNode.id) return true;
      current = this.#nodeMap.get(current.parentId);
    }
    return false;
  }

  /**
   * Generates the actual Mermaid markup
   * @private
   */
  #generateMarkup(nodes) {
    const groups = nodes.reduce((acc, node) => {
      const tier = acc.get(node.parentId) || new Set();
      tier.add(`${node.id}["${node.name}"]${node.parentId ? `\n      ${node.parentId} --- ${node.id}` : ''}`);
      acc.set(node.parentId, tier);
      return acc;
    }, new Map());

    return [
      'graph TD',
      '',
      '  classDef containers fill:transparent,stroke-width:0',
      '',
      ...[...groups.entries()].map(([parent, nodes], i) => 
        `  subgraph tier${i}[" "]\n      ${[...nodes].join('\n      ')}\n  end\n\n`
      ),
      `  class ${[...Array(groups.size)].map((_, i) => `tier${i}`).join(',')} containers`
    ].join('\n');
  }
  /**
   * Finds the current node in the sitemap
   * @public
   * @param {string} currentId - ID of the current node
   * @returns {Object|null} The found node or null if not found
   */
  findCurrentNode(currentId) {
    return this.#nodeMap.get(currentId) || null;
  }
}