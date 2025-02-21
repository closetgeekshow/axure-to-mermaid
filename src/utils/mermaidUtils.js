/**
 * @file Utility functions for handling Mermaid diagram exports and serialization
 * @module MermaidUtils
 * @description Provides functionality to serialize Mermaid diagrams into compressed formats,
 * export diagrams to different file formats (SVG, PNG, TXT), and handle file downloads.
 * Includes utilities for URL-based diagram sharing and file system operations.
 * @exports {Object} asFile - Export handlers for different file formats
 * @exports {Function} serializeMermaid - Serializes Mermaid text into compressed format
 * @requires pako - For compression
 * @requires js-base64 - For base64 encoding
 * @requires notify - For user notifications
 */

import { notify } from "./dom.js";
 /**
 * Serializes Mermaid text into a compressed format suitable for URL encoding with Mermaid.ink
 * @function serializeMermaid
 * @param {string} mermaidText - The Mermaid diagram text
 * @returns {string} Base64 encoded and compressed state object for Mermaid.ink URLs
 * @description This function prepares Mermaid diagram text for use with the Mermaid.ink service by:
 * 1. Creating a state object with the diagram code and editor settings
 * 2. Converting it to JSON and encoding as UTF-8
 * 3. Compressing with Pako deflate algorithm
 * 4. Encoding the compressed data as Base64
 * The resulting string can be used in Mermaid.ink URLs to render diagrams
 */ 
import { loadDependencies } from "../config/constants.js";

let dependenciesLoaded = false;

async function ensureDependencies() {
  if (!dependenciesLoaded) {
    await loadDependencies();
    dependenciesLoaded = true;
  }
}

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
 * Handles the export of a Mermaid diagram to a specified file format (SVG, or PNG).
 * This function is responsible for serializing the Mermaid text, generating the appropriate URL,
 * and either downloading the file or opening the URL in a new tab.
 *
 * @async
 * @function handleExport
 * @param {string} mermaidText - The Mermaid diagram text to be exported.
 * @param {string} type - The file type to export (e.g. 'svg', 'png').
 * @param {string} format - The format of the export URL (e.g. 'svg', 'img').
 * @param {boolean} download - Whether to download the file or open the URL in a new tab.
 * @returns {Promise} A promise that resolves when the export is complete.
 */

async function handleExport(type, format, download) {
  try {
    const encoded = await serializeMermaid(mermaidStore.getText());
    const baseUrl = `https://mermaid.ink/${format}/pako:${encoded}`;
    const url = format === "img" ? `${baseUrl}?type=${type}` : baseUrl;

    if (download) {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const content = type === "svg" ? await response.text() : await response.blob();
      await downloadFile(content, `sitemap.${type}`, `image/${type}`);
      notify.success(type);
    } else {
      window.open(url, "_blank");
    }
  } catch (error) {
    notify.error(type, error);
  }
}

async function handleSvgExport(download = false) {
  return handleExport("svg", "svg", download);
}

async function handlePngExport(download = false) {
  return handleExport("png", "img", download);
}

async function handleTxtExport() {
  try {
    await downloadFile(mermaidStore.getText(), "sitemap.txt", "text/plain");
    notify.success("txt");
  } catch (error) {
    notify.error("txt", error);
  }
}

/**
 * Downloads a file with the specified content and type
 * @function downloadFile
 * @param {Blob|string} content - The content to download

export const asFile = {
  svg: async (download = false) => handleExport("svg", "svg", download),
  png: async (download = false) => handleExport("png", "img", download),
  txt: handleTxtExport,
};
 * @param {string} filename - The name of the file to save
 * @param {string} type - The MIME type of the file
 * @returns {Promise} A promise that resolves when the download is complete
 */
function downloadFile(content, filename, type) {
  return new Promise((resolve, reject) => {
    try {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

// Create a simple store for mermaid text
export const mermaidStore = (() => {
  let currentText = '';
  return {
  setText(text) {
    currentText = text;
  },
  getText() {
    return currentText;
  }
};
})();

export const asFile = {
  svg: handleSvgExport,
  png: handlePngExport,
  txt: handleTxtExport,
};
