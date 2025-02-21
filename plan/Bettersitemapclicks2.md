export class SitemapProcessor {
  #processedNodes = null;
  #nodeMap = new Map();

  initialize(nodes) {
    this.#processedNodes = this.processSitemap(nodes);
    this.#processedNodes.forEach(node => this.#nodeMap.set(node.id, node));
    return this.#processedNodes;
  }

  processSitemap(nodes, parentId = null) {
    return nodes.flatMap(node => {
      const id = node.id || `f${(parentId || node.pageName).split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 0)}`;
      return [
        { id, name: node.pageName, parentId, type: node.type },
        ...(node.children ? this.processSitemap(node.children, id) : [])
      ];
    });
  }

  generateMermaidMarkup(startNodeId = null) {
    if (!this.#processedNodes) {
      throw new Error('Sitemap not initialized. Call initialize() first.');
    }

    const relevantNodes = startNodeId 
      ? this.#getSubtreeNodes(startNodeId)
      : this.#processedNodes;

    return this.#generateMarkup(relevantNodes);
  }

  #getSubtreeNodes(startNodeId) {
    const startNode = this.#nodeMap.get(startNodeId);
    return this.#processedNodes.filter(node => 
      this.#isNodeInSubtree(node, startNode)
    );
  }

  #isNodeInSubtree(node, startNode) {
    let current = node;
    while (current) {
      if (current.id === startNode.id) return true;
      current = this.#nodeMap.get(current.parentId);
    }
    return false;
  }

  #generateMarkup(nodes) {
    const groups = nodes.reduce((acc, node) => {
      const tier = acc.get(node.parentId) || new Set();
      tier.add(`${node.id}["${node.name}"]${node.parentId ? `\n  ${node.parentId} --- ${node.id}` : ''}`);
      acc.set(node.parentId, tier);
      return acc;
    }, new Map());

    return [
      'graph TD',
      'classDef containers fill:transparent,stroke-width:0',
      ...[...groups.entries()].map(([parent, nodes], i) => 
        `subgraph tier${i}[" "]\n  ${[...nodes].join('\n  ')}\nend`
      ),
      `class ${[...Array(groups.size)].map((_, i) => `tier${i}`).join(',')} containers`
    ].join('\n');
  }
}
