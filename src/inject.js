import { loadDependencies } from './utils/dependencies.js';
import { AxureToMermaid } from './index.js';

/**
 * Initializes the AxureToMermaid application after loading dependencies
 * @async
 * @function initialize
 */
async function initialize() {
    await loadDependencies();
    window.AxureToMermaid = new AxureToMermaid();
}

let retryCount = 0, maxRetries = 5, retryInterval = 500;

async function preInit() {
  while (retryCount < maxRetries) 
    {
      if (typeof top.$axure !== 'undefined' && top.$axure.document) {
        initialize().catch(console.error);
          return;
      }
        
      console.warn('axure.document not ready.', 'try: ', ++retryCount);
        
      // Convert setTimeout to a Promise-based delay
      await new Promise(resolve => setTimeout(resolve, retryInterval));
  }
    
  console.error('axure init failed');
}


preInit();
