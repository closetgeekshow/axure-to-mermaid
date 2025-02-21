import { buttonConfig, closeIcon } from "../config/buttonConfig.js";
import { baseCSS, fallbackCSS } from "../config/constants.js";
import { createElement, copyToClipboard } from "../utils/dom.js";
import { asFile, mermaidStore } from "../utils/mermaidUtils.js";


/**
 * @class Toolbar
 * @description Creates and manages the UI toolbar for sitemap visualization controls
 */
export class Toolbar {
  #actionHandlers = {
    handleAll: () => this.handleAllClick(),
    handleStartHere: () => this.handleStartHereClick(),
    handleCopy: () => copyToClipboard(),
    handleTxtDownload: () => asFile.txt(),
    handleSvgDownload: () => asFile.svg(true),
    handlePngDownload: () => asFile.png(true),
    handleSvgUrl: () => asFile.svg(),
    handlePngUrl: () => asFile.png(),
  };

  // Declare private field at class level
  #buttons = new Map();

  constructor(processor, sitemapArray) {
    this.processor = processor;
    this.sitemapArray = sitemapArray;
    this.currentMermaidText = "";

    this.container = createElement("div", "", {
      id: "xaxGeneric",
    });

    this.shadow = this.container.attachShadow({ mode: "open" });
    this.loadCSSInShadow("https://matcha.mizu.sh/matcha.css");

    this.toolbar = createElement("div", "", {
      className: "toolbar bd-default bg-muted",
    });

    this.toolbar.appendChild(this.createButtons());
    this.shadow.appendChild(this.toolbar);
    document.body.appendChild(this.container);
  }

  loadCSSInShadow(url) {
    // Always add base styles
    const baseStyle = document.createElement("style");
    baseStyle.textContent = baseCSS;
    this.shadow.appendChild(baseStyle);

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    link.onload = () => {
      this.toolbar.style.visibility = "visible"; // Show toolbar after CSS loads
    };
    link.onerror = () => {
      console.error("Failed to load CSS, using fallback styles");

      const fallbackStyle = document.createElement("style");
      fallbackStyle.textContent = fallbackCSS;
      this.shadow.appendChild(fallbackStyle);
    };
    this.shadow.appendChild(link);
  }

  createButtons() {
    const fragment = document.createDocumentFragment();

    buttonConfig.groups.forEach((group) => {
      const groupEl = createElement("div", "", {
        className: "group",
      });
      groupEl.appendChild(createElement("span", group.label));

      const buttonContainer = createElement("div", "", {
        className: "btnContainer",
      });

      group.buttons.forEach((button) => {
        // Create button with empty text content initially
        const buttonEl = createElement("button", "", {
          disabled: group.type !== "generate",
          dataset: {
            buttonType: group.type,
          },
          onclick: () => this.#actionHandlers[button.action](),
          // Add aria-label for accessibility
          ariaLabel: button.text,
        });
        buttonEl.classList.add("fg-muted");

        // Create icon container
        const iconContainer = createElement("span", "", {
          className: "icon-container",
        });

        // Add each icon from the button config
        button.icons.forEach(iconUrl => {
          const iconEl = createElement("img", "", {
            src: iconUrl,
            alt: "",  // Empty alt since we have aria-label on button
            className: "button-icon",
          });
          iconContainer.appendChild(iconEl);
        });

        // Add icon container to button
        buttonEl.appendChild(iconContainer);

        // Store button reference
        this.#buttons.set(button.action, buttonEl);

        buttonContainer.appendChild(buttonEl);
      });

      groupEl.appendChild(buttonContainer);
      fragment.appendChild(groupEl);
    });

 
    const iconContainer = createElement("span", "", {
      className: "icon-container"
    })
    const closeButton = createElement("button", "", {
      className: "close fg-muted",
      onclick: () => this.unload(),
      ariaLabel: "Close toolbar",
    });
    // Add close icon
    const iconEl = createElement("img", "", {
      src: closeIcon,
      alt: "",
      className: "button-icon",
    });

    iconContainer.appendChild(iconEl);
    closeButton.appendChild(iconContainer);
    fragment.appendChild(closeButton);

    return fragment;
  }

  enableExportButtons() {
    // Update to use Map
    for (const [_, button] of this.#buttons) {
      if (button.dataset.buttonType !== "generate") {
        button.disabled = false;
      }
    }
  }

  /**
    * @public
    * @method handleAllClick
    * @description Processes complete sitemap and generates Mermaid markup
    */
  handleAllClick() {
    const processedNodes = this.processor.processSitemap(this.sitemapArray);
    mermaidStore.setText(this.processor.generateMermaidMarkup(processedNodes));
    this.enableExportButtons();
  }

  /**
    * @public
    * @method handleStartHereClick
    * @description Processes sitemap from current node and generates Mermaid markup
    */
  handleStartHereClick() {
    let currentId = top?.$axure?.page?.shortId;

    if (!currentId) {
      // Access the query string from the top window
      const parentUrlParams = new URLSearchParams(top.location.search);
      currentId = parentUrlParams.get("id");
    }

    if (!currentId) {
      // Deep search in $axure.document.sitemap.rootNodes
      const pageParam = new URLSearchParams(top.location.search).get("p");

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
        mermaidStore.setText(this.processor.generateMermaidMarkup(processedNodes));

        this.enableExportButtons();
      }
    }
  }
  /**
   * @public
   * @method unload
   * @description Removes toolbar from DOM
   */
  unload() {
    this.toolbar?.parentNode?.removeChild(this.toolbar);
  }
}
