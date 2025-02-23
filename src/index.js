/**
 * Initializes the Axure to Mermaid application.
 * 
 * This function loads external dependencies, creates the core Axure to Mermaid component, and sets up the toolbar and event bus.
 * It also exposes the Axure to Mermaid API for external usage and emits an 'app:ready' event when initialization is successful.
 * If an error occurs during initialization, it emits an 'app:error' event and displays an error notification.
 */
"use strict";

import { loadDependencies } from "./config/constants.js";
import { EventEmitter } from "./utils/EventEmitter.js";
import { mermaidStore } from "./store/MermaidStore.js";
import { createAxureToMermaid } from "./components/AxureToMermaid.js";
import { notify } from "./utils/dom.js";
import { createToolbar } from "./components/Toolbar.js";

const eventBus = EventEmitter.default;

/**
 * Initializes the Axure to Mermaid application.
 * 
 * This function loads external dependencies, creates the core Axure to Mermaid component, and sets up the toolbar and event bus.
 * It also exposes the Axure to Mermaid API for external usage and emits an 'app:ready' event when initialization is successful.
 * If an error occurs during initialization, it emits an 'app:error' event and displays an error notification.
 */
async function initialize() {
  try {
    // Load external dependencies first
    await loadDependencies();

    // Initialize core application with event bus
    const axureToMermaid = await createAxureToMermaid({
      eventBus, mermaidStore
    }).initialize();

    // Create toolbar with processor reference
    const toolbar = createToolbar(axureToMermaid.processor);

    // Register cleanup handlers
    window.addEventListener('unload', () => {
      toolbar.unload();
      eventBus.dispose();
    });

    // Expose API for external usage
    window.AxureToMermaid = {
      ...axureToMermaid,
      toolbar
    };

    // Notify successful initialization
    eventBus.emit('app:ready', { processor: axureToMermaid.processor });

  } catch (error) {
    notify.error('Initialization failed', error);
    eventBus.emit('app:error', error);
  }
}

initialize();
