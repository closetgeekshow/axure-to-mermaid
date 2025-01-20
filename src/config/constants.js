/**
 * @file Configuration constants for the application's UI and external dependencies
 * @module CONFIG
 * @requires pako
 * @requires js-base64
 */

/**
 * @typedef {Object} ButtonConfig
 * @property {string} text - Display text shown on the button
 * @property {('generate'|'copy'|'download'|'url')} type - Button action type
 */

/**
 * Button configurations keyed by ID
 * @constant {Object.<string, ButtonConfig>} 
 */
export const BUTTONS = {
  all: { text: "Full", type: "generate" },
  startHere: { text: "Current", type: "generate" },
  copy: { text: "Copy", type: "copy" },
  txtDownload: { text: "TXT", type: "download" },
  svgUrl: { text: "SVG", type: "url" },
  svgDownload: { text: "SVG", type: "download" },
  pngUrl: { text: "PNG", type: "url" },
  pngDownload: { text: "PNG", type: "download" },
}

/**
 * Layout structure for toolbar sections
 * @constant {Array<[string, string[]]>}
 */
export const LAYOUT = [
  ["Sitemap", ["all", "startHere"]],
  ["Code", ["copy"]],
  ["Download", ["txtDownload", "svgDownload", "pngDownload"]],
  ["URL", ["svgUrl", "pngUrl"]],
]

/**
 * URLs of required external JavaScript libraries
 * @constant {string[]}
 */
export const DEPENDENCIES = [
  "https://cdn.jsdelivr.net/npm/pako@2.1.0/dist/pako.min.js",
  "https://cdn.jsdelivr.net/npm/js-base64@3.7.5/base64.min.js",
];