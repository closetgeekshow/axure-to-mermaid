# axure-to-mermaid 
This script is designed to be used with [Axure RP](https://axure.com) (a phenomenal wireframing tool) prototypes, when it is run it will copy your published sitemap tree as a mermaid flowchart to your clipboard. 

## What is it
This script copies the contents of the **$axure.document.sitemap.rootNodes** object to the clipboard formatted as a mermaid flowchart with each level of the hierarchy grouped together in a subgraph block.

## How to use 
### Quickstart
I have a pregenerated bookmarklet, just click the bookmarklet to copy your sitemap to the clipboard and paste it into your favorite mermaid editor such as [Mermaid Live Editor](https://mermaid.live/)

### Paste in console
This script can be pasted into the console in Chrome and Edge (it runs into a security issue on Firefox), but this will get annoying over time. I think a bookmarklet will make for a better experience, but it does have a few manual steps. 

### Convert to a bookmarket 
1. It can be converted to a bookmarklet and placed in your bookmark toolbar for quick access, I don't quite understand what that process entails but I used this tool and it works fine: https://chriszarate.github.io/bookmarkleter/
2. Add a bookmark to Chrome or Firefox, and paste the converted javascript of either of these files as the URL for the bookmarket.
3. Click on the bookmark to copy the sitemap to the clipboard
4. Paste inside a spreadsheet or an Axure Repeater for reuse

## Contact
Brent Morris

Twitter: [@closetgeekshow](https://twitter.com/closetgeekshow) | Mastodon: [@closetgeekshow@c.im](https://c.im/@Closetgeekshow) | Email: [closetgeekshow@gmail.com](mailto:closetgeekshow@gmail.com)

Project Link: [https://github.com/closetgeekshow/AxureCopySitemap](https://github.com/closetgeekshow/AxureCopySitemap)
