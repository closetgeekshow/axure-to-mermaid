/**
 * @file Handles loading of external JavaScript dependencies
 * @module DependenciesLoader
 * @requires DEPENDENCIES
 */

import { DEPENDENCIES } from '../config/constants.js';

/**
 * Loads all external dependencies specified in the configuration
 * @async
 * @function loadDependencies
 * @returns {Promise<void>}
 */
export async function loadDependencies() {
    for (const dep of DEPENDENCIES) {
        await loadScript(dep);
    }
}

/**
 * Dynamically loads a script into the document
 * @function loadScript
 * @param {string} url - The URL of the script to load
 * @returns {Promise<void>}
 */
function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}