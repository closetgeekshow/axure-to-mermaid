const createSitemapProcessor = () => {
  const nodeCache = new Map()
  const nodeMap = new Map()
  let processedNodes = null

  const processSitemap = (nodes, parentId = null) => {
    return nodes.flatMap(node => {
      const id = node.id || `f${(parentId || node.pageName).split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 0)}`;
      return [
        { id, name: node.pageName, parentId, type: node.type },
        ...(node.children ? processSitemap(node.children, id) : [])
      ];
    });
  }

  const initialize = (nodes) => {
    if (processedNodes) {
      return processedNodes;
    }
    processedNodes = processSitemap(nodes);
    processedNodes.forEach(node => {
      nodeCache.set(node.id, node);
      nodeMap.set(node.id, node);
    });
    return processedNodes;
  }

  const getSubtreeNodes = (startNodeId) => {
    const startNode = nodeMap.get(startNodeId);
    return processedNodes.filter(node => 
      isNodeInSubtree(node, startNode)
    );
  }

  const isNodeInSubtree = (node, startNode) => {
    let current = node;
    while (current) {
      if (current.id === startNode.id) return true;
      current = nodeMap.get(current.parentId);
    }
    return false;
  }

  const generateMarkup = (nodes) => {
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

  const generateMermaidMarkup = (startNodeId = null) => {
    if (!processedNodes) {
      throw new Error('Sitemap not initialized. Call initialize() first.');
    }

    const relevantNodes = startNodeId 
      ? getSubtreeNodes(startNodeId)
      : processedNodes;

    return generateMarkup(relevantNodes);
  }

  const findCurrentNode = (currentId) => {
    return nodeMap.get(currentId) || null;
  }

  return {
    initialize,
    generateMermaidMarkup,
    findCurrentNode
  }
}

export const createProcessor = () => createSitemapProcessor()