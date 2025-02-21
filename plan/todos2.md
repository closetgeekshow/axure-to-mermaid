### **Final Specification Document**

* * *

**Axure-to-Mermaid Bookmarklet - Developer Specification**
==========================================================

### **Project Overview**

The **Axure-to-Mermaid Bookmarklet** extracts **Axure RP sitemaps** and converts them into **Mermaid.js diagrams** for easy visualization. It is designed as a **self-contained bookmarklet**, ensuring it works in any browser session.

* * *

**Technical Requirements**
--------------------------

### **1\. Bookmarklet Requirements**

*   The final script must be **a single minified JavaScript file**.
*   **No external asset hosting** (CSS, SVGs, or HTML must be inlined).
*   **CDN dependencies are allowed** for third-party libraries.

### **2\. Development Workflow**

*   The script must function **unbuilt** for easier development.
*   Asset handling must support both **development mode (direct file loading)** and **built mode (inlined assets)**.

### **3\. Code Structure & Files**



`src/
    components/     
        Toolbar.js     
        SitemapProcessor.js
        ButtonFactory.js
    config/
        buttonConfig.js
        constants.js     
        embeddedAssets.js   
    utils/     
        dom.js     
        mermaidUtils.js   
    assets/     
        toolbar.css     
        fallback.css   
        index.js
        inject.js
    build/   
        embedAssets.js
        processBookmarklet.js`

### **4\. Build & Deployment**

#### **Package Scripts**

json

CopyEdit

`"scripts": {   "prebundle": "node ./build/embedAssets.js",   "bundle": "esbuild ./src/inject.js --bundle --outfile=./dist/axure-to-mermaid.bundle.js",   "bookmarklet": "node ./build/processBookmarklet.js ./dist/axure-to-mermaid.bundle.js ./dist/axure-to-mermaid.bookmarklet.js",   "build": "npm run prebundle && npm run bundle && npm run bookmarklet && npm run size-report",   "size-report": "ls -lh ./dist | awk 'BEGIN {print \"Size\\tFile\\n----\\t----\"} NR>1 {print $5\"\\t\"$9}' | column -t" }`

* * *

**Architecture Choices**
------------------------

### **1\. Asset Handling & Transclusion**

*   **CSS, SVG, and HTML files** are transcluded via `embedAssets.js`.
*   `embeddedAssets.js` dynamically loads assets:
    *   **Built mode**: Uses inlined assets from `embeddedAssetsGenerated.js`.
    *   **Unbuilt mode**: Loads assets from `src/assets/` via `fs.readFileSync()`.

### **2\. Toolbar UI Rendering**

*   Uses **Shadow DOM** for CSS isolation.
*   **ButtonFactory.js** generates toolbar buttons dynamically.
*   **Event delegation** minimizes event listeners.

### **3\. Processing Logic**

*   **SitemapProcessor.js** converts Axure sitemaps into a structured format.
*   **MermaidUtils.js** serializes the processed sitemap into Mermaid.js syntax.

### **4\. Dependency Injection for Flexibility**

*   `AxureToMermaid.create({ sitemapArray, toolbarFactory })` allows custom toolbar implementations.

* * *

**Data Handling & Processing**
------------------------------

### **1\. Sitemap Processing**

javascript

CopyEdit

`class SitemapProcessor {   initialize(nodes) {     if (this.#processedNodes) return this.#processedNodes; // Cache processed nodes     this.#processedNodes = this.processSitemap(nodes);     return this.#processedNodes;   } }`

*   **Uses caching** to avoid redundant computation.
*   **Efficient node lookups** using a `Map`.

### **2\. Exporting Mermaid Data**

javascript

CopyEdit

`export async function serializeMermaid(mermaidText) {   await ensureDependencies();   const json = JSON.stringify({ code: mermaidText, theme: "default" });   const compressed = pako.deflate(new TextEncoder().encode(json), { level: 9 });   return Base64.fromUint8Array(compressed, true); }`

*   **Compressed & Base64-encoded output** for smaller URLs.
*   **Direct exports to TXT, PNG, SVG**.

* * *

**Error Handling Strategy**
---------------------------

### **1\. Development & Build Errors**

*   If `embeddedAssetsGenerated.js` is missing, it logs a warning but does not break.
*   If an asset file fails to load, it prints a **console error**.

### **2\. Runtime Errors**

javascript

CopyEdit

`try {   const sitemapArray = top?.$axure?.document?.sitemap?.rootNodes;   if (!sitemapArray) throw new Error("Axure sitemap is unavailable."); } catch (error) {   console.error("Failed to initialize AxureToMermaid:", error); }`

*   **Graceful fallback** if Axure document is not available.
*   **Prevents hard crashes** while debugging.

* * *

**Performance Optimizations**
-----------------------------

*   **Batch DOM updates** using `DocumentFragment` for toolbar rendering.
*   **Uses Maps instead of arrays** for sitemap lookups.
*   **Debounced event listeners** in the toolbar to avoid excessive reflows.

* * *

**Next Steps for Development**
------------------------------

1.  Implement `embedAssets.js` for CSS transclusion.
2.  Update `Toolbar.js` to dynamically load styles from embedded assets.
3.  Verify **unbuilt mode support** with direct file access.
4.  Test bookmarklet generation and final payload size.

* * *

### **Final Thoughts**

This specification ensures the **bookmarklet is fully self-contained**, **flexible**, and **optimized for performance** while still being **developer-friendly for editing**. Would you like any adjustments before finalizing?