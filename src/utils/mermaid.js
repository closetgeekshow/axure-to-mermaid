/**
 * @file Utility functions for handling Mermaid diagram serialization
 * @module MermaidUtils
 * @requires pako
 * @requires js-base64
 */

/**
 * Serializes Mermaid text into a compressed format suitable for URL encoding
 * @function serializeMermaid
 * @param {string} mermaidText - The Mermaid diagram text
 * @returns {string} The serialized and compressed Mermaid text
 */
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