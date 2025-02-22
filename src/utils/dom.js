/**
 * @file DOM utility functions for element creation and clipboard operations
 * @module DOMUtils
 * @requires mermaidStore
 */

import { mermaidStore } from "./mermaidUtils.js";

/**
 * Creates a new DOM element with specified properties
 * @function createElement
 * @param {string} elementType - The type of element to create
 * @param {string} [textContent=''] - The text content of the element
 * @param {Object} [props={}] - Additional properties to set on the element
 * @returns {HTMLElement} The created DOM element
 */
export function createElement(elementType, textContent = "", props = {}) {
  if (!elementType) {
    throw new Error("createElement requires element type");
  }

  try {
    const element = document.createElement(elementType);
    element.textContent = textContent;

    Object.entries(props).forEach(([key, value]) => {
      if (key === "style" && typeof value === "object") {
        Object.assign(element.style, value);
      } else if (key === "dataset" && typeof value === "object") {
        Object.assign(element.dataset, value);
      } else {
        element[key] = value;
      }
    });

    return element;
  } catch (error) {
    console.error(`Failed to create ${elementType} element:`, error);
    throw error;
  }
}
export function createIconEl(url, alt = "", className = "") {
  // Create an img element for the SVG
  return createElement("img", "", {
    src: url,
    className: className,
    alt: alt,
    role: "img"
  });
}
/**
 * Copies the specified text to the clipboard
 * @function copyToClipboard
 * @param {string} copyText - The text to copy to the clipboard
 */
export function copyToClipboard() {
  navigator.clipboard
    .writeText(mermaidStore.getText())
    .then(() => {
      notify.success("Copied to clipboard!");
    })
    .catch(() => {
      notify.error("Failed to copy", "error");
    });
}

export const notify = {
  success: (type) => console.log(`Successfully exported ${type} file`),
  error: (type, error) => console.warn(`Failed to export ${type} file:`, error),
};
