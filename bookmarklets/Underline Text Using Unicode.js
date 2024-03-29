// @name Underline Text Using Unicode
// @description Underlines the selected text on inputs and textareas using Unicode combining characters. Each character in the selection is combined with the Unicode character U+0332 (COMBINING LOW LINE) to simulate underlining.

(function() {
    // Get the currently active element on the page. This is usually the input field or textarea where the user has made a selection.
    var el = document.activeElement;
    
    // Retrieve the start and end positions of the selection within the input field or textarea.
    var start = el.selectionStart;
    var end = el.selectionEnd;

    // Retrieve the current value of the input field or textarea.
    var val = el.value;

    // Extract the selected text, and replace each non-space character with itself followed by the Unicode combining low line.
    var text = val.substring(start, end).replace(/\S/g, "$&\u0332");

    // Reconstruct the value with the underlined selection inserted back into its original position.
    el.value = val.substring(0, start) + text + val.substring(end);

    // Update the selection to highlight the newly underlined text.
    el.selectionStart = start;
    el.selectionEnd = start + text.length;
})();