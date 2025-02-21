import { Toolbar } from './components/Toolbar.js';
import { SitemapProcessor } from './components/SitemapProcessor.js';

/**
 * @class AxureToMermaid
 * @description Initializes the Axure to Mermaid conversion process
 */
export class AxureToMermaid {
  constructor(processor, sitemapArray) {
    this.processor = processor;
    this.sitemapArray = sitemapArray;
    this.toolbar = null;
    this.processedNodes = null; // Store processed nodes
  }

  static async create() {
    const processor = new SitemapProcessor();
    const sitemapArray = top?.$axure?.document?.sitemap?.rootNodes;
    const instance = new AxureToMermaid(processor, sitemapArray);
    await instance.init();
    return instance;
  }

  async init() {
    // Process nodes once during initialization
    this.processedNodes = this.processor.initialize(this.sitemapArray);
    this.toolbar = new Toolbar(this.processor, this.sitemapArray, this.processedNodes);
  }
}
// Usage:
const axureToMermaid = await AxureToMermaid.create();