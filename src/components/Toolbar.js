import { buttonConfig, BUTTON_TYPES, getSvgUrl } from "../config/buttonConfig.js";
import { CSS } from "../config/constants.js";
import { createElement, copyToClipboard, createIconEl, notify, cleanup } from "../utils/dom.js";
import { asFile } from "../utils/mermaidUtils.js";
import { mermaidStore } from "../store/MermaidStore.js";
import { CSSLoader } from "../utils/cssLoader.js";

export const createToolbar = (processor) => {
  const buttons = new Map();
  let container, shadow, toolbar;

  const enableExportButtons = () => {
    buttons.forEach((button, _, map) => {
      if (button.dataset.buttonType !== BUTTON_TYPES.GENERATE) {
        button.disabled = false;
      }
    });
  };

  const getCurrentNodeId = () => {
    let currentId = top?.$axure?.page?.shortId;
    if (!currentId) {
      const parentUrlParams = new URLSearchParams(top.location.search);
      currentId = parentUrlParams.get("id");
    }
    if (!currentId) {
      const pageParam = new URLSearchParams(top.location.search).get("p");
      if (pageParam) {
        const findNodeByUrl = (nodes) => {
          for (const node of nodes) {
            if (node.url && node.url.replace(".html", "") === pageParam) {
              return node.id;
            }
            if (node.children) {
              const found = findNodeByUrl(node.children);
              if (found) return found;
            }
          }
          return null;
        };
        currentId = findNodeByUrl($axure.document.sitemap.rootNodes);
      }
    }
    return currentId;
  };

  const actionHandlers = {
    handleAll: () => {
      const diagram = processor.generateMermaidMarkup();
      mermaidStore.setState({ diagram });
      enableExportButtons();
    },
    handleStartHere: () => {
      const currentId = getCurrentNodeId();
      if (currentId) {
        const diagram = processor.generateMermaidMarkup(currentId);
        mermaidStore.setState({ diagram });
        enableExportButtons();
      }
    },
    handleCopy: () => copyToClipboard(),
    handleTxtDownload: () => asFile.txt(),
    handleSvgDownload: async () => await asFile.svg(true),
    handlePngDownload: async () => await asFile.png(true),
    handleSvgUrl: async () => await asFile.svg(),
    handlePngUrl: async () => await asFile.png(),
  };
  const loadCSSInShadow = async (shadow) => {  // Change parameter to shadow
    // Add base styles to shadow root
    const baseStyle = createElement("style", CSS.base);
    shadow.appendChild(baseStyle);

    toolbar.style.visibility = 'hidden';

    try {
      // Load external styles into shadow root
      const matchaStyle = createElement("link", "", {
        rel: "stylesheet",
        href: "https://matcha.mizu.sh/matcha.css"
      });
      shadow.appendChild(matchaStyle);
      
      await new Promise((resolve, reject) => {
        matchaStyle.onload = resolve;
        matchaStyle.onerror = reject;
      });
      
      toolbar.style.visibility = "visible";
    } catch (error) {
      const fallbackStyle = createElement("style", CSS.fallback);
      shadow.appendChild(fallbackStyle);
      toolbar.style.visibility = "visible";
      notify.error("Style loading", error);
    }
  };

  const createButtons = () => {
    const fragment = document.createDocumentFragment();

    buttonConfig.groups.forEach((group) => {
      const groupEl = createElement("div", "", { className: "group" });
      groupEl.appendChild(createElement("span", group.label));

      const buttonContainer = createElement("div", "", {
        className: "btnContainer",
      });

      group.buttons.forEach((button) => {
        const buttonEl = createElement("button", "", {
          disabled: group.type !== BUTTON_TYPES.GENERATE,
          dataset: {
            buttonType: group.type,
            action: button.action,
          },
          ariaLabel: button.ariaLabel,
          className: "fg-muted",
        });

        const iconContainer = createElement("span", "", {
          className: "icon-container",
        });
        
        button.icons.forEach((name) => {
          iconContainer.appendChild(
            createIconEl(getSvgUrl(name), button.ariaLabel, "button-icon")
          );
        });

        buttonEl.appendChild(iconContainer);
        buttons.set(button.action, buttonEl);
        buttonContainer.appendChild(buttonEl);
      });

      groupEl.appendChild(buttonContainer);
      fragment.appendChild(groupEl);
    });

    fragment.appendChild(createCloseButton());
    return fragment;
  };

  const createCloseButton = () => {
    const iconContainer = createElement("span", "", {
      className: "icon-container",
    });
    const closeButton = createElement("button", "", {
      className: "close fg-muted",
      ariaLabel: "Close toolbar",
    });

    iconContainer.appendChild(
      createIconEl(getSvgUrl("close--large"), "", "button-icon")
    );
    closeButton.appendChild(iconContainer);
    closeButton.addEventListener("click", unload);
    return closeButton;
  };

  const handleToolbarClick = (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    const action = button.dataset.action;
    if (action && actionHandlers[action]) {
      actionHandlers[action]();
    }
  };

  const unload = () => {
    if (container && container.parentNode) {
      cleanup(toolbar);
      CSSLoader.unload("https://matcha.mizu.sh/matcha.css");
      container.parentNode.removeChild(container);
    }
  };

  container = createElement("div", "", { id: "xaxGeneric" });
  shadow = container.attachShadow({ mode: "open" });
  toolbar = createElement("div", "", {
    className: "toolbar bd-default bg-muted",
  });

  loadCSSInShadow(shadow);  // Pass shadow instead of container
  toolbar.appendChild(createButtons());
  toolbar.addEventListener("click", handleToolbarClick);
  shadow.appendChild(toolbar);
  document.body.appendChild(container);

  return {
    unload,
  };
};