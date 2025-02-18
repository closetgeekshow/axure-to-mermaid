/**
 * @file DOM utility functions for element creation and clipboard operations
 * @module DOMUtils
 */

/**
 * Creates a new DOM element with specified properties
 * @function createElement
 * @param {string} elementType - The type of element to create
 * @param {string} [textContent=''] - The text content of the element
 * @param {Object} [props={}] - Additional properties to set on the element
 * @returns {HTMLElement} The created DOM element
 */
export function createElement(elementType, textContent = '', props = {}) {
  const element = document.createElement(elementType);
  element.textContent = textContent;

  for (const [key, value] of Object.entries(props)) {
    if (key === 'style' && typeof value === 'object') {
      Object.entries(value).forEach(([styleKey, styleValue]) => {
        element.style[styleKey] = styleValue;
      });
    } else {
      element[key] = value;
    }
  }
  return element;
}

/**
 * Copies the specified text to the clipboard
 * @function copyToClipboard
 * @param {string} copyText - The text to copy to the clipboard
 */
export function copyToClipboard(copyText) {
  navigator.clipboard.writeText(copyText).then(() => {
    console.log('Raw text copied:', copyText);
  });
}
