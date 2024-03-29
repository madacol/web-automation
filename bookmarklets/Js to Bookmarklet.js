// @name Js to Bookmarklet
// @description Minify selected JavaScript code and create a bookmarklet link.

javascript:(function(){
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/terser/dist/bundle.min.js';
    script.onload = async function() {

        /**
         * Minify selected JavaScript code
         */
        const selection = window.getSelection ? window.getSelection().toString() : document.selection.createRange().text;
        if (!selection) return alert("Please select some JavaScript code to minify.");
        const minified = await Terser.minify(selection).catch(e => alert(`Error: ${e.message}`));

        /**
         * Create modal with minified code
         */
        const modal = document.createElement('div');
        const modalContent = document.createElement('div');
        modal.onclick = (e) => {
            /* close modal when clicking outside the modalContent */
            if (e.target === modal) modal.remove();
        };

        const a = document.createElement('a');
        a.href = `javascript:(function(){${encodeURIComponent(minified.code)}})();`;
        a.textContent = 'Drag to bookmarks bar to save.';

        modalContent.appendChild(a);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        /**
         * Style modal and content
         */
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
        a.style.display = 'block';
    };
    document.body.appendChild(script);
})();
