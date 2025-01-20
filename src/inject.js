import { loadDependencies } from './utils/dependencies.js';
import { AxureToMermaid } from './index';

async function initialize() {
    await loadDependencies();
    new AxureToMermaid();
}

initialize().catch(console.error);
