/**
 * @file Toolbar component for managing sitemap visualization controls
 * @module Toolbar
 * @requires BUTTONS
 * @requires LAYOUT
 * @requires createElement
 * @requires copyToClipboard
 * @requires handleTxtExport
 * @requires handleSvgExport
 * @requires handlePngExport
 */

import { BUTTONS, LAYOUT } from "../config/constants.js";
import { createElement, copyToClipboard } from "../utils/dom.js";
import {
  handleTxtExport,
  handleSvgExport,
  handlePngExport,
} from "../utils/exportHandlers.js";

/**
 * @class Toolbar
 * @description Creates and manages the UI toolbar for sitemap visualization controls
 */
export class Toolbar {
  /**
   * @constructor
   * @param {SitemapProcessor} processor - Instance of SitemapProcessor
   * @param {Array} sitemapArray - Array of sitemap nodes
   */
  constructor(processor, sitemapArray) {
    this.processor = processor;
    this.sitemapArray = sitemapArray;
    this.currentMermaidText = '';
    

    this.toolbar = createElement('div', '', {
        style: {
            position: 'fixed',
            display: 'flex',
            flexDirection: 'row',
            bottom: '2vh',
            right: '2vw',
            backgroundColor: 'white',
            padding: '10px',
            border: '1px solid #ccc',
            zIndex: '1000',
            gap: '3ch'
        }
    });
    
    this.buttons = this.createButtons();
    this.attachButtons();
    document.body.appendChild(this.toolbar);
}


  /**
   * @private
   * @method createButtons
   * @returns {Object.<string, HTMLButtonElement>} Map of button keys to button elements
   */
  createButtons() {
    

    return Object.entries(BUTTONS).reduce((buttons, [key, config]) => {
      buttons[key] = createElement(
        "button",
        `${config.text}`,
        {
          disabled: config.type !== "generate",
          dataset: { buttonType: config.type },
          onclick: () => this.handleButtonClick(key, config.type),
        }
      );
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
        startHere: () => this.handleStartHereClick(),
      },
      copy: {
        copy: () => {
          console.log(this.currentMermaidText)
          copyToClipboard(this.currentMermaidText)
        },
      },
      download: {
        txtDownload: () => handleTxtExport(this.currentMermaidText),
        svgDownload: () => handleSvgExport(this.currentMermaidText, true),
        pngDownload: () => handlePngExport(this.currentMermaidText, true),
      },
      url: {
        svgUrl: () => handleSvgExport(this.currentMermaidText),
        pngUrl: () => handlePngExport(this.currentMermaidText),
      },
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
    this.currentMermaidText =
      this.processor.generateMermaidMarkup(processedNodes);
    copyToClipboard(this.currentMermaidText);
    this.enableExportButtons();
  }

  /**
   * @public
   * @method handleStartHereClick
   * @description Processes sitemap from current node and generates Mermaid markup
 */
handleStartHereClick() {
    let currentId = $axure.page.shortId;

    if (!currentId) {
        // Access the query string from the parent window
        const parentUrlParams = new URLSearchParams(window.parent.location.search);
        currentId = parentUrlParams.get('id');
    }

    if (!currentId) {
        // Deep search in $axure.document.sitemap.rootNodes
        const pageParam = new URLSearchParams(window.parent.location.search).get('p');
        if (pageParam) {
            const findNodeByUrl = (nodes) => {
                for (const node of nodes) {
                    if (node.url && node.url.replace('.html', '') === pageParam) {
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
            this.currentMermaidText =
                this.processor.generateMermaidMarkup(processedNodes);
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
      // Create group container
      const group = createElement("div", "", {
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontSize: ".875rem",
          gap: ".25rem"
        },
      });

      // Add label
      const labelElement = createElement("span", label);
      group.appendChild(labelElement);

      // Add button container
      const buttonContainer = createElement("div", "", {
        style: {
          display: "flex",
          gap: ".125rem",
        },
      });

      // Add buttons
      buttonKeys.forEach((key) => {
        buttonContainer.appendChild(this.buttons[key]);
      });

      group.appendChild(buttonContainer);
      this.toolbar.appendChild(group);
    });

    // Create and append close button last
    const closeButton = createElement("button", "X", {
      style: {
        height: "2rem",
        width: "2rem",
        margin: "auto 0"
      },
      onclick: () => this.unload(),
    });
    this.toolbar.appendChild(closeButton);
  }
}
