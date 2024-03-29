// @name Link to Text Fragment
// @description Updates URL to link to the selected text on the page.

javascript:(function() {
    const selection = window.getSelection().getRangeAt(0).toString().trim();
    if (!selection) {
        return alert('Please select some text on the page.');
    }
    const baseUri = window.location.href.split('#')[0];
    const newUrl = `${baseUri}#:~:text=${encodeURIComponent(selection)}`;
    window.location.href = newUrl;
})();