import { RETRY } from "./config/constants.js";
import { loadDependencies } from "./utils/dependencies.js";
import { AxureToMermaid } from "./index.js";

/**
 * Initializes the AxureToMermaid application after loading dependencies
 * @async
 * @function initialize
 */
async function initialize() {
  await loadDependencies();
  window.AxureToMermaid = new AxureToMermaid();
}

let retryCount = 0;

async function preInit() {
  while (retryCount < RETRY.maxTries) {
    if (typeof top.$axure !== "undefined" && top.$axure.document) {
      initialize().catch(console.error);
      return;
    }

    console.warn("axure.document not ready.", "try: ", ++retryCount);

    // Convert setTimeout to a Promise-based delay
    await new Promise((resolve) => setTimeout(resolve, RETRY.interval));
  }

  console.error("axure init failed");
}

preInit();
