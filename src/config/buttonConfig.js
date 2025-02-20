export const buttonConfig = {
  groups: [
    {
      label: "Sitemap", 
      type: "generate",
      buttons: [
        {
          text: "Full",
          action: "handleAll",
        },
        {
          text: "From Here",
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
          action: "handleTxtDownload",
        },
        {
          text: "SVG",
          action: "handleSvgDownload",
        },
        {
          text: "PNG",
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
          action: "handleSvgUrl",
        },
        {
          text: "PNG",
          action: "handlePngUrl",
        },
      ],
    },
  ],
};