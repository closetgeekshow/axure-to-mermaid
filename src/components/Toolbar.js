import { CONFIG } from '../config/constants.js';
import { createElement, copyToClipboard } from '../utils/dom.js';
import { handleTxtExport, handleSvgExport, handlePngExport } from '../utils/exportHandlers.js';

/**
 * @file Toolbar component for managing sitemap visualization controls
 * @module Toolbar
 * @requires CONFIG
 * @requires createElement
 * @requires copyToClipboard
 * @requires handleTxtExport
 * @requires handleSvgExport
 * @requires handlePngExport
 */

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
              ...CONFIG.toolbar.style
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
      const getIcon = (type) => ({
          copy: '📋',
          download: '📄',
          url: '🔗',
          generate: ''
      }[type] || '');

      return Object.entries(CONFIG.buttons).reduce((buttons, [key, config]) => {
          buttons[key] = createElement('button', `${getIcon(config.type)}${config.text}`, {
              disabled: config.type !== 'generate',
              dataset: { buttonType: config.type },
              onclick: () => this.handleButtonClick(key, config.type)
          });
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
            copy: () => copyToClipboard(this.currentMermaidText)
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
      const currentId = $axure.page.shortId;
      const selectedNode = this.processor.findCurrentNode(this.sitemapArray, currentId);
      if (selectedNode) {
          const processedNodes = this.processor.processSitemap([selectedNode]);
          this.currentMermaidText = this.processor.generateMermaidMarkup(processedNodes);
          copyToClipboard(this.currentMermaidText);
          this.enableExportButtons();
      }
  }

  /**
   * @public
   * @method enableExportButtons
   * @description Enables all non-generate buttons after markup generation
   */
  enableExportButtons() {
      Object.values(this.buttons).forEach(button => {
          if (button.dataset.buttonType !== 'generate') {
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
    // Add all buttons in the order defined in CONFIG
    Object.keys(CONFIG.buttons).forEach(key => {
        this.toolbar.appendChild(this.buttons[key]);
    });

    // Create and append close button last
    const closeButton = createElement('button', 'X', {
        onclick: () => this.unload()
    });
    this.toolbar.appendChild(closeButton);
}


}