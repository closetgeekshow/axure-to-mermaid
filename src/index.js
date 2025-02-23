"use strict";

import { loadDependencies } from "./config/constants.js";
import { createAxureToMermaid } from "./components/AxureToMermaid.js";
import { notify } from "./utils/dom.js";
import { createToolbar } from "./components/Toolbar.js";

async function initialize() {
  try {
    await loadDependencies();
    const axureToMermaid = await createAxureToMermaid().initialize();
    const toolbar = createToolbar(axureToMermaid.processor);
    window.AxureToMermaid = axureToMermaid;
  } catch (error) {
    notify.error('Initialization failed', error.message);
  }
}

initialize();
