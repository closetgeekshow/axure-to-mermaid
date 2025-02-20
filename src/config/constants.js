/**
 * URLs of required external JavaScript libraries
 * @constant {string[]}
 */
export const DEPENDENCIES = [
  "https://cdn.jsdelivr.net/npm/pako@2.1.0/dist/pako.min.js",
  "https://cdn.jsdelivr.net/npm/js-base64@3.7.5/base64.min.js",
];

export const baseCSS = `
:host {position: fixed;bottom: 2vh;right: 2vw;padding: 10px;z-index: 1000;display: flex;gap: 3ch;}
.toolbar { visibility: hidden;position: fixed;display: flex;flex-direction: row;bottom: 2vh;right: 2vw;padding: 10px;z-index: 1000;gap: 3ch;}
.group {display: flex; flex-direction: column; align-items: center; font-size: .875rem; gap: .25rem;}
.btnContainer {display: flex;gap: .125rem;}
.close {height: 2rem;width: 2rem;display: flex;align-items: center;justify-content: center;margin: auto 0;padding: 0}
`;
export const fallbackCSS = `
:host {background-color: #f0f0f0;border: 1px solid #ccc;}
`;

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
      const script = document.createElement("script");
      script.type = "text/javascript";
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
    const loadPromises = DEPENDENCIES.map((dep) => loadScript(dep));
    await Promise.all(loadPromises);
  } catch (error) {
    console.error("Failed to load dependencies:", error);
    throw error;
  }
}
