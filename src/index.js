import { Toolbar } from './components/Toolbar.js';
import { SitemapProcessor } from './components/SitemapProcessor.js';
import { loadDependencies } from './utils/dependencies.js';


export class AxureToMermaid {
  constructor() {
    this.init();
  }

  async init() {
    await loadDependencies();
    
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