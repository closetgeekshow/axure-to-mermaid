import { loadDependencies } from './utils/dependencies.js';
import { AxureToMermaid } from './index';

/**
 * Initializes the AxureToMermaid application after loading dependencies
 * @async
 * @function initialize
 */
async function initialize() {
    await loadDependencies();
    new AxureToMermaid();
}

initialize().catch(console.error);