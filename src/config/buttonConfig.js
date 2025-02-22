const iconCDN = "https://cdn.jsdelivr.net/npm/@carbon/icons/svg/32/";

export function getIcon(name) {
  return `${iconCDN}${name}.svg`
}

export const buttonConfig = {
  groups: [
    {
      label: "Sitemap", 
      type: "generate",
      buttons: [
        {
          text: "Full",
          icons: ["upstream"],
          action: "handleAll",
        },
        {
          text: "From Here",
          icons: ["downstream"],
          action: "handleStartHere",
        },
      ],
    },
    {
      label: "Code",
      type: "copy",
      buttons: [
        {
          text: "Copy",
          icons: ["copy"],
          action: "handleCopy",
        },
      ],
    },
    {
      label: "Download",
      type: "download",
      buttons: [
        {
          text: "TXT",
          icons: ["txt","download"],
          action: "handleTxtDownload",
        },
        {
          text: "SVG",
          icons: ["svg","download"],
          action: "handleSvgDownload",
        },
        {
          text: "PNG",
          icons: ["png","download"],
          action: "handlePngDownload",
        },
      ],
    },
    {
      label: "URL",
      type: "url",
      buttons: [
        {
          text: "SVG",
          icons: ["svg","new-tab"],
          action: "handleSvgUrl",
        },
        {
          text: "PNG",
          icons: ["icons","new-tab"],
          action: "handlePngUrl",
        },
      ],
    },
  ],
};

