if (typeof $axure !== "undefined") {
  /* Configuration Start */
  const project = {
    "name": $axure.document.configuration.projectName,
    "id": $axure.document.configuration.projectId
  }
  /* Configuration End */
  
  const sitemapArray = $axure.document.sitemap.rootNodes;
    
  // Process sitemap into flat array with level info
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

  // Generate Mermaid markup
  function generateMermaidMarkup(nodes) {
    let mermaidText = `---\nconfig:\n  title: ${project.name} Sitemap\n---\n\ngraph TD\n  classDef containers fill:transparent,stroke-width:0\n\n`;
        
    // Group nodes by level
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

  // Main execution
  const processedNodes = processSitemap(sitemapArray);
  console.dir(processedNodes);
  const mermaidText = generateMermaidMarkup(processedNodes);

  // Find first textarea with data-label containing "mermaid text"
  const mermaidTextarea = document.querySelector('[data-label*="mermaid text"] textarea');
  
  if (mermaidTextarea) {
    // If found, update textarea value
    mermaidTextarea.value = mermaidText;
  } else {
    // Fall back to clipboard copy
    copyToClipboard(mermaidText);
  }

  function copyToClipboard(copyText) {
    const textarea = document.createElement("textarea");
    textarea.value = copyText;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
}
