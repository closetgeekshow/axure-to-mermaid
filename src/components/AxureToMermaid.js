import { SitemapProcessor } from "./SitemapProcessor.js";
import { EventEmitter } from "../utils/EventEmitter.js";

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

  static async waitForAxureDocument(timeout = 10000) {
    if (top?.$axure?.document) return;

    const observerPromise = new Promise((resolve) => {
      const observer = new MutationObserver((_, obs) => {
        if (top?.$axure?.document) {
          obs.disconnect();
          resolve();
        }
      });
      observer.observe(document, { childList: true, subtree: true });
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout waiting for axure.document")), timeout)
    );

    return Promise.race([observerPromise, timeoutPromise]);
  }

  static async getSitemapArray() {
    await this.waitForAxureDocument();
    return top?.$axure?.document?.sitemap?.rootNodes;
  }

  static async create(config = {}) {
    const deps = {
      processor: config.processor || new SitemapProcessor(), // Ensure processor is created
      sitemapArray: config.sitemapArray || await this.getSitemapArray(),
      toolbarFactory: config.toolbarFactory,
      eventBus: config.eventBus
    };
    const instance = new AxureToMermaid(deps);
    await instance.initialize();
    return instance;
  }

  async initialize() {
    if (!this.sitemapArray) {
      throw new Error('Sitemap array is required for initialization');
    }
    await this.processor.initialize(this.sitemapArray);
    
    if (this.toolbarFactory) {
      this.toolbarFactory.processor = this.processor;
      this.toolbarFactory.sitemapArray = this.sitemapArray;
    }
    return this;
  }
}