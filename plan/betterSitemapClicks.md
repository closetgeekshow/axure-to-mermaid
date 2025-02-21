

```js
 handleGenerateClick(startNodeId = null) {
    const mermaidText = this.processor.generateMermaidMarkup(startNodeId);
    mermaidStore.setText(mermaidText);
    this.enableExportButtons();
  }

  // Replace handleAllClick and handleStartHereClick with this:
  handleAllClick() {
    this.handleGenerateClick(); // No startNodeId means full sitemap
  }

  handleStartHereClick() {
    let currentId = top?.$axure?.page?.shortId;

    if (!currentId) {
      const parentUrlParams = new URLSearchParams(top.location.search);
      currentId = parentUrlParams.get("id");
    }

    if (!currentId) {
      const pageParam = new URLSearchParams(top.location.search).get("p");
      if (pageParam) {
        currentId = this.findNodeByUrl($axure.document.sitemap.rootNodes, pageParam);
      }
    }

    if (currentId) {
      this.handleGenerateClick(currentId); // Start from the current node
    }
  }
  ```