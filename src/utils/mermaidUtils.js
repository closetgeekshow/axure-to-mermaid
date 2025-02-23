/**
 * @file Utility functions for handling Mermaid diagram exports and serialization
 * @module MermaidUtils
 */

import { loadDependencies } from "../config/constants.js";
import { mermaidStore } from '../store/MermaidStore.js';
import { notify } from "./dom.js";

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

export const asFile = {
  svg: async (download = false) => handleExport("svg", "svg", download),
  png: async (download = false) => handleExport("png", "img", download),
  txt: () => {
    const diagram = mermaidStore.getState().diagram;
    return downloadFile(diagram, "sitemap.txt", MIME_TYPES.txt);
  }
};

export const { subscribe, setState, getState } = mermaidStore;
