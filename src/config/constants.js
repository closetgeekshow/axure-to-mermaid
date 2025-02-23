/**
 * URLs of required external JavaScript libraries
 * @constant {Object}
 */
export const CDN = {
  BASE: "https://cdn.jsdelivr.net/npm/",
  DEPENDENCIES: [
    "pako@2.1.0/dist/pako.min.js",
    "js-base64@3.7.5/base64.js",
  ]
};

export const CSS = {
  base: `
    
    .toolbar { 
      visibility: hidden;
      position: fixed;
      display: flex;
      flex-direction: row;
      bottom: 1rem;
      right: 1rem;
      padding: .625rem;
      z-index: 1000;
      gap: .5rem;
    }
    .group {
      display: flex; 
      align-items: center;
      font-size: .875rem;
      border-right: 1px solid rgba(0,0,0,0.8);
      padding-right: .5rem;
    }
    .group:last-child {
      border-right: none;
      padding-right: 0;
    }
    .group > span {
      display: none;
    }
    .btnContainer {
      display: flex;
      align-item: center;
      gap: .125rem;
    }
    .close {
      height: 1.5rem;
      width: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: auto 0;
      padding: 0;
    }
    .button-icon {
      filter: brightness(0) saturate(100%) invert(1);
      width: 1.5rem;
      height: 1.5rem;
      vertical-align: middle;
    }
    .icon-container {
      display: flex;
      gap: .25rem;
      align-items: center;
    }
    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: .375rem;
      min-height: 2rem;
    }
  `,
  fallback: `:host {
    background-color: #f0f0f0;
    border: 1px solid #ccc;
  }`
};

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
      script.onload = resolve;
      script.onerror = () => {
        if (retryCount < retries) {
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
    const loadPromises = CDN.DEPENDENCIES.map(dep => loadScript(CDN.BASE + dep));
    await Promise.all(loadPromises);
  } catch (error) {
    console.error("Failed to load dependencies:", error);
    throw error;
  }
}