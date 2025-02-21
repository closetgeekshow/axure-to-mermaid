const icons = {
  upstream: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTEwIDI0YTYgNiAwIDEgMCAxMiAwYTYgNiAwIDAgMC0xMiAwbTIgMGMwLTIuMjA2IDEuNzk0LTQgNC00czQgMS43OTQgNCA0cy0xLjc5NCA0LTQgNHMtNC0xLjc5NC00LTRNMzAgNWEzIDMgMCAwIDAtNiAwYTIuOTkgMi45OSAwIDAgMCAyIDIuODE2VjEzYTYuMDMgNi4wMyAwIDAgMS0yIDQuNDY3VjE1aC0ydjZoNnYtMmgtMi43MTdBOC4wNCA4LjA0IDAgMCAwIDI4IDEzVjcuODE2QTIuOTkgMi45OSAwIDAgMCAzMCA1bS0zIDFhMSAxIDAgMSAxIDAtMmExIDEgMCAwIDEgMCAybS04LjQxNCA1LjU4NkwxNyAxMy4xNzJWNy44MTZBMi45OTIgMi45OTIgMCAwIDAgMTYgMmEyLjk5MiAyLjk5MiAwIDAgMC0xIDUuODE2djUuMzU2bC0xLjU4Ni0xLjU4NkwxMiAxM2w0IDRsNC00ek0xNiA0YTEgMSAwIDEgMSAwIDJhMSAxIDAgMCAxIDAtMk04IDE1djIuNDY3QTYuMDMgNi4wMyAwIDAgMSA2IDEzVjcuODE2QTIuOTkyIDIuOTkyIDAgMCAwIDUgMmEyLjk5MiAyLjk5MiAwIDAgMC0xIDUuODE2VjEzYTguMDQgOC4wNCAwIDAgMCAyLjcxNyA2SDR2Mmg2di02ek01IDRhMSAxIDAgMSAxIDAgMmExIDEgMCAwIDEgMC0yIi8+PC9zdmc+',
  downstream: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTUgMjRhMyAzIDAgMSAwIDAgNmEzIDMgMCAwIDAgMC02bTAgNGExIDEgMCAxIDEgMC0yYTEgMSAwIDAgMSAwIDJtMTEtNGEzIDMgMCAxIDAgMCA2YTMgMyAwIDAgMCAwLTZtMCA0YTEgMSAwIDEgMSAwLTJhMSAxIDAgMCAxIDAgMm0xMS00YTMgMyAwIDEgMCAwIDZhMyAzIDAgMCAwIDAtNm0wIDRhMSAxIDAgMSAxIDAtMmExIDEgMCAwIDEgMCAybTIuNTg2LTEwLjQxNEwyOCAxOS4xNzJWMTZjMC0zLjU1NC0yLjY2NS02LjQ5Mi02LjEtNi45MzZjLjA2Mi0uMzQ1LjEtLjcuMS0xLjA2NGE2IDYgMCAwIDAtMTIgMGMwIC4zNjQuMDM4LjcxOS4xIDEuMDY0QzYuNjY1IDkuNTA4IDQgMTIuNDQ2IDQgMTZ2My4xNzFsLTEuNTg2LTEuNTg1TDEgMTlsNCA0bDQtNGwtMS40MTQtMS40MTRMNiAxOS4xNzJWMTZjMC0yLjY5NSAyLjE0OC00Ljg4NSA0LjgyLTQuOTgyQTYgNiAwIDAgMCAxNSAxMy45MXY1LjI2MmwtMS41ODYtMS41ODZMMTIgMTlsNCA0bDQtNGwtMS40MTQtMS40MTRMMTcgMTkuMTcyVjEzLjkxYTYgNiAwIDAgMCA0LjE4LTIuODkyQzIzLjg1MiAxMS4xMTUgMjYgMTMuMzA1IDI2IDE2djMuMTcxbC0xLjU4Ni0xLjU4NUwyMyAxOWw0IDRsNC00ek0xNiAxMmMtMi4yMDYgMC00LTEuNzk0LTQtNHMxLjc5NC00IDQtNHM0IDEuNzk0IDQgNHMtMS43OTQgNC00IDQiLz48L3N2Zz4=',
  svg: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTMwIDIzaC02YTIgMiAwIDAgMS0yLTJWMTFhMiAyIDAgMCAxIDItMmg2djJoLTZ2MTBoNHYtNGgtMnYtMmg0ek0xOCA5bC0yIDEzbC0yLTEzaC0ybDIuNTIgMTRoMi45NkwyMCA5ek04IDIzSDJ2LTJoNnYtNEg0YTIgMiAwIDAgMS0yLTJ2LTRhMiAyIDAgMCAxIDItMmg2djJINHY0aDRhMiAyIDAgMCAxIDIgMnY0YTIgMiAwIDAgMS0yIDIiLz48L3N2Zz4=',
  png: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTMwIDIzaC02YTIgMiAwIDAgMS0yLTJWMTFhMiAyIDAgMCAxIDItMmg2djJoLTZ2MTBoNHYtNGgtMnYtMmg0em0tMTItNEwxNC4zMiA5SDEydjE0aDJWMTNsMy42OCAxMEgyMFY5aC0yek00IDIzSDJWOWg2YTIgMiAwIDAgMSAyIDJ2NWEyIDIgMCAwIDEtMiAySDR6bTAtN2g0di01SDR6Ii8+PC9zdmc+',
  txt: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTIxIDExaDN2MTJoMlYxMWgzVjloLTh6bS0xLTJoLTJsLTIgNmwtMi02aC0ybDIuNzUgN0wxMiAyM2gybDItNmwyIDZoMmwtMi43NS03ek0zIDExaDN2MTJoMlYxMWgzVjlIM3oiLz48L3N2Zz4=',
  copy: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTI4IDEwdjE4SDEwVjEwem0wLTJIMTBhMiAyIDAgMCAwLTIgMnYxOGEyIDIgMCAwIDAgMiAyaDE4YTIgMiAwIDAgMCAyLTJWMTBhMiAyIDAgMCAwLTItMiIvPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik00IDE4SDJWNGEyIDIgMCAwIDEgMi0yaDE0djJINFoiLz48L3N2Zz4=',
  newTab: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PGRlZnM+PHBhdGggaWQ9ImNhcmJvbk5ld1RhYjAiIGZpbGw9IiNmZmYiIGQ9Ik0yNiAyNkg2VjZoMTBWNEg2YTIgMiAwIDAgMC0yIDJ2MjBhMiAyIDAgMCAwIDIgMmgyMGEyIDIgMCAwIDAgMi0yVjE2aC0yWiIvPjwvZGVmcz48dXNlIGhyZWY9IiNjYXJib25OZXdUYWIwIi8+PHVzZSBocmVmPSIjY2FyYm9uTmV3VGFiMCIvPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0yNiA2VjJoLTJ2NGgtNHYyaDR2NGgyVjhoNFY2eiIvPjwvc3ZnPg==',
  download: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PHBhdGggZmlsbD0iI2ZmZiIgZD0ibTMwIDI1bC0xLjQxNC0xLjQxNEwyNiAyNi4xNzJWMThoLTJ2OC4xNzJsLTIuNTg2LTIuNTg2TDIwIDI1bDUgNXoiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMTggMjhIOFY0aDh2NmEyLjAwNiAyLjAwNiAwIDAgMCAyIDJoNnYzaDJ2LTVhLjkxLjkxIDAgMCAwLS4zLS43bC03LTdBLjkuOSAwIDAgMCAxOCAySDhhMi4wMDYgMi4wMDYgMCAwIDAtMiAydjI0YTIuMDA2IDIuMDA2IDAgMCAwIDIgMmgxMFptMC0yMy42bDUuNiA1LjZIMThaIi8+PC9zdmc+'
};

export const closeIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTE3LjQxNCAxNkwyNiA3LjQxNEwyNC41ODYgNkwxNiAxNC41ODZMNy40MTQgNkw2IDcuNDE0TDE0LjU4NiAxNkw2IDI0LjU4Nkw3LjQxNCAyNkwxNiAxNy40MTRMMjQuNTg2IDI2TDI2IDI0LjU4NnoiLz48L3N2Zz4='

export const buttonConfig = {
  groups: [
    {
      label: "Sitemap", 
      type: "generate",
      buttons: [
        {
          text: "Full",
          icons: [icons.upstream],
          action: "handleAll",
        },
        {
          text: "From Here",
          icons: [icons.downstream],
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
          icons: [icons.copy],
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
          icons: [icons.txt,icons.download],
          action: "handleTxtDownload",
        },
        {
          text: "SVG",
          icons: [icons.svg,icons.download],
          action: "handleSvgDownload",
        },
        {
          text: "PNG",
          icons: [icons.png,icons.download],
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
          icons: [icons.svg,icons.newTab],
          action: "handleSvgUrl",
        },
        {
          text: "PNG",
          icons: [icons.png,icons.newTab],
          action: "handlePngUrl",
        },
      ],
    },
  ],
};

