"use strict";

import { loadDependencies } from "./config/constants.js";
import { AxureToMermaid } from "./index.js";



/**
 * Initializes the AxureToMermaid application after loading dependencies
 * @async
 * @function initialize
 */
async function initialize() {
  await loadDependencies();
  
  try {
    await observerPromise;
    window.AxureToMermaid = await AxureToMermaid.create();
  } catch (error) {
    notify.error('Axure document not found', 'Please ensure you are on an Axure prototype and you are inside the prototype player');
  }
}
