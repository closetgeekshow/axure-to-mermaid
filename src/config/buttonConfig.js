const ICON_CDN = "https://cdn.jsdelivr.net/npm/@carbon/icons/svg/32/";

export const BUTTON_TYPES = {
  GENERATE: 'generate',
  COPY: 'copy',
  DOWNLOAD: 'download',
  URL: 'url'
};

export function getSvgUrl(name) {
  return `${ICON_CDN}${name}.svg`;
}

export const buttonConfig = {
  groups: [
    {
      label: "Sitemap", 
      type: BUTTON_TYPES.GENERATE,
      buttons: [
        {
          icons: ["upstream"],
          action: "handleAll",
          ariaLabel: "Generate full sitemap"
        },
        {
          icons: ["downstream"],
          action: "handleStartHere",
          ariaLabel: "Generate sitemap from current page"
        },
      ],
    },
    {
      label: "Code",
      type: BUTTON_TYPES.COPY,
      buttons: [
        {
          icons: ["copy"],
          action: "handleCopy",
          ariaLabel: "Copy diagram code"
        },
      ],
    },
    {
      label: "Download",
      type: BUTTON_TYPES.DOWNLOAD,
      buttons: [
        {
          icons: ["TXT","download"],
          action: "handleTxtDownload",
          ariaLabel: "Download as text file"
        },
        {
          icons: ["SVG","download"],
          action: "handleSvgDownload",
          ariaLabel: "Download as SVG"
        },
        {
          icons: ["PNG","download"],
          action: "handlePngDownload",
          ariaLabel: "Download as PNG"
        },
      ],
    },
    {
      label: "URL",
      type: BUTTON_TYPES.URL,
      buttons: [
        {
          icons: ["SVG","new-tab"],
          action: "handleSvgUrl",
          ariaLabel: "Open SVG in new tab"
        },
        {
          icons: ["PNG","new-tab"],
          action: "handlePngUrl",
          ariaLabel: "Open PNG in new tab"
        },
      ],
    },
  ],
};