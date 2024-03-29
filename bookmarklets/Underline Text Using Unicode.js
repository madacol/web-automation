// @name Underline Text Using Unicode
// @description Underlines selected texts in inputs and textareas. Each character in the selection is combined with the Unicode character U+0332 (COMBINING LOW LINE) to simulate underlining.

(function() {
    /** @type {HTMLInputElement | HTMLTextAreaElement} */
    const input = document.activeElement;

    // Check if the active element is an input or textarea
    if (!['INPUT', 'TEXTAREA'].includes(input.tagName)) {
        return alert('Please select some text in an input or textarea.');
    }

    const { value, selectionStart, selectionEnd } = input;

    // Extract the selected text, and replace each non-space character with itself followed by the Unicode combining low line.
    const selectedText = value.substring(selectionStart, selectionEnd);
    const newText = selectedText.replace(/\S/g, "$&\u0332");

    // Reconstruct the value with the underlined selection inserted back into its original position.
    input.value = value.split(selectedText).join(newText);

    // Update the selection to highlight the newly underlined text.
    input.selectionStart = selectionStart;
    input.selectionEnd = selectionStart + newText.length;
})();