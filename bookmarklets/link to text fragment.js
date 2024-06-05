// @name Link to selected text
// @description Creates a link that scrolls to the selected text on the page, and copies it to the clipboard.

(function() {
    const selection = window.getSelection().getRangeAt(0).toString().trim();
    if (!selection) {
        return alert('Please select some text on the page.');
    }
    const baseUri = window.location.href.split('#')[0];
    const newUrl = `${baseUri}#:~:text=${encodeURIComponent(selection)}`;

    // Copy selected text to clipboard
    navigator.clipboard.writeText(newUrl)
        .then(() => alert('Link copied to clipboard.'))
})();