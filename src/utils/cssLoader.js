export class CSSLoader {
  static async load(cssUrls) {
    const links = cssUrls.map(url => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      return new Promise((resolve, reject) => {
        link.onload = resolve;
        link.onerror = reject;
        document.head.appendChild(link);
      });
    });
    return Promise.all(links);
  }
}
