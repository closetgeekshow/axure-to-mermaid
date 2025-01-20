import { Toolbar } from './components/Toolbar.js';
import { SitemapProcessor } from './components/SitemapProcessor.js';

/**
 * @class AxureToMermaid
 * @description Initializes the Axure to Mermaid conversion process
 */
export class AxureToMermaid {
  constructor() {
    this.init();
  }

  /**
   * Initializes the application by loading dependencies and setting up the toolbar
   * @private
   * @async
   */
  async init() {
    
    const project = {
      name: $axure.document.configuration.projectName,
      id: $axure.document.configuration.projectId
    };
    
    // Fix: Pass processor and sitemap array correctly to Toolbar
    this.toolbar = new Toolbar(
      new SitemapProcessor(),
      $axure.document.sitemap.rootNodes
    );
  }
}