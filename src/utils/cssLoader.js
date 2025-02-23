export class CSSLoader {
  static loadedStyles = new Set();
  
  static async load(cssUrls, options = {}) {
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

      document.head.appendChild(link);
      
      try {
        await Promise.race([loadPromise, timeoutPromise]);
      } catch (error) {
        link.remove();
        if (fallback) {
          const style = document.createElement('style');
          style.textContent = fallback;
          document.head.appendChild(style);
        }
        throw error;
      }
    };

    const loadMethod = parallel ? Promise.all : this.loadSequential;
    return loadMethod(cssUrls.map(url => loadStyle(url)));
  }

  static async loadSequential(promises) {
    const results = [];
    for (const promise of promises) {
      results.push(await promise);
    }
    return results;
  }

  static unload(url) {
    const links = document.querySelectorAll(`link[href="${url}"]`);
    links.forEach(link => link.remove());
    this.loadedStyles.delete(url);
  }

  static unloadAll() {
    this.loadedStyles.forEach(url => this.unload(url));
    this.loadedStyles.clear();
  }
}