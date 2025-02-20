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
  }

  static async create() {
    const processor = new SitemapProcessor();
    const sitemapArray = top?.$axure?.document?.sitemap?.rootNodes;
    const instance = new AxureToMermaid(processor, sitemapArray);
    await instance.init();
    return instance;
  }

  async init() {
    this.toolbar = new Toolbar(this.processor, this.sitemapArray);
  }
}

// Usage:
const axureToMermaid = await AxureToMermaid.create();