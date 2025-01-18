if (typeof $axure !== "undefined") { 
    /* Configuration Start */
    const projectID = $axure.document.configuration.prototypeId;
    /* Configuration End */
    const sitemapArray = $axure.document.sitemap.rootNodes;
      
    let mermaidText;
  
    /* Walk the sitemapArray and its children 
     * for each node record: nesting level, id, pageName, type and an array of direct child ids 
     * sort array by nesting level
    */
    ``
    
    copyToClipboard(mermaidText);
  
    function copyToClipboard(copyText) {
      const textarea = document.createElement("textarea");
      textarea.value = copyText;
  
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
}
