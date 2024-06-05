// @name Js to Bookmarklet
// @description Show a bookmarklet link with the selected JavaScript code.

(function(){
    // Get selected text
    const selection = window.getSelection ? window.getSelection().toString() : document.selection.createRange().text;
    if (!selection) return alert("Please select some JavaScript code.");

    // Create bookmarklet link
    const a = document.createElement('a');
    a.href = `javascript:(()=>{${encodeURIComponent(selection)}})();`;
    a.textContent = 'Drag to bookmarks bar to save.';
    a.style.display = 'block';

    // Show link in a modal
    showModal(a);

    function showModal(HtmlContent) {
        const modal = document.createElement('div');
        const modalContent = document.createElement('div');
        // close modal when clicking outside of it
        modal.onclick = e => { if (e.target === modal) modal.remove(); };

        modalContent.appendChild(HtmlContent);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Style modal
        modal.style.position = 'fixed';
        modal.style.zIndex = 10000;
        modal.style.left = '0';
        modal.style.top = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modalContent.style.backgroundColor = '#fff';
        modalContent.style.padding = '20px';
        modalContent.style.borderRadius = '5px';
    }
})();