"use strict";

import { loadDependencies } from "./config/constants.js";
import { AxureToMermaid } from "./components/AxureToMermaid.js";
import { notify } from "./utils/dom.js";
import { Toolbar } from "./components/Toolbar.js";

async function initialize() {
  try {
    await loadDependencies();
    window.AxureToMermaid = await AxureToMermaid.create({
      toolbarFactory: new Toolbar()
    });
  } catch (error) {
    notify.error('Initialization failed', error.message);
  }
}
// Start initialization
initialize();
