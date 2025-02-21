# 1. Maintainability & Scalability
## a. Separate CSS Files
Instead of embedding CSS strings in your JavaScript, create dedicated CSS files. For example:

### File: src/styles/toolbar.css

```css
.toolbar {
  visibility: hidden;
  position: fixed;
  display: flex;
  flex-direction: row;
  bottom: 1rem;
  right: 1rem;
  padding: 0.625rem;
  z-index: 1000;
  gap: 0.5rem;
}

.group {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  border-right: 1px solid rgba(0,0,0,0.8);
  padding-right: 0.5rem;
}

.group:last-child {
  border-right: none;
  padding-right: 0;
}

.group > span {
  display: none;
}

.btnContainer {
  display: flex;
  align-items: center;
  gap: 0.125rem;
}

.close {
  height: 1.5rem;
  width: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: auto 0;
  padding: 0;
}

.button-icon {
  width: 1.5rem;
  height: 1.5rem;
  vertical-align: middle;
}

.icon-container {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.375rem;
  min-height: 2rem;
}
```

### File: src/styles/fallback.css

```css
:host {
  background-color: #f0f0f0;
  border: 1px solid #ccc;
}
```

Then in your Toolbar code, update the CSS loading to simply insert link tags that point to these files instead of embedding styles directly.

For example, in Toolbar.js:

```css
import { MATCHA_CSS_URL, FALLBACK_CSS_URL } from "../config/urls.js";
// ...
loadCSSInShadow() {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = MATCHA_CSS_URL; // Now loaded from your config
  link.onload = () => {
    this.toolbar.style.visibility = "visible";
  };
  link.onerror = () => {
    console.error("Failed to load CSS, using fallback styles");
    const fallbackLink = document.createElement("link");
    fallbackLink.rel = "stylesheet";
    fallbackLink.href = FALLBACK_CSS_URL;
    this.shadow.appendChild(fallbackLink);
  };
  this.shadow.appendChild(link);
}
```

## c. Modularize Toolbar’s Button Creation
Extract button creation into its own module to reduce complexity in Toolbar.js.

### File: src/components/ButtonFactory.js

```js
import { createElement } from "../utils/dom.js";

/**
 * Creates toolbar buttons based on the provided configuration and action handlers.
 * @param {Object} buttonConfig - The configuration for button groups and buttons.
 * @param {Object} actionHandlers - An object mapping action names to functions.
 * @param {string} closeIconSrc - The URL for the close icon.
 * @returns {DocumentFragment} A fragment containing the buttons.
 */
export function createToolbarButtons(buttonConfig, actionHandlers, closeIconSrc) {
  const fragment = document.createDocumentFragment();

  // Create button groups
  buttonConfig.groups.forEach((group) => {
    const groupEl = createElement("div", "", { className: "group" });
    groupEl.appendChild(createElement("span", group.label));
    const buttonContainer = createElement("div", "", { className: "btnContainer" });
    group.buttons.forEach((button) => {
      const buttonEl = createElement("button", "", {
        disabled: group.type !== "generate",
        dataset: { buttonType: group.type },
        onclick: () => actionHandlers[button.action](),
        ariaLabel: button.text,
      });
      buttonEl.classList.add("fg-muted");
      const iconContainer = createElement("span", "", { className: "icon-container" });
      button.icons.forEach(iconUrl => {
        const iconEl = createElement("img", "", {
          src: iconUrl,
          alt: "",
          className: "button-icon",
        });
        iconContainer.appendChild(iconEl);
      });
      buttonEl.appendChild(iconContainer);
      buttonContainer.appendChild(buttonEl);
    });
    groupEl.appendChild(buttonContainer);
    fragment.appendChild(groupEl);
  });

  // Create close button
  const closeContainer = createElement("span", "", { className: "icon-container" });
  const closeButton = createElement("button", "", {
    className: "close fg-muted",
    onclick: () => actionHandlers.handleClose && actionHandlers.handleClose(),
    ariaLabel: "Close toolbar",
  });
  const closeIcon = createElement("img", "", {
    src: closeIconSrc,
    alt: "",
    className: "button-icon",
  });
  closeContainer.appendChild(closeIcon);
  closeButton.appendChild(closeContainer);
  fragment.appendChild(closeButton);
  
  return fragment;
}
```

Then, in your Toolbar.js file, import and use this factory:

```js
import { createToolbarButtons } from "./ButtonFactory.js";
import { buttonConfig } from "../config/buttonConfig.js";
import { closeIcon } from "../config/buttonConfig.js"; // or from a separate config if desired

// ...

constructor(processor, sitemapArray) {
  this.processor = processor;
  this.sitemapArray = sitemapArray;
  this.currentMermaidText = "";
  this.container = createElement("div", "", { id: "xaxGeneric" });
  this.shadow = this.container.attachShadow({ mode: "open" });
  this.loadCSSInShadow();
  this.toolbar = createElement("div", "", { className: "toolbar bd-default bg-muted" });
  
  // Batch DOM updates using a DocumentFragment
  const buttonsFragment = createToolbarButtons(buttonConfig, this.getActionHandlers(), closeIcon);
  this.toolbar.appendChild(buttonsFragment);
  this.shadow.appendChild(this.toolbar);
  document.body.appendChild(this.container);
}
```

