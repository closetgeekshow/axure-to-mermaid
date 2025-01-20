import { loadDependencies } from './utils/dependencies.js';
import { AxureToMermaid } from './index';

/**
 * Initializes the AxureToMermaid application after loading dependencies
 * @async
 * @function initialize
 */
async function initialize() {
    await loadDependencies();
    window.AxureToMermaid = new AxureToMermaid();
}

initialize().catch(console.error);