// @name Js to Bookmarklet
// @description Show a bookmarklet link with the selected JavaScript code.

(function(){
    // Get selected text
    const selection = window.getSelection ? window.getSelection().toString() : document.selection.createRange().text;
    if (!selection) return alert("Please select some JavaScript code.");

    // validate it is valid javascript code
    try { new Function(selection); } catch (e) { return alert("Invalid JavaScript code selected."); }

    // Create bookmarklet link
    const a = document.createElement('a');
    a.href = `javascript:(()=>{${encodeURIComponent(selection)}})();`;
    a.textContent = 'Drag to bookmarks bar to save.';

    // Show link in a modal
    showModal(a);

    function showModal(HtmlContent) {
        const modal = document.createElement('dialog');
        modal.appendChild(HtmlContent);
        document.body.appendChild(modal);
        modal.showModal();
        // close modal when clicking outside its content
        modal.onclick = e => { if (e.target === modal) modal.remove(); };
    }
})();