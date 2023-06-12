javascript:(function()%7Bif%20(typeof%20%24axure%20!%3D%3D%20%22undefined%22)%20%7B%20%0A%20%20%20%20%2F*%20Configuration%20Start%20*%2F%0A%20%20%20%20const%20columnOrder%20%3D%20%5B%22id%22%2C%20%22page%22%2C%20%22type%22%2C%20%22url%22%5D%3B%20%2F%2F%20default%3A%20%5B%22id%22%2C%22page%22%2C%22type%22%2C%22url%22%5D%0A%20%20%20%20const%20includeHeader%20%3D%20true%3B%20%2F%2F%20set%20to%20true%20to%20include%20column%20names%20in%20first%20row%20of%20output%20%0A%20%20%20%20const%20indentChildren%20%3D%20true%3B%20%2F%2F%20set%20to%20true%20to%20prepend%20child%20page%20names%20with%20spaces%0A%20%20%20%20const%20indentSpaces%20%3D%204%3B%20%2F%2F%20the%20number%20of%20spaces%20to%20indent%20by%0A%20%20%20%20%2F*%20Configuration%20End%20*%2F%0A%20%20%20%20const%20sitemapArray%20%3D%20%24axure.document.sitemap.rootNodes%3B%0A%20%20%20%20let%20tsvData%20%3D%20%5B%5D%3B%0A%20%20%0A%20%20%20%20tsvData%20%3D%20traverseAndCopyTree(sitemapArray)%3B%0A%20%20%20%20if%20(includeHeader)%20%7B%0A%20%20%20%20%20%20tsvData.unshift(columnOrder)%3B%0A%20%20%20%20%7D%0A%20%20%0A%20%20%20%20const%20tsvOutput%20%3D%20convertToTSV(tsvData)%3B%0A%20%20%20%20copyToClipboard(tsvOutput)%3B%0A%20%20%0A%20%20%20%20function%20traverseAndCopyTree(tree%2C%20level%20%3D%200)%20%7B%0A%20%20%20%20%20%20const%20convertedTree%20%3D%20%5B%5D%3B%0A%20%20%0A%20%20%20%20%20%20for%20(const%20node%20of%20tree)%20%7B%0A%20%20%20%20%20%20%20%20const%20%7B%20id%2C%20pageName%3A%20page%2C%20type%2C%20url%2C%20children%20%7D%20%3D%20node%3B%0A%20%20%20%20%20%20%20%20const%20indent%20%3D%20indentChildren%20%3F%20'%20'.repeat(indentSpaces%20*%20level)%20%3A%20''%3B%0A%20%20%20%20%20%20%20%20const%20indentedPage%20%3D%20indent%20%2B%20page%3B%0A%20%20%20%20%20%20%20%20const%20row%20%3D%20columnOrder.map(column%20%3D%3E%20%7B%0A%20%20%20%20%20%20%20%20%20%20switch%20(column)%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20case%20%22id%22%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%20id%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20case%20%22page%22%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%20indentedPage%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20case%20%22type%22%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%20type%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20case%20%22url%22%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%20url%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20default%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%20%22%22%3B%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%7D)%3B%0A%20%20%0A%20%20%20%20%20%20%20%20convertedTree.push(row)%3B%0A%20%20%0A%20%20%20%20%20%20%20%20if%20(children%20%26%26%20children.length%20%3E%200)%20%7B%0A%20%20%20%20%20%20%20%20%20%20const%20childRows%20%3D%20traverseAndCopyTree(children%2C%20level%20%2B%201)%3B%0A%20%20%20%20%20%20%20%20%20%20convertedTree.push(...childRows)%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%0A%20%20%20%20%20%20return%20convertedTree%3B%0A%20%20%20%20%7D%0A%20%20%0A%20%20%20%20function%20convertToTSV(data)%20%7B%0A%20%20%20%20%20%20let%20tsv%20%3D%20''%3B%0A%20%20%20%20%20%20for%20(let%20i%20%3D%200%3B%20i%20%3C%20data.length%3B%20i%2B%2B)%20%7B%0A%20%20%20%20%20%20%20%20const%20row%20%3D%20data%5Bi%5D%3B%0A%20%20%20%20%20%20%20%20tsv%20%2B%3D%20row.join('%5Ct')%20%2B%20'%5Cn'%3B%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20return%20tsv%3B%0A%20%20%20%20%7D%0A%20%20%0A%20%20%20%20function%20copyToClipboard(copyText)%20%7B%0A%20%20%20%20%20%20const%20textarea%20%3D%20document.createElement(%22textarea%22)%3B%0A%20%20%20%20%20%20textarea.value%20%3D%20copyText%3B%0A%20%20%0A%20%20%20%20%20%20document.body.appendChild(textarea)%3B%0A%20%20%20%20%20%20textarea.select()%3B%0A%20%20%20%20%20%20document.execCommand(%22copy%22)%3B%0A%20%20%20%20%20%20document.body.removeChild(textarea)%3B%0A%20%20%20%20%7D%0A%7D%7D)()%3B