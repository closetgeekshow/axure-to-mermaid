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
  window.AxureToMermaid = new AxureToMermaid();
}

async function waitForAxureDocument(timeout = 10000) {
  if (top?.$axure?.document) return; // Exit early if already available

  console.warn("axure.document not ready, waiting for changes.");

  // Create a promise that resolves when axure.document appears
  const observerPromise = new Promise((resolve) => {
    const observer = new MutationObserver((_, obs) => {
      if (top?.$axure?.document) {
        obs.disconnect(); // Stop observing
        resolve(); // Resolve the promise
      }
    });

    observer.observe(document, { childList: true, subtree: true });
  });

  // Create a separate promise that rejects after the timeout
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Timeout waiting for axure.document")), timeout)
  );

  // Wait for whichever happens first: observer or timeout
  return Promise.race([observerPromise, timeoutPromise]);
}

async function preInit() {
  try {
    await waitForAxureDocument();
    initialize();
  } catch (error) {
    console.error(error.message);
  }
}
