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
        .then(() => {
            const modal = showModal(document.createTextNode(`Copied to clipboard`));
            setTimeout(() => modal.remove(), 2000);
        })

    function showModal(HtmlContent) {
        const modal = document.createElement('dialog');
        modal.appendChild(HtmlContent);
        document.body.appendChild(modal);
        modal.showModal();
        // close modal when clicking outside its content
        modal.onclick = e => { if (e.target === modal) modal.remove(); };
        return modal
    }
})();