javascript: (function() {
    let selection = window.getSelection();
    if (selection?.toString() === "") {
        return alert('Please select some text on the page.');
    }
    for (let j = 0; j < selection.rangeCount; j++) {
        const range = selection.getRangeAt(j);

        /* Split the range for each text node within the selection */
        let selectedRanges = splitRangeForEachNode(range);
        for (let i = 0; i < selectedRanges.length; i++) {
            let nodeRange = selectedRanges[i];

            let selectedText = nodeRange.toString();

            if (selectedText.trim() === '') {
                continue;
            }

            let textNode = document.createTextNode(selectedText);
            let highlightedNode = document.createElement('mark');
            highlightedNode.appendChild(textNode);

            nodeRange.deleteContents();
            nodeRange.insertNode(highlightedNode);
        }
    }

    selection.empty();

    /**
     * Helper function to retrieve a range for each text node within a range
     * @param {Range} range
     * @returns {Range[]}
     */
    function splitRangeForEachNode(range) {
        let startNode = range.startContainer;
        let endNode = range.endContainer;

        /* Special case for a range that spans a single node */
        if (startNode === endNode) {
            return [range];
        }

        /* Iterate through the ancestor nodes until a common parent is found */
        let commonAncestor = range.commonAncestorContainer;
        let selectedRanges = [];
        let walker = document.createTreeWalker(commonAncestor, NodeFilter.SHOW_TEXT);

        let currentNode = walker.currentNode;
        while (currentNode) {
            if (range.intersectsNode(currentNode)) {
                let nodeRange = document.createRange();

                /* If this is the start node, set the start of the range to the original start */
                if (currentNode === startNode) {
                    nodeRange.setStart(startNode, range.startOffset);
                } else {
                    nodeRange.setStart(currentNode, 0);
                }

                /* If this is the end node, set the end of the range to the original end */
                if (currentNode === endNode) {
                    nodeRange.setEnd(endNode, range.endOffset);
                } else {
                    nodeRange.setEnd(currentNode, currentNode.length);
                }

                selectedRanges.push(nodeRange);
            }
            currentNode = walker.nextNode();
        }

        return selectedRanges;
    }
})();

