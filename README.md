# Axure to Mermaid Bookmarklet

This bookmarklet script allows you to convert [Axure RP](https://axure.com) prototype page trees into [Mermaid flowcharts](https://mermaid.js.org/syntax/flowchart.html) directly in your browser. It generates a toolbar that lets you export the sitemap as Mermaid markup, which can be copied, downloaded as TXT, SVG, or PNG, or shared via URL.

## Installation

1. Copy the contents of [`dist/axure-to-mermaid.bookmarklet.js`](dist/axure-to-mermaid.bundle-processed.js)
2. Add a bookmark on the bookmark toolbar in Chrome, Firefox or Edge
3. Paste it as the URL. Double Check that the URL begins with `javascript:`

## Usage
1. Navigate to an Axure prototype.
2. Click the bookmarklet in your bookmarks toolbar.
3. A toolbar will appear at the bottom right of the page.
4. Use the toolbar to generate and export Mermaid diagrams.

## Features
- Convert the entire sitemap or start from the current page.
- Copy Mermaid markup to the clipboard.
- Download Mermaid diagrams as TXT, SVG, or PNG. [**!**](#warning)
- Share diagrams via URL. [**!**](#warning)

<img src="axure-to-mermaid-screenshot.png" width="550">

## Notes
- Ensure that the Axure prototype is fully loaded before running the bookmarklet.
- The bookmarklet relies on the Axure global object (`$axure`), so it only works inside the Axure prototype player.
- I think it works as a Cloud plugin too

<a name="warning"></a>
> [!WARNING]  
> Features that use Mermaid.Ink will send your chart content to a third-party server.
> If you want to keep things entirely private only use the Copy or TXT buttons and generate the chart yourself using [Mermaid.Live](https://mermaid.live/edit), Mermaid CLI or the [Mermaid JS library](https://github.com/mermaid-js/mermaid).

## "Dependencies"
All dependency scripts are injected from CDN sources to keep bookmarklet at a reasonable size.
* [js-base64](https://github.com/dankogai/js-base64)
* [pako](https://github.com/nodeca/pako)
* [matcha css](https://matcha.mizu.sh/)

## Prior art/inspiration
* [@samuei's subgraph technique](https://stackoverflow.com/a/71036087/24246712)
  * I've added styles to make the subgraphs have no visual component beyond structure
* [Mermaid.Ink](https://mermaid.ink) service allows for the generation of mermaid chart images and PDFs with just a URL

## Future Ideas
* Make it work with the Mermaid JS library instead of Mermaid.Ink. I have mermaid chart generation working in a privste plugin for myself, but I wanted to try to make it work with Mermaid.Ink this time. 
* Label the Mermaid.Ink buttons better or include a warning modal the first time you click one
* styling based on name, hierarchy position, etc.
* annotate the source URL on diagram
* Start From Parent Folder generation method
* configuration options (white background, mermaid config settings, copy on generate)
* responsive toolbar
* Convert Axure Flowcharts to mermaid (this actually looks pretty easy or at least not super hard)
 
## Contact
Bluesky: [@closetgeekshow.ca](https://bsky.app/profile/closetgeekshow.ca) | Mastodon: [@closetgeekshow@c.im](https://c.im/@Closetgeekshow) | Email: [closetgeekshow@gmail.com](mailto:closetgeekshow@gmail.com)

Project Link: https://github.com/closetgeekshow/axure-to-mermaid
