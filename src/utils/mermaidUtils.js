/**
 * @file Utility functions for handling Mermaid diagram exports and serialization
 * @module MermaidUtils
 * @requires loadDependencies
 * @requires mermaidStore
 * @requires notify
 */

import { loadDependencies } from "../config/constants.js";
import { mermaidStore } from '../store/MermaidStore.js';
import { notify } from "./dom.js";

/**
 * An object that maps export types to their corresponding MIME types.
 * @type {Object<string, string>}
 */
const MIME_TYPES = {
  svg: 'image/svg+xml',
  png: 'image/png',
  txt: 'text/plain'
};

let dependenciesLoaded = false;

async function ensureDependencies() {
  if (!dependenciesLoaded) {
    await loadDependencies();
    dependenciesLoaded = true;
  }
}

/**
 * Serializes a Mermaid diagram text into a compressed and encoded format.
 *
 * This function ensures the necessary dependencies are loaded, then constructs a state object with the diagram text and other configuration options. The state is then serialized to JSON, compressed using pako, and encoded to a Base64 string.
 *
 * @param {string} mermaidText - The Mermaid diagram text to be serialized.
 * @returns {string} The serialized and compressed Mermaid diagram data.
 */
export async function serializeMermaid(mermaidText) {
  await ensureDependencies();

  const state = {
    code: mermaidText,
    mermaid: JSON.stringify({ theme: "default" }, null, 2),
    updateEditor: true,
    autoSync: true,
    updateDiagram: true,
  };

  const json = JSON.stringify(state);
  const data = new TextEncoder().encode(json);
  const compressed = pako.deflate(data, { level: 9 });
  return Base64.fromUint8Array(compressed, true);
}

/**
 * Handles the export of a Mermaid diagram to various formats, including SVG, PNG, and text.
 *
 * This function first retrieves the current diagram state from the Mermaid store. If no diagram data is available, it throws an error. It then serializes the diagram data using the `serializeMermaid` function, and constructs a URL for the export.
 *
 * If the `download` parameter is true, the function fetches the export URL, retrieves the content (either text or a blob), and downloads the file using the `downloadFile` function. If the `download` parameter is false, the function opens the export URL in a new tab.
 *
 * @param {string} type - The export type, either "svg", "png", or "txt".
 * @param {string} format - The export format, either "svg", "img", or "txt".
 * @param {boolean} download - Whether to download the exported file or open it in a new tab.
 * @returns {Promise<boolean>} - A promise that resolves to true if the export was successful.
 */
async function handleExport(type, format, download) {
  const diagram = mermaidStore.getState().diagram;
  if (!diagram) {
    throw new Error('No diagram data available');
  }

  const encoded = await serializeMermaid(diagram);
  const baseUrl = `https://mermaid.ink/${format}/pako:${encoded}`;
  const url = format === "img" ? `${baseUrl}?type=${type}` : baseUrl;

  if (download) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const content = type === "svg" ? await response.text() : await response.blob();
    await downloadFile(content, `sitemap.${type}`, MIME_TYPES[type]);
    return notify.success(type);
  }

  window.open(url, "_blank");
  return true;
}

/**
 * Downloads a file with the given content, filename, and MIME type.
 *
 * This function creates a temporary URL for the file content, creates a download link
 * element, clicks the link to initiate the download, and then revokes the temporary URL.
 *
 * @param {string|Blob} content - The content of the file to be downloaded.
 * @param {string} filename - The name of the file to be downloaded.
 * @param {string} type - The MIME type of the file to be downloaded.
 * @returns {boolean} - True if the download was successful, false otherwise.
 */
async function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    return true;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Exports the mermaid diagram in various formats.
 *
 * The `svg` and `png` methods handle the export of the diagram to SVG and PNG formats,
 * respectively. The `txt` method exports the diagram data as a text file.
 *
 * @param {Object} asFile - An object containing the export methods.
 * @param {Function} asFile.svg - Exports the diagram as an SVG file.
 * @param {Function} asFile.png - Exports the diagram as a PNG image.
 * @param {Function} asFile.txt - Exports the diagram data as a text file.
 */
export const asFile = {
  svg: async (download = false) => handleExport("svg", "svg", download),
  png: async (download = false) => handleExport("png", "img", download),
  txt: () => {
    const diagram = mermaidStore.getState().diagram;
    return downloadFile(diagram, "sitemap.txt", MIME_TYPES.txt);
  }
};

export const { subscribe, setState, getState } = mermaidStore;