## d. Dependency Injection
Modify the main class to accept its dependencies rather than reaching out to globals. For example, update AxureToMermaid to take injected parameters:

### File: src/index.js

```js
import { Toolbar } from './components/Toolbar.js';
import { SitemapProcessor } from './components/SitemapProcessor.js';

export class AxureToMermaid {
  /**
   * @param {Object} deps - The dependencies to inject.
   * @param {SitemapProcessor} deps.processor - The sitemap processor.
   * @param {Array} deps.sitemapArray - The sitemap nodes.
   * @param {Function} [deps.toolbarFactory] - Optional custom toolbar factory function.
   */
  constructor({ processor, sitemapArray, toolbarFactory } = {}) {
    this.processor = processor;
    this.sitemapArray = sitemapArray;
    this.toolbarFactory = toolbarFactory;
    this.toolbar = null;
    this.processedNodes = null;
  }
  /**
   * Creates an instance of AxureToMermaid.
   * @param {Object} deps - Dependencies for the instance.
   */
  static async create(deps = {}) {
    const processor = new SitemapProcessor();
    // Prefer injected sitemapArray; fallback to global Axure document
    const sitemapArray = deps.sitemapArray || top?.$axure?.document?.sitemap?.rootNodes;
    const instance = new AxureToMermaid({ processor, sitemapArray, toolbarFactory: deps.toolbarFactory });
    await instance.init();
    return instance;
  }
  async init() {
    // Cache the processed nodes (see Performance Enhancements below)
    this.processedNodes = this.processor.initialize(this.sitemapArray);
    // Use injected toolbarFactory if available
    this.toolbar = this.toolbarFactory 
      ? this.toolbarFactory(this.processor, this.sitemapArray) 
      : new Toolbar(this.processor, this.sitemapArray);
  }
}
```

Then, in your inject.js, you would pass in any dependencies explicitly:

```js
import { loadDependencies } from "./config/constants.js";
import { AxureToMermaid } from "./index.js";

// Optionally, pass a custom toolbar factory if needed
async function initialize() {
  await loadDependencies();
  const instance = await AxureToMermaid.create({
    sitemapArray: top?.$axure?.document?.sitemap?.rootNodes,
    // Optionally, you could inject a custom toolbarFactory here
  });
  window.AxureToMermaid = instance;
}
```

# 2. Readability
## a. renaming
 in Toolbar.js rename methods for clarity:

Before:

```js
handleAllClick() {
  mermaidStore.setText(this.processor.generateMermaidMarkup());
  this.enableExportButtons();
}
```
After:

```js
/**
 * Generates a full sitemap Mermaid diagram and enables export buttons.
 */
generateFullSitemap() {
  mermaidStore.setText(this.processor.generateMermaidMarkup());
  this.enableExportButtons();
}
```

Also, rename handleStartHereClick to something like generateSubtreeSitemap for consistency.

## b. Remove Unnecessary Try-Catch Blocks
For instance, if error handling in createElement is not needed beyond what the browser already does, you can simplify it:

Before in dom.js:

```js
export function createElement(elementType, textContent = "", props = {}) {
  if (!elementType) {
    throw new Error("createElement requires element type");
  }
  try {
    const element = document.createElement(elementType);
    element.textContent = textContent;
    Object.entries(props).forEach(([key, value]) => { /* ... */ });
    return element;
  } catch (error) {
    console.error(`Failed to create ${elementType} element:`, error);
    throw error;
  }
}
```
After:

```js
/**
 * Creates an element with the specified type, text content, and properties.
 * @param {string} elementType - The HTML tag to create.
 * @param {string} [textContent=""] - Text content for the element.
 * @param {Object} [props={}] - Additional properties to set on the element.
 * @returns {HTMLElement} The created element.
 */
export function createElement(elementType, textContent = "", props = {}) {
  if (!elementType) {
    throw new Error("createElement requires an element type");
  }
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
}
```
Note: Removing the try-catch here is safe because errors from DOM creation are rare and will naturally propagate.

# 3. Performance Enhancements
## a. Cache Processed Nodes
In the SitemapProcessor, check if the nodes have already been processed before reprocessing:

```js
initialize(nodes) {
  if (this.#processedNodes) return this.#processedNodes; // Cached value returned
  this.#processedNodes = this.processSitemap(nodes);
  this.#processedNodes.forEach(node => this.#nodeMap.set(node.id, node));
  return this.#processedNodes;
}
```
This simple change prevents repeated processing if initialize() is called more than once with the same data.

## b. Batch DOM Updates in Toolbar
When creating the toolbar UI, use a DocumentFragment to collect all elements before appending them to the Shadow DOM. This is already illustrated in the new ButtonFactory.js code above. In addition, if you need to update multiple parts of the toolbar (for example, enabling multiple buttons), do so by:

Collecting all changes in a fragment or
Using a single DOM update call after making multiple modifications.
For example, instead of updating each button’s disabled property in a loop that causes reflow, you could:

```js
enableExportButtons() {
  // Batch update using forEach without immediate DOM repaint for each update
  this.#buttons.forEach(button => {
    if (button.dataset.buttonType !== "generate") {
      button.disabled = false;
    }
  });
}
```
This minimizes layout thrashing by grouping the modifications.