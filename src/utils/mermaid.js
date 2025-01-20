export function serializeMermaid(mermaidText) {
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
  const compressed = deflate(data, { level: 9 });
  return fromUint8Array(compressed, true);
}
