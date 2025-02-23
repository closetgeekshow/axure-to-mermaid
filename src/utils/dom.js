/**
 * @file DOM utility functions for element creation and clipboard operations
 * @module DOMUtils
 * @requires mermaidStore
 */

import { mermaidStore } from "../store/MermaidStore.js";

/**
 * An object containing common ARIA role values for HTML elements.
 * @type {Object<string, string>}
 */
const ARIA_ROLES = {
  button: 'button',
  img: 'img',
  alert: 'alert',
  dialog: 'dialog'
};

/**
 * Creates a new HTML element with the specified type, text content, and properties.
 * @param {string} elementType - The type of HTML element to create (e.g. 'div', 'button', 'img').
 * @param {string} [textContent=''] - The text content to set on the element.
 * @param {Object} [props={}] - An object of properties to set on the element.
 * @param {Object} [props.style] - An object of CSS styles to apply to the element.
 * @param {Object} [props.dataset] - An object of data attributes to set on the element.
 * @param {Object} [props.aria] - An object of ARIA attributes to set on the element.
 * @param {Object} [props.events] - An object of event listeners to add to the element.
 * @returns {HTMLElement} The created HTML element.
 */
export function createElement(elementType, textContent = "", props = {}) {
  const element = document.createElement(elementType);
  
  if (textContent) {
    const textNode = document.createTextNode(textContent);
    element.appendChild(textNode);
  }

  Object.entries(props).forEach(([key, value]) => {
    if (key === "style" && typeof value === "object") {
      Object.assign(element.style, value);
    } else if (key === "dataset" && typeof value === "object") {
      Object.assign(element.dataset, value);
    } else if (key === "aria" && typeof value === "object") {
      Object.entries(value).forEach(([ariaKey, ariaValue]) => {
        element.setAttribute(`aria-${ariaKey}`, ariaValue);
      });
    } else if (key === "events" && typeof value === "object") {
      Object.entries(value).forEach(([event, handler]) => {
        element.addEventListener(event, handler);
      });
    } else {
      element[key] = value;
    }
  });

  return element;
}

/**
 * Creates an HTML `span` element that will contain SVG content loaded from the specified URL.
 * @param {string} url - The URL of the SVG content.
 * @param {string} [alt=''] - The alternative text for accessibility.
 * @param {string} [className=''] - The CSS class name to apply to the span.
 * @returns {HTMLSpanElement} The created span element.
 * @todo handle icon url injection
 */
export function createIconEl(url, alt = "", className = "") {
  return createElement("img", "", {
    src: url,
    className,
    alt,
    role: ARIA_ROLES.img,
    aria: {
      label: alt,
      hidden: !alt
    }
  });
}
/**
 * Copies the specified text to the clipboard
 * @function copyToClipboard
 * @param {string} copyText - The text to copy to the clipboard
 */
export function copyToClipboard() {
  return navigator.clipboard
    .writeText(mermaidStore.getState().diagram)
    .then(() => notify.success("Copied to clipboard"))
    .catch((error) => notify.error("Copy failed", error));
}

/**
 * An object with methods for displaying success and error notifications.
 * The `success` method displays a success notification for 3 seconds, and the `error` method displays an error notification for 5 seconds.
 * Both methods log the message to the console and return a boolean value indicating the success or failure of the operation.
 */
export const notify = {
  success: (message) => {
    const notification = createElement("div", message, {
      role: ARIA_ROLES.alert,
      className: "notification success",
      aria: { live: "polite" }
    });
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
    console.log(message);
    return true;
  },
  
  error: (type, error) => {
    const message = `Failed to ${type}: ${error.message}`;
    const notification = createElement("div", message, {
      role: ARIA_ROLES.alert,
      className: "notification error",
      aria: { live: "assertive" }
    });
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
    console.error(message);
    return false;
  }
};

/**
 * Removes an element from the DOM and cleans up any associated event listeners.
 * @param {HTMLElement} element - The element to be removed from the DOM.
 */
export function cleanup(element) {
  if (!element) return;
  
  // Remove event listeners
  const clone = element.cloneNode(true);
  element.parentNode?.replaceChild(clone, element);
  
  // Remove from DOM
  clone.remove();
}