import { CONFIG } from '../config/constants.js';

export class SitemapProcessor {
  constructor(projectName) {
    this.projectName = projectName;
  }

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

  generateMermaidMarkup(nodes) {
    let mermaidText = `---\nconfig:\n  title: ${this.projectName} Sitemap\n  theme: ${CONFIG.mermaid.theme}\n---\n\ngraph TD\n  classDef containers fill:transparent,stroke-width:0\n\n`;

    const maxLevel = Math.max(...nodes.map((n) => n.level));

    for (let level = 1; level <= maxLevel; level++) {
      const tierNodes = nodes.filter((n) => n.level === level);
      mermaidText += `  subgraph tier${level}[" "]\n`;

      tierNodes.forEach((node) => {
        if (level === 1) {
          mermaidText += `    ${node.id}["${node.name}"]\n`;
        } else {
          mermaidText += `    ${node.parentId} --- ${node.id}["${node.name}"]\n`;
        }
      });

      mermaidText += `  end\n\n`;
    }

    mermaidText += `  class ${Array.from({ length: maxLevel }, (_, i) => `tier${i + 1}`).join(",")} containers`;

    return mermaidText;
  }
  
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