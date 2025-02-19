/**
 * @file Handles loading of external JavaScript dependencies
 * @module DependenciesLoader
 * @requires DEPENDENCIES
 */

import { DEPENDENCIES } from '../config/constants.js';

/**
 * Dynamically loads a script into the document with retry logic
 * @function loadScript
 * @param {string} url - The URL of the script to load
 * @param {number} [retries=3] - Number of retry attempts
 * @param {number} [delay=1000] - Delay between retries in milliseconds
 * @returns {Promise<void>}
 */
function loadScript(url, retries = 3, delay = 1000) {
    return new Promise((resolve, reject) => {
        const attempt = (retryCount) => {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = url;
            
            script.onload = () => resolve();
            
            script.onerror = () => {
                if (retryCount < retries) {
                    console.warn(`Failed to load ${url}, retrying...`);
                    setTimeout(() => attempt(retryCount + 1), delay);
                } else {
                    reject(new Error(`Failed to load script: ${url}`));
                }
            };
            
            document.head.appendChild(script);
        };
        
        attempt(0);
    });
}

/**
 * Loads all external dependencies specified in the configuration
 * @async
 * @function loadDependencies
 * @returns {Promise<void>}
 */
export async function loadDependencies() {
    try {
        for (const dep of DEPENDENCIES) {
            await loadScript(dep);
        }
    } catch (error) {
        console.error('Failed to load dependencies:', error);
        throw error; // Re-throw to allow caller to handle the error
    }
}