javascript:(() => {
  // src/config/constants.js
  var BUTTONS = {
    all: { text: "Full", type: "generate" },
    startHere: { text: "From Here", type: "generate" },
    copy: { text: "Copy", type: "copy" },
    txtDownload: { text: "TXT", type: "download" },
    svgUrl: { text: "SVG", type: "url" },
    svgDownload: { text: "SVG", type: "download" },
    pngUrl: { text: "PNG", type: "url" },
    pngDownload: { text: "PNG", type: "download" }
  };
  var LAYOUT = [
    ["Sitemap", ["all", "startHere"]],
    ["Code", ["copy"]],
    ["Download", ["txtDownload", "svgDownload", "pngDownload"]],
    ["URL", ["svgUrl", "pngUrl"]]
  ];
  var DEPENDENCIES = [
    "https://cdn.jsdelivr.net/npm/pako@2.1.0/dist/pako.min.js",
    "https://cdn.jsdelivr.net/npm/js-base64@3.7.5/base64.min.js"
  ];
  var EXTERNALCSS = ["https://matcha.mizu.sh/matcha.css"];
  var RETRY = {
    maxTries: 10,
    interval: 1e3
  };

  // src/utils/dependencies.js
  async function loadDependencies() {
    for (const dep of DEPENDENCIES) {
      await loadScript(dep);
    }
  }
  function loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = url;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // src/utils/dom.js
  function createElement(elementType, textContent = "", props = {}) {
    const element = document.createElement(elementType);
    element.textContent = textContent;
    for (const [key, value] of Object.entries(props)) {
      if (key === "style" && typeof value === "object") {
        Object.entries(value).forEach(([styleKey, styleValue]) => {
          element.style[styleKey] = styleValue;
        });
      } else if (key === "dataset" && typeof value === "object") {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          element.dataset[dataKey] = dataValue;
        });
      } else {
        element[key] = value;
      }
    }
    return element;
  }
  function copyToClipboard(copyText) {
    navigator.clipboard.writeText(copyText).then(() => {
      console.log("Raw text copied:", copyText);
    });
  }

  // src/utils/mermaidUtils.js
  function serializeMermaid(mermaidText) {
    const state = {
      code: mermaidText,
      mermaid: JSON.stringify({
        theme: "default"
      }, null, 2),
      updateEditor: true,
      autoSync: true,
      updateDiagram: true
    };
    const json = JSON.stringify(state);
    const data = new TextEncoder().encode(json);
    const compressed = pako.deflate(data, { level: 9 });
    return Base64.fromUint8Array(compressed, true);
  }

  // src/utils/exportHandlers.js
  async function handleSvgExport(mermaidText, download = false) {
    const encoded = serializeMermaid(mermaidText);
    const url = `https://mermaid.ink/svg/pako:${encoded}`;
    if (download) {
      const response = await fetch(url);
      const svgContent = await response.text();
      downloadFile(svgContent, "sitemap.svg", "image/svg+xml");
    } else {
      window.open(url, "_blank");
    }
  }
  async function handlePngExport(mermaidText, download = false) {
    const encoded = serializeMermaid(mermaidText);
    const url = `https://mermaid.ink/img/pako:${encoded}?type=png`;
    if (download) {
      const response = await fetch(url);
      const blob = await response.blob();
      downloadFile(blob, "sitemap.png", "image/png");
    } else {
      window.open(url, "_blank");
    }
  }
  function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  function handleTxtExport(mermaidText) {
    downloadFile(mermaidText, "sitemap.txt", "text/plain");
  }

  // src/components/Toolbar.js
  var Toolbar = class {
    /**
     * @constructor
     * @param {SitemapProcessor} processor - Instance of SitemapProcessor
     * @param {Array} sitemapArray - Array of sitemap nodes
     */
    constructor(processor, sitemapArray) {
      this.processor = processor;
      this.sitemapArray = sitemapArray;
      this.currentMermaidText = "";
      this.container = createElement("div", "", {
        id: "toolbar"
      });
      this.shadow = this.container.attachShadow({ mode: "open" });
      for (const css of EXTERNALCSS) {
        this.loadCSSInShadow(css);
      }
      this.toolbar = createElement("div", "", {
        className: "bd-default bg-muted",
        style: {
          position: "fixed",
          display: "flex",
          flexDirection: "row",
          bottom: "2vh",
          right: "2vw",
          padding: "10px",
          zIndex: "1000",
          gap: "3ch"
        }
      });
      this.buttons = this.createButtons();
      this.attachButtons();
      this.shadow.appendChild(this.toolbar);
      document.body.appendChild(this.container);
    }
    loadCSSInShadow(url) {
      const style = document.createElement("style");
      style.textContent = `@import "${url}";`;
      this.shadow.appendChild(style);
    }
    /**
     * @private
     * @method createButtons
     * @returns {Object.<string, HTMLButtonElement>} Map of button keys to button elements
     */
    createButtons() {
      return Object.entries(BUTTONS).reduce((buttons, [key, config]) => {
        buttons[key] = createElement("button", `${config.text}`, {
          disabled: config.type !== "generate",
          dataset: {
            buttonType: config.type
          },
          onclick: () => this.handleButtonClick(key, config.type)
        });
        buttons[key].classList.add("fg-muted");
        return buttons;
      }, {});
    }
    /**
     * @private
     * @method handleButtonClick
     * @param {string} key - Button identifier
     * @param {string} type - Button type (generate|copy|download|url)
     */
    handleButtonClick(key, type) {
      const handlers = {
        generate: {
          all: () => this.handleAllClick(),
          startHere: () => this.handleStartHereClick()
        },
        copy: {
          copy: () => {
            console.log(this.currentMermaidText);
            copyToClipboard(this.currentMermaidText);
          }
        },
        download: {
          txtDownload: () => handleTxtExport(this.currentMermaidText),
          svgDownload: () => handleSvgExport(this.currentMermaidText, true),
          pngDownload: () => handlePngExport(this.currentMermaidText, true)
        },
        url: {
          svgUrl: () => handleSvgExport(this.currentMermaidText),
          pngUrl: () => handlePngExport(this.currentMermaidText)
        }
      };
      handlers[type]?.[key]?.();
    }
    /**
     * @public
     * @method handleAllClick
     * @description Processes complete sitemap and generates Mermaid markup
     */
    handleAllClick() {
      const processedNodes = this.processor.processSitemap(this.sitemapArray);
      this.currentMermaidText = this.processor.generateMermaidMarkup(processedNodes);
      copyToClipboard(this.currentMermaidText);
      this.enableExportButtons();
    }
    /**
     * @public
     * @method handleStartHereClick
     * @description Processes sitemap from current node and generates Mermaid markup
     */
    handleStartHereClick() {
      let currentId = top.$axure.page.shortId;
      if (!currentId) {
        const parentUrlParams = new URLSearchParams(
          window.parent.location.search
        );
        currentId = parentUrlParams.get("id");
      }
      if (!currentId) {
        const pageParam = new URLSearchParams(window.parent.location.search).get(
          "p"
        );
        if (pageParam) {
          const findNodeByUrl = (nodes) => {
            for (const node of nodes) {
              if (node.url && node.url.replace(".html", "") === pageParam) {
                return node.id;
              }
              if (node.children) {
                const found = findNodeByUrl(node.children);
                if (found) {
                  return found;
                }
              }
            }
            return null;
          };
          currentId = findNodeByUrl($axure.document.sitemap.rootNodes);
        }
      }
      if (currentId) {
        const selectedNode = this.processor.findCurrentNode(
          this.sitemapArray,
          currentId
        );
        if (selectedNode) {
          const processedNodes = this.processor.processSitemap([selectedNode]);
          this.currentMermaidText = this.processor.generateMermaidMarkup(processedNodes);
          copyToClipboard(this.currentMermaidText);
          this.enableExportButtons();
        }
      }
    }
    /**
     * @public
     * @method enableExportButtons
     * @description Enables all non-generate buttons after markup generation
     */
    enableExportButtons() {
      Object.values(this.buttons).forEach((button) => {
        if (button.dataset.buttonType !== "generate") {
          button.disabled = false;
        }
      });
    }
    /**
     * @public
     * @method unload
     * @description Removes toolbar from DOM
     */
    unload() {
      this.toolbar?.parentNode?.removeChild(this.toolbar);
    }
    attachButtons() {
      LAYOUT.forEach(([label, buttonKeys]) => {
        const group = createElement("div", "", {
          style: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontSize: ".875rem",
            gap: ".25rem"
          }
        });
        const labelElement = createElement("span", label);
        group.appendChild(labelElement);
        const buttonContainer = createElement("div", "", {
          style: {
            display: "flex",
            gap: ".125rem"
          }
        });
        buttonKeys.forEach((key) => {
          buttonContainer.appendChild(this.buttons[key]);
        });
        group.appendChild(buttonContainer);
        this.toolbar.appendChild(group);
      });
      const closeButton = createElement("button", "X", {
        className: "fg-muted",
        style: {
          height: "2rem",
          width: "2rem",
          display: "flex",
          alignItems: "center",
          // Vertical center
          justifyContent: "center",
          // Horizontal center
          margin: "auto 0",
          padding: "0"
        },
        onclick: () => this.unload()
      });
      this.toolbar.appendChild(closeButton);
    }
  };

  // src/components/SitemapProcessor.js
  var SitemapProcessor = class {
    constructor() {
    }
    /**
     * Processes the sitemap nodes into a structured format
     * @public
     * @param {Array} nodes - Array of sitemap nodes
     * @param {number} [level=1] - Current depth level in the sitemap
     * @param {string|null} [parentId=null] - ID of the parent node
     * @param {Array} [result=[]] - Accumulator for processed nodes
     * @returns {Array} Processed sitemap nodes
     */
    processSitemap(nodes, level = 1, parentId = null, result = []) {
      nodes.forEach((node) => {
        const nodeId = node.id || `folder_${Math.random().toString(36).substr(2, 7)}`;
        result.push({
          id: nodeId,
          name: node.pageName,
          level,
          parentId,
          type: node.type
        });
        if (node.children) {
          this.processSitemap(node.children, level + 1, nodeId, result);
        }
      });
      return result;
    }
    /**
     * Generates Mermaid markup from processed nodes
     * @public
     * @param {Array} nodes - Array of processed sitemap nodes
     * @returns {string} Mermaid markup text
     */
    generateMermaidMarkup(nodes) {
      const lines = [
        "graph TD",
        `classDef containers fill:transparent,stroke-width:0`,
        ``
      ];
      const maxLevel = Math.max(...nodes.map((n) => n.level));
      for (let level = 1; level <= maxLevel; level++) {
        const tierNodes = nodes.filter((n) => n.level === level);
        lines.push(``);
        lines.push(`  subgraph tier${level}[" "]`);
        tierNodes.forEach((node) => {
          if (level === 1) {
            lines.push(`    ${node.id}["${node.name}"]`);
          } else {
            lines.push(`    ${node.parentId} --- ${node.id}["${node.name}"]`);
          }
        });
        lines.push(`  end`, ``);
      }
      lines.push(``);
      lines.push(
        `  class ${Array.from(
          { length: maxLevel },
          (_, i) => `tier${i + 1}`
        ).join(",")} containers`
      );
      const mermaidText = lines.join("\n");
      return mermaidText;
    }
    /**
     * Finds the current node in the sitemap
     * @public
     * @param {Array} nodes - Array of sitemap nodes
     * @param {string} currentId - ID of the current node
     * @returns {Object|null} The found node or null if not found
     */
    findCurrentNode(nodes, currentId) {
      for (const node of nodes) {
        if (node.id === currentId) return node;
        if (node.children) {
          const found = this.findCurrentNode(node.children, currentId);
          if (found) return found;
        }
      }
      return null;
    }
  };

  // src/index.js
  var AxureToMermaid = class {
    constructor() {
      this.init();
    }
    /**
     * Initializes the application by loading dependencies and setting up the toolbar
     * @private
     * @async
     */
    async init() {
      this.toolbar = new Toolbar(
        new SitemapProcessor(),
        top.$axure.document.sitemap.rootNodes
      );
    }
  };

  // src/inject.js
  async function initialize() {
    await loadDependencies();
    window.AxureToMermaid = new AxureToMermaid();
  }
  var retryCount = 0;
  async function preInit() {
    while (retryCount < RETRY.maxTries) {
      if (typeof top.$axure !== "undefined" && top.$axure.document) {
        initialize().catch(console.error);
        return;
      }
      console.warn("axure.document not ready.", "try: ", ++retryCount);
      await new Promise((resolve) => setTimeout(resolve, RETRY.interval));
    }
    console.error("axure init failed");
  }
  console.log("ding");
  preInit();
})();
