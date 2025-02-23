/**
 * Provides a utility for loading CSS stylesheets dynamically.
 *
 * The `CSSLoader` class allows you to load CSS stylesheets from remote URLs, with options for handling timeouts, parallel/sequential loading, and fallback styles.
 *
 * The `load` method takes an array of CSS URLs and an optional options object with the following properties:
 *
 * - `timeout`: The maximum time (in milliseconds) to wait for a CSS file to load before considering it a failure.
 * - `parallel`: A boolean indicating whether to load the CSS files in parallel (true) or sequentially (false).
 * - `fallback`: An optional CSS string to use as a fallback if a CSS file fails to load.
 *
 * The `unload` method can be used to remove a specific CSS file from the page, and `unloadAll` can be used to remove all dynamically loaded CSS files.
 */
export class CSSLoader {
  static loadedStyles = new Set();
  
  /**
   * Loads an array of CSS URLs with optional configuration options.
   *
   * @param {string[]} cssUrls - An array of CSS file URLs to load.
   * @param {Object} [options] - An optional configuration object.
   * @param {number} [options.timeout=5000] - The maximum time (in milliseconds) to wait for a CSS file to load before considering it a failure.
   * @param {boolean} [options.parallel=true] - A boolean indicating whether to load the CSS files in parallel (true) or sequentially (false).
   * @param {string} [options.fallback=null] - An optional CSS string to use as a fallback if a CSS file fails to load.
   * @returns {Promise<void>} - A promise that resolves when all CSS files have been loaded or an error has occurred.
   */
  static async load(cssUrls, options = {}, target = document.head) {
    const {
      timeout = 5000,
      parallel = true,
      fallback = null
    } = options;

    const loadStyle = async (url) => {
      if (this.loadedStyles.has(url)) {
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;

      const loadPromise = new Promise((resolve, reject) => {
        link.onload = () => {
          this.loadedStyles.add(url);
          resolve();
        };
        link.onerror = () => reject(new Error(`Failed to load CSS: ${url}`));
      });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Timeout loading CSS: ${url}`)), timeout)
      );

      // Append to the provided target directly
      target.appendChild(link);
      
      try {
        await Promise.race([loadPromise, timeoutPromise]);
      } catch (error) {
        link.remove();
        if (fallback) {
          const style = document.createElement('style');
          style.textContent = fallback;
          target.appendChild(style);
        }
        throw error;
      }
    };

    const promises = cssUrls.map(url => loadStyle(url));
    return parallel ? Promise.all(promises) : this.loadSequential(promises);
  }

  /**
   * Executes a sequence of promises and returns the results.
   *
   * This method is used to load CSS files sequentially, rather than in parallel.
   * It iterates over the provided promises and awaits each one, collecting the
   * results in an array.
   *
   * @param {Promise[]} promises - An array of promises to execute sequentially.
   * @returns {Promise<any[]>} - A promise that resolves to an array of the results
   *   from each promise in the input array.
   */
  static async loadSequential(promises) {
    const results = [];
    for (const promise of promises) {
      results.push(await promise);
    }
    return results;
  }

  /**
   * Unloads a CSS file from the document.
   *
   * This method removes all `<link>` elements with the specified `href` attribute
   * from the document's `<head>` section, and removes the URL from the
   * `loadedStyles` set.
   *
   * @param {string} url - The URL of the CSS file to unload.
   */
  static unload(url) {
    const links = document.querySelectorAll(`link[href="${url}"]`);
    links.forEach(link => link.remove());
    this.loadedStyles.delete(url);
  }

  /**
   * Unloads all CSS files that have been loaded using this class.
   *
   * This method removes all `<link>` elements that were previously added to the
   * document's `<head>` section, and clears the `loadedStyles` set to indicate
   * that no CSS files are currently loaded.
   */
  static unloadAll() {
    this.loadedStyles.forEach(url => this.unload(url));
    this.loadedStyles.clear();
  }
}