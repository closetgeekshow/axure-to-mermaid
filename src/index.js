import {notify} from './utils/dom.js'
import { SitemapProcessor } from './components/SitemapProcessor.js';
import { EventEmitter } from './utils/EventEmitter.js';
import { loadDependencies } from './config/constants.js';

/**
 * @class AxureToMermaid
 * @description Initializes the Axure to Mermaid conversion process
*/
export class AxureToMermaid {
  constructor(deps = {}) {
    this.processor = deps.processor || new SitemapProcessor();
    this.sitemapArray = deps.sitemapArray;
    this.toolbarFactory = deps.toolbarFactory;
    this.eventBus = deps.eventBus || new EventEmitter();
  }

  static async getSitemapArray() {
    return top?.$axure?.document?.sitemap?.rootNodes;
  }

  static async create(config = {}) {
    const deps = {
      processor: config.processor,
      sitemapArray: config.sitemapArray || await AxureToMermaid.getSitemapArray(),
      toolbarFactory: config.toolbarFactory,
      eventBus: config.eventBus
    };
    const instance = new AxureToMermaid(deps);
    await instance.init();
    return instance;
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
}

(function() {
  async function init() {
    try {
      await loadDependencies();
      await waitForAxureDocument();
      window.AxureToMermaid = await AxureToMermaid.create();
    } catch (error) {
      notify.error('Initialization failed', error.message);
    }
  }

  // Start initialization
  init();
})();
