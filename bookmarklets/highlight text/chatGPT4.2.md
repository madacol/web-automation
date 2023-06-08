# Bookmarklet: Highlight Selected Text 2023-06-08T21:36:47.768Z

## HUMAN:

Make a bookmarklet that highlights currently selected text.
It should work even when the selection range spans accross multiple nodes.
It should wrap each node in a &lt;p&gt; and just highlight the selected part with &lt;mark&gt;
Those  added &lt;p&gt; elements should have its style resetted
Use modern javascript.

## CHATGPT:

Creating a bookmarklet to highlight selected text across multiple nodes is not straightforward because the Web APIs do not provide a straightforward method to do this. However, we can use the <code>Range</code> object, which represents a fragment of a document that can contain nodes, part of nodes, or just points, and the <code>window.getSelection()</code> method to get the currently selected text.

In this case, you'll want to:

1. Get the selected range from the user's current selection.

2. Iterate over each node in the range.

3. Replace the selected portion of the text in the node with a <mark> element that contains the selected text.

4. Wrap each node in a <p> with reset styles.

Here's an example bookmarklet that achieves this:


```javascript
javascript:(function() {
    // Get the user's current selection
    let sel = window.getSelection();
    if (!sel.rangeCount) return;

    // Get the range
    let range = sel.getRangeAt(0);

    // Create a document fragment from the range
    let fragment = range.cloneContents();
    let div = document.createElement('div');
    div.appendChild(fragment);

    // Get all text nodes in the range
    let textNodes = div.querySelectorAll('*');
    for (let i = 0; i < textNodes.length; i++) {
        let node = textNodes[i];

        // Replace the node's text with a <mark> element that contains the text
        let mark = document.createElement('mark');
        mark.textContent = node.textContent;
        node.textContent = '';

        // Create a new <p> element with reset styles
        let p = document.createElement('p');
        p.style.all = 'initial';
        p.style.padding = '0';
        p.style.margin = '0';

        // Append the <mark> element to the <p>
        p.appendChild(mark);

        // Replace the node with the new <p> element
        node.parentNode.replaceChild(p, node);
    }

    // Replace the range's contents with the modified fragment
    range.deleteContents();
    range.insertNode(div.firstChild);

    // Deselect the current selection
    window.getSelection().removeAllRanges();
})();
```

This will create a bookmarklet that gets the user's current selection, wraps each text node in a <code>&lt;p&gt;</code> element, and replaces the selected portion of each text node with a <code>&lt;mark&gt;</code> element that contains the selected text. The styles of the <code>&lt;p&gt;</code> elements are reset to avoid any issues with inherited styles. After modifying the document fragment, the original selection is replaced with the modified fragment and the selection is cleared.

To use this bookmarklet, you can create a new bookmark in your browser and paste the above code as the URL. Then, you can select some text on a webpage and click the bookmark to highlight the selected text.

## HUMAN:

Let's do something different.

I have this function

```js

    /**
     * Helper function to retrieve all text nodes within a range
     * @param {Range} range
     * @returns {Node[]}
     */
    function getSelectedNodes(range) {
        let node = range.startContainer;
        let endNode = range.endContainer;

        // Special case for a selection that spans a single node
        if (node == endNode) {
            return [node];
        }

        // Iterate through the ancestor nodes until a common parent is found
        let commonAncestor = range.commonAncestorContainer;
        let selectedNodes = [];
        let walker = document.createTreeWalker(commonAncestor, NodeFilter.SHOW_TEXT, null, false);
        while (walker.nextNode()) {
            let node = walker.currentNode;
            if (isNodeInSelection(node, range)) {
                selectedNodes.push(node);
            }
        }

        return selectedNodes;
    }
```

I want it to return Range[], i.e. a range for each text node

## CHATGPT:

Here's a modification of your function that will return a <code>Range</code> object for each text node within the given <code>Range</code>. The <code>Range</code> object represents a fragment of a document that can contain nodes, partial nodes, or just points. We are using the <code>Range.setStart()</code> and <code>Range.setEnd()</code> methods to define the range of each text node:


```javascript
/**
 * Helper function to retrieve a range for each text node within a range
 * @param {Range} range
 * @returns {Range[]}
 */
function getSelectedNodes(range) {
    let startNode = range.startContainer;
    let endNode = range.endContainer;

    // Special case for a range that spans a single node
    if (startNode === endNode) {
        return [range];
    }

    // Iterate through the ancestor nodes until a common parent is found
    let commonAncestor = range.commonAncestorContainer;
    let selectedRanges = [];
    let walker = document.createTreeWalker(commonAncestor, NodeFilter.SHOW_TEXT);

    let currentNode = walker.currentNode;
    while (currentNode) {
        if (range.intersectsNode(currentNode)) {
            let nodeRange = document.createRange();

            // If this is the start node, set the start of the range to the original start
            if (currentNode === startNode) {
                nodeRange.setStart(startNode, range.startOffset);
            } else {
                nodeRange.setStart(currentNode, 0);
            }

            // If this is the end node, set the end of the range to the original end
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
```

This version of the function iterates over all the text nodes in the common ancestor of the start and end nodes of the given range. For each text node that intersects with the given range, it creates a new <code>Range</code> that spans that text node and adds it to the list of selected ranges. If the text node is the start or end node of the given range, it sets the start or end of the new range to the start or end of the given range, respectively.

