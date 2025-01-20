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
    
    // Fix: Pass project name directly to SitemapProcessor
    this.processor = new SitemapProcessor(project.name);
    
    // Fix: Pass processor and sitemap array correctly to Toolbar
    this.toolbar = new Toolbar(
      this.processor,
      $axure.document.sitemap.rootNodes
    );
  }
}