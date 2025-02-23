/**
 * @file DOM utility functions for element creation and clipboard operations
 * @module DOMUtils
 * @requires mermaidStore
 */

import { mermaidStore } from "../store/MermaidStore.js";

const ARIA_ROLES = {
  button: 'button',
  img: 'img',
  alert: 'alert',
  dialog: 'dialog'
};

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

export function createIconEl(url, alt = "", className = "") {
  return createElement("img", "", {
    src: url,
    className,
    alt,
    role: ARIA_ROLES.img,
    aria: {
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

export function cleanup(element) {
  if (!element) return;
  
  // Remove event listeners
  const clone = element.cloneNode(true);
  element.parentNode?.replaceChild(clone, element);
  
  // Remove from DOM
  clone.remove();
}