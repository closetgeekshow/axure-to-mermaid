# Axure to Mermaid Bookmarklet

This bookmarklet script allows you to convert Axure prototypes into Mermaid diagrams directly in your browser. It generates a toolbar that lets you export the sitemap as Mermaid markup, which can be copied, downloaded as TXT, SVG, or PNG, or shared via URL.

## Installation

1. Copy the contents of [`dist/axure-to-mermaid.bundle-processed.js`](dist/axure-to-mermaid.bundle-processed.js)
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
- Download Mermaid diagrams as TXT, SVG, or PNG.
- Share diagrams via URL.

## Notes
- Ensure that the Axure prototype is fully loaded before running the bookmarklet.
- The bookmarklet relies on the Axure global object (`$axure`), so it only works inside the Axure prototype player.
